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
    <div className="w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl relative">
      <div className="absolute top-6 right-6">
        <button 
          onClick={onReset}
          className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold uppercase tracking-wider border border-slate-800"
        >
          Start New Topic
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        
        {/* Topic Title & Summary */}
        <div className="md:col-span-1 flex flex-col justify-center">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Active Subject</span>
          <h2 className="text-xl font-black text-slate-100 tracking-tight mt-1 capitalize truncate">
            {roadmap.topic}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mastery Roadmap</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="md:col-span-1 flex flex-col justify-center">
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
        <div className="md:col-span-1 flex items-center gap-4 bg-slate-900/30 border border-slate-900/60 rounded-2xl p-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Completed</span>
            <span className="text-lg font-bold text-slate-100">{completedNodes} / {totalNodes} Nodes</span>
          </div>
        </div>

        {/* Active Node Detail */}
        <div className="md:col-span-1 flex items-center gap-4 bg-slate-900/30 border border-slate-900/60 rounded-2xl p-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl">
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
