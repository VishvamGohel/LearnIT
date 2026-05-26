'use client';

import React from 'react';
import { Roadmap } from '@/types';
import { Award, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface ProgressDashboardProps {
  roadmap: Roadmap | null;
  onReset: () => void;
}

export default function ProgressDashboard({ roadmap, onReset }: ProgressDashboardProps) {
  if (!roadmap) return null;

  const totalNodes = roadmap.nodes.length;
  const completedNodes = roadmap.nodes.filter((n) => n.status === 'completed').length;
  const activeNode = roadmap.nodes.find((n) => n.id === roadmap.activeNodeId);

  return (
    <div className="w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-xl">
      {/* Top Header Row: compact on mobile, detailed on desktop */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Active Subject</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5 capitalize truncate">
            {roadmap.topic}
          </h2>
          {/* Progress badge on mobile */}
          <div className="flex items-center gap-2 mt-1">
            <span className="sm:hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {roadmap.progressPercentage}% Complete
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mastery Roadmap</span>
            </span>
          </div>
        </div>
        
        <button 
          onClick={onReset}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-slate-800 shrink-0 shadow-lg"
        >
          Start New Topic
        </button>
      </div>

      {/* Detailed Stats Grid: hidden on mobile */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-900/60">
        
        {/* Global Progress Bar */}
        <div className="flex flex-col justify-center bg-slate-900/10 border border-slate-900/40 rounded-2xl p-4 min-h-[76px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Total Progress</span>
            <span className="text-xs font-bold text-emerald-400">{roadmap.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${roadmap.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Completed count */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-900/60 rounded-2xl p-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Completed</span>
            <span className="text-base font-bold text-slate-100">{completedNodes} / {totalNodes} Nodes</span>
          </div>
        </div>

        {/* Active Target */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-900/60 rounded-2xl p-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Active Target</span>
            <span className="text-sm font-bold text-slate-100 block truncate">
              {activeNode ? activeNode.title : 'Generating roadmap...'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
