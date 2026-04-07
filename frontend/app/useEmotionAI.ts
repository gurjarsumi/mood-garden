import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const useEmotionAI = () => {
    const [stressLevel, setStressLevel] = useState(0);
    const [dominantEmotion, setDominantEmotion] = useState("neutral");
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const lastVideoTimeRef = useRef(-1); // To track processed frames

    useEffect(() => {
        const initializeAI = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                
                landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU",
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                });

                setIsModelLoaded(true);
                startCamera();
            } catch (err) {
                setError("Failed to load AI models.");
            }
        };

        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && videoRef.current) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        requestAnimationFrame(predictWebcam); // Start the loop once video is ready
                    };
                }
            } catch (err) {
                setError("Camera access failed.");
            }
        };

        initializeAI();

        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const predictWebcam = async () => {
        if (videoRef.current && landmarkerRef.current && videoRef.current.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            
            const startTimeMs = performance.now();
            const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
            
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const shapes = results.faceBlendshapes[0].categories;
                
                const bDL = shapes.find(s => s.categoryName === 'browDownLeft')?.score || 0;
                const bDR = shapes.find(s => s.categoryName === 'browDownRight')?.score || 0;
                const sL = shapes.find(s => s.categoryName === 'mouthSmileLeft')?.score || 0;
                const sR = shapes.find(s => s.categoryName === 'mouthSmileRight')?.score || 0;
                const eyeSquint = ((shapes.find(s => s.categoryName === 'eyeSquintLeft')?.score || 0) + 
                                   (shapes.find(s => s.categoryName === 'eyeSquintRight')?.score || 0)) / 2;

                const avgBrowDown = (bDL + bDR) / 2;
                const avgSmile = (sL + sR) / 2;

                let currentStatus = "neutral";
                if (avgBrowDown > 0.4 && eyeSquint > 0.2) currentStatus = "stressed";
                else if (avgSmile > 0.5) currentStatus = "joy";
                else if (avgBrowDown > 0.5 && avgSmile < 0.1) currentStatus = "sadness";

                setStressLevel(avgBrowDown);
                setDominantEmotion(currentStatus);
            }
        }
        requestAnimationFrame(predictWebcam);
    };

    return { stressLevel, dominantEmotion, isModelLoaded, videoRef, error };
};