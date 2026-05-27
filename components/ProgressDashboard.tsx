'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Roadmap } from '@/types';
import { Compass, Plus, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface ProgressDashboardProps {
  roadmap: Roadmap | null;
  onReset: () => void;
  user: any;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function ProgressDashboard({ roadmap, onReset, user, onAuthClick, onLogout }: ProgressDashboardProps) {
  const router = useRouter();
  if (!roadmap) return null;

  return (
    <div className="w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-4 sm:px-6 sm:py-3.5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-slate-950/20">
      {/* Left side: Subject and badge */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
          <Compass className="w-5 h-5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase block leading-none">Active Subject</span>
          <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight mt-0.5 capitalize truncate">
            {roadmap.topic}
          </h2>
        </div>
        {/* Progress badge */}
        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none">
          {roadmap.progressPercentage}%
        </span>
      </div>

      {/* Middle: Progress Bar */}
      <div className="flex-1 max-w-md mx-0 sm:mx-8 flex items-center min-w-0">
        <div className="w-full h-1.5 bg-slate-905 border border-slate-900/60 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            style={{ width: `${roadmap.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Right side: Action & Auth Buttons */}
      <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
        <button 
          onClick={() => router.push('/new')}
          className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-900 text-slate-300 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-slate-800 shrink-0 shadow-lg hover:border-slate-700 hover:text-slate-100"
        >
          <Plus className="w-3 h-3" />
          <span>New Topic</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2 border border-slate-800/80 bg-slate-900/40 pl-3 pr-2 py-1.5 rounded-xl text-slate-300 text-xs font-medium">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[80px] sm:max-w-[125px] truncate">
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <button
              onClick={onLogout}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onAuthClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
