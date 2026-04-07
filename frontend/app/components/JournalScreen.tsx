'use client';

import React, { useState, useEffect } from 'react';
// Assuming useEmotionAI is in the parent directory or same directory
import { useEmotionAI } from '../useEmotionAI'; 

export default function JournalScreen() {
    // 1. Destructure all needed values from our custom AI hook
    const { stressLevel, dominantEmotion, isModelLoaded, videoRef } = useEmotionAI();
    
    // 2. Component State
    const [theme, setTheme] = useState('bg-slate-50 text-slate-900');
    const [prompt, setPrompt] = useState('Loading private AI engine...');
    const [entryText, setEntryText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 3. Emotional UI Engine: Transitions colors based on real-time stress
    useEffect(() => {
        if (!isModelLoaded) return;

        if (stressLevel > 0.4) {
            // High tension detected -> Shift to calming Teal tones
            setTheme('bg-teal-900 text-teal-50 transition-colors duration-1000');
            setPrompt('I notice some tension. Want to take a deep breath before writing?');
        } else if (dominantEmotion === 'joy') {
            // Joy detected -> Shift to bright, happy tones
            setTheme('bg-yellow-50 text-yellow-900 transition-colors duration-1000');
            setPrompt("You're looking bright! What's making you smile?");
        } else {
            // Relaxed/Neutral state -> Warm Peach tones
            setTheme('bg-orange-50 text-slate-800 transition-colors duration-1000');
            setPrompt("You're looking steady. What's on your mind today?");
        }
    }, [stressLevel, dominantEmotion, isModelLoaded]);

    // 4. Save Function: Bridges Frontend AI with Django Backend
    const saveEntry = async () => {
        if (!entryText.trim()) {
            alert("Your reflection is empty. Try writing a few words first.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/entries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: entryText,
                    stress_score: stressLevel,
                    dominant_emotion: dominantEmotion, 
                }),
            });

            if (response.ok) {
                alert("Reflection saved to your Mood Garden.");
                setEntryText(''); // Clear the textarea
            } else {
                console.error("Server responded with an error");
            }
        } catch (err) {
            console.error("Failed to connect to Django:", err);
            alert("Could not save. Is the Django server running?");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className={`min-h-screen p-8 flex flex-col items-center ${theme}`} suppressHydrationWarning>
            
            {/* The Ambient Video Bubble */}
            <div className='relative w-32 h-32 mb-12'>
                <div className={`absolute inset-0 rounded-full border-4 animate-pulse 
                    ${stressLevel > 0.4 ? 'border-teal-400' : 'border-orange-300'}`}>
                </div>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className='w-full h-full object-cover rounded-full blur-[2px] opacity-80' 
                    suppressHydrationWarning 
                />
            </div>

            {/* Journal Input Area */}
            <div className='w-full max-w-2xl flex flex-col'>
                <h2 className='text-2xl font-light mb-6 opacity-90 transition-opacity duration-700'>
                    {prompt}
                </h2>
                
                <textarea 
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    className='w-full h-80 bg-transparent border-0 border-b-2 border-current focus:ring-0 focus:outline-none resize-none text-xl leading-relaxed placeholder-current/30' 
                    placeholder={isModelLoaded ? "Start typing your thoughts..." : "Initializing AI..."} 
                    disabled={!isModelLoaded} 
                />
                
                {/* Meta Info & Actions */}
                <div className='flex justify-between items-center mt-8'>
                    <div className='text-xs font-mono opacity-50 space-y-1'>
                        <p>Tension: {stressLevel.toFixed(3)}</p>
                        <p>Detected: <span className="uppercase tracking-widest font-bold">{dominantEmotion}</span></p>
                    </div>

                    <button 
                        onClick={saveEntry}
                        disabled={isSaving || !isModelLoaded}
                        className="px-10 py-3 rounded-full border border-current hover:bg-current hover:text-white transition-all disabled:opacity-20 active:scale-95"
                    >
                        {isSaving ? "Saving..." : "Save Reflection"}
                    </button>
                </div>
            </div>
        </main>
    );
}