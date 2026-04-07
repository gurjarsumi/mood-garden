import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const useEmotionAI = () => {
    const [stressLevel, setStressLevel] = useState(0);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        const initializeAI = async () => {
            // 1. Load the WebAssembly binaries localy
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            // 2. Initialize the FaceLandmarker
            landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU", // Force browser to use GPU for 60fps
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
            });

            setIsModelLoaded(true);
            console.log("Model loaded successfully");
            startCamera();
        };
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && videoRef.current) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", predictWebcam);
                    console.log("Camera started");
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Camera access failed. Please check permissions and ensure no other app is using the camera.");
            }
        };
        initializeAI();

        // Cleanup on unmount
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // 3. The Analysis Loop
    const predictWebcam = async () => {
        console.log("Predicting...");
        if (videoRef.current && landmarkerRef.current) {
            const startTimeMs = performance.now();
            const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
            console.log("Prediction results:", results);
            
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const shapes = results.faceBlendshapes[0].categories;

                // Example mapping: Brow Furrowing = Stress
                const browInnerUp = shapes.find(s => s.categoryName === 'browInnerUp')?.score || 0;
                const browDownLeft = shapes.find(s => s.categoryName === 'browDownLeft')?.score || 0;
                const browDownRight = shapes.find(s => s.categoryName === 'browDownRight')?.score || 0;
                
                // Simple aggregate for the prototype
                const calculatedStress = (browDownLeft + browDownRight) / 2;

                // Throttle updates to avoid excessive re-renders
                const now = Date.now();
                if (now - lastUpdateRef.current > 100) { // Update at most every 100ms
                    setStressLevel(calculatedStress);
                    lastUpdateRef.current = now;
                    console.log("Stress level updated:", calculatedStress);
                }
            }
            // Loop seamlessly
            requestAnimationFrame(predictWebcam);
        }
    };
    return { stressLevel, isModelLoaded, videoRef };
};