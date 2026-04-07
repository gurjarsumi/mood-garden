'use client';

import React, { useEffect, useState } from 'react';

interface Entry {
  id: number;
  content: string;
  stress_score: number;
  dominant_emotion: string;
  created_at: string;
}

export default function MoodDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/entries/');
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Growing your garden...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-light mb-8 text-slate-800">Your Reflection History</h2>
      
      {/* Visual Garden Placeholder */}
      <div className="bg-white rounded-3xl p-10 mb-10 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="text-slate-400 mb-4">Mood Garden Visualization Coming Soon</div>
        <div className="flex gap-2">
            {/* We'll turn these into digital plants later */}
            {entries.map(entry => (
                <div 
                    key={entry.id} 
                    className={`w-4 rounded-t-full transition-all duration-500`}
                    style={{ 
                        height: `${Math.max(20, entry.stress_score * 100)}px`,
                        backgroundColor: entry.stress_score > 0.4 ? '#2dd4bf' : '#fdba74' 
                    }}
                />
            ))}
        </div>
      </div>

      {/* List of past thoughts */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 bg-white/50 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{new Date(entry.created_at).toLocaleDateString()}</span>
              <span className="uppercase tracking-widest">{entry.dominant_emotion}</span>
            </div>
            <p className="text-slate-700">{entry.content || "No text recorded."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}