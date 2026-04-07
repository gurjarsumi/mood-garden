'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MoodDashboard from './components/MoodDashboard';

const JournalScreen = dynamic(() => import('./components/JournalScreen'), { ssr: false });

export default function Home() {
  const [view, setView] = useState<'journal' | 'garden'>('journal');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Toggle Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200">
        <button 
          onClick={() => setView('journal')}
          className={`px-4 py-1 rounded-full text-sm transition-all ${view === 'journal' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
        >
          Journal
        </button>
        <button 
          onClick={() => setView('garden')}
          className={`px-4 py-1 rounded-full text-sm transition-all ${view === 'garden' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
        >
          Garden
        </button>
      </nav>

      {view === 'journal' ? <JournalScreen /> : <MoodDashboard />}
    </div>
  );
}