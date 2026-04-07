'use client'; // Required for Next.js 13+ to use client-side features

import React, { useState, useEffect } from 'react';
import { useEmotionAI } from '../useEmotionAI';

export default function JournalScreen() {
    const { stressLevel, isModelLoaded, videoRef } = useEmotionAI();
    const [theme, setTheme] = useState('bg-slate-50 text-slate-900');
    const [prompt, setPrompt] = useState('Loading private AI engine...');
    const [error, setError] = useState<string | null>(null);

    // The Emotional Logic Engine
    useEffect(() => {
        if (!isModelLoaded) return;

        if (stressLevel > 0.4) {
            // High tension detected -> Shift to calming cool tones
            setTheme('bg-teal-900 text-teal-50 transition-colors ducration-1000');
            setPrompt('I notice some tension. Want to take a deep breath before we writing?');
            
        } else {
            // Relaxed state -> Warm/neutral
            setTheme('bg-orange-50 text-slate-800 transition-colors duration-1000');
            setPrompt("You're looking steady. What's on your mind today?");
        }
    }, [stressLevel, isModelLoaded]);

    return (
        <main className={`min-h-screen p-8 flex flex-col items-center ${theme}`} suppressHydrationWarning={true}>
            {/* The Ambient Video Bubble */}
            <div className='relative w-32 h-32 mb-12'>
                <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${stressLevel > 0.4 ? 'border-teal-400' : 'border-orange-300'}`}>
                </div>
                <video ref={videoRef} autoPlay playsInline muted className='w-full h-full object-cover rounded-full blur-[2px]' suppressHydrationWarning={true} />
                {/* Privacy overlay icon could go here */}
            </div>

            {/* Journal Input Area */}
            <div className='w-full max-w-2xl flex flex-col'>
                {error && <p className='text-red-500 mb-4'>{error}</p>}
                <h2 className='text-2xl font-light mb-6 opacity-90 transition-opacity'>{prompt}</h2>
                <textarea className='w-full h-96 bg-transparent border-0 border-b-2 border-current focus:ring-0 focus:outline-none resize-none text-xl leading-relaxed placeholder-current/50' placeholder={isModelLoaded ? "Start typing..." : ""} disabled={!isModelLoaded} />
                
                {/* Debug UI - remove before production */}
                <div className='mt-4 text-xs font-mono opacity-50'>
                    Raw Tension Score: {stressLevel.toFixed(3)}
                </div>
            </div>
        </main>
    );
}