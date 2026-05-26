'use client';
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function TopicEntry({ onStart }: { onStart: (topic: string) => void }) {
  const [topic, setTopic] = useState('');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-4 animate-in fade-in zoom-in duration-700">
      <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-500/20 mb-8 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <span className="text-emerald-300 font-medium tracking-wide text-sm uppercase">AI Learning Engine v2.0</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-black text-slate-100 text-center tracking-tight mb-6 leading-tight">
        What do you want to <span className="text-emerald-400">master</span> today?
      </h1>
      <p className="text-slate-400 text-center mb-12 max-w-xl text-lg md:text-xl font-light">
        Enter any topic, from Quantum Mechanics to Baking Sourdough. We will map a custom curriculum tailored to your exact knowledge level.
      </p>
      
      <form 
        onSubmit={(e) => { e.preventDefault(); if (topic.trim()) onStart(topic.trim()); }}
        className="w-full flex flex-col md:flex-row gap-3 p-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.05)] focus-within:border-emerald-500/40 focus-within:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-500"
      >
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Neural Networks, Roman History..."
          className="flex-1 bg-transparent px-8 py-5 text-xl text-slate-100 placeholder-slate-600 focus:outline-none"
          autoFocus
        />
        <button 
          disabled={!mounted || !topic.trim()}
          type="submit" 
          className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
        >
          Begin <ArrowRight className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
