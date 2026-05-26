'use client';

import React from 'react';
import { RoadmapNode } from '@/types';
import { CheckCircle2, Lock, Play, Circle } from 'lucide-react';

interface RoadmapTreeProps {
  nodes: RoadmapNode[];
  activeNodeId: string;
  onNodeSelect: (node: RoadmapNode) => void;
}

export default function RoadmapTree({ nodes, activeNodeId, onNodeSelect }: RoadmapTreeProps) {
  // Sort nodes by order
  const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

  return (
    <div className="relative flex flex-col items-center py-10 w-full overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-emerald-500/20">
      <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase mb-8">Learning Path</h3>
      
      {/* SVG Connecting Lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-800 -translate-x-1/2 -z-10">
        <div 
          className="w-full bg-emerald-500 transition-all duration-1000 ease-out"
          style={{
            height: `${((sortedNodes.filter(n => n.status === 'completed').length) / Math.max(sortedNodes.length - 1, 1)) * 100}%`
          }}
        />
      </div>

      <div className="flex flex-col gap-12 w-full max-w-lg px-4">
        {sortedNodes.map((node, index) => {
          const isActive = node.id === activeNodeId;
          const isCompleted = node.status === 'completed';
          const isLocked = node.status === 'locked';
          const isUnlocked = node.status === 'unlocked' || node.status === 'in-progress';

          return (
            <div 
              key={node.id} 
              onClick={() => !isLocked && onNodeSelect(node)}
              className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-300 cursor-pointer 
                ${isActive 
                  ? 'bg-slate-900/90 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]' 
                  : isCompleted
                  ? 'bg-slate-900/50 border-emerald-500/20 hover:border-emerald-500/40'
                  : isLocked
                  ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }
              `}
            >
              {/* Timeline Indicator Badge */}
              <div 
                className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 shrink-0
                  ${isActive 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                    : isCompleted
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                    : isLocked
                    ? 'bg-slate-900 text-slate-600 border-slate-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 group-hover:border-slate-600'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5" />
                ) : isActive ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Node Card Details */}
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Milestone {index + 1}
                </span>
                <h4 className={`text-base font-bold tracking-tight mt-0.5 ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {node.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* Subtle hover indicator dot */}
              {isUnlocked && !isActive && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 group-hover:animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
