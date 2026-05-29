'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import TopicEntry from '@/components/TopicEntry';
import PreAssessment from '@/components/PreAssessment';
import { Roadmap, RoadmapNode, ChatMessage } from '@/types';
import { ArrowLeft, Sparkles } from 'lucide-react';

type NewPageStatus = 'idle' | 'assessing' | 'generating';

export default function NewTopicPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<NewPageStatus>('idle');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleTopicStart = (enteredTopic: string) => {
    setTopic(enteredTopic);
    setStatus('assessing');
  };

  const handleAssessmentComplete = async (transcript: ChatMessage[]) => {
    setStatus('generating');
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, transcript })
      });

      const data = await res.json();
      if (res.ok && data.nodes) {
        const firstNode = data.nodes[0];
        const roadmapId = `roadmap_${Date.now()}`;

        const newRoadmap: Roadmap = {
          id: roadmapId,
          topic,
          nodes: data.nodes,
          activeNodeId: firstNode.id,
          progressPercentage: 0,
          createdAt: Date.now(),
          userLevel: data.userLevel,
          userGoal: data.userGoal,
          userPace: data.userPace,
        };

        // Save to Supabase (if logged in) + localStorage
        localStorage.setItem('learnItRoadmap', JSON.stringify(newRoadmap));

        if (user) {
          try {
            const { error } = await supabase
              .from('roadmaps')
              .insert({
                id: roadmapId,
                user_id: user.id,
                topic,
                roadmap_data: newRoadmap,
                updated_at: new Date().toISOString(),
              });
            if (error) throw error;
          } catch (e) {
            console.error('Error saving roadmap to Supabase:', e);
            // Non-fatal — we still navigate
          }
        }

        router.push(`/learn/${roadmapId}`);
      } else {
        alert('Generation failed: ' + data.error);
        setStatus('idle');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to API');
      setStatus('idle');
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'assessing') {
    return (
      <main className="h-screen">
        <PreAssessment topic={topic} onComplete={handleAssessmentComplete} />
      </main>
    );
  }

  if (status === 'generating') {
    return (
      <main className="h-screen max-h-screen flex flex-col p-4 md:p-8 gap-6 max-w-[1600px] mx-auto overflow-hidden animate-in fade-in duration-700">
        {/* Skeleton Header */}
        <div className="w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-4 md:p-6 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 w-24 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-6 w-48 bg-slate-800 rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <div className="h-3 w-24 bg-slate-800 rounded-full animate-pulse" />
                <div className="h-3 w-8 bg-emerald-900/50 rounded-full animate-pulse" />
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-emerald-500/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left skeleton */}
          <div className="hidden lg:flex w-full lg:w-1/4 lg:max-w-xs glass-panel rounded-3xl p-6 flex-col gap-8 shrink-0">
            <div className="h-3 w-24 bg-emerald-900/50 rounded-full animate-pulse mx-auto" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800/50 bg-slate-900/30"
                style={{ opacity: 1 - i * 0.18 }}>
                <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 w-16 bg-slate-700 rounded-full animate-pulse" />
                  <div className="h-4 w-full bg-slate-800 rounded-full animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-800/60 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Center */}
          <div className="flex-1 glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 min-h-0 overflow-hidden">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
              <div className="w-5 h-5 bg-emerald-900/50 rounded animate-pulse" />
              <div className="h-5 w-56 bg-slate-800 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <div className="h-8 w-3/4 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-slate-800/70 rounded-full animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-800/70 rounded-full animate-pulse" />
              <div className="h-4 w-4/6 bg-slate-800/50 rounded-full animate-pulse" />
              <div className="h-24 w-full bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse mt-2" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-500/60" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">Building your curriculum...</p>
                <p className="text-slate-500 text-sm mt-1">
                  Crafting a personalized roadmap for{' '}
                  <span className="text-emerald-400 font-semibold">{topic}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right skeleton */}
          <div className="hidden lg:flex w-full lg:w-1/4 lg:max-w-[400px] glass-panel rounded-3xl p-6 flex-col gap-4 shrink-0 min-h-0">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/40 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-24 bg-slate-800 rounded-full animate-pulse" />
                <div className="h-2.5 w-16 bg-emerald-900/40 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {[{ w: 'w-4/5', a: 'items-start' }, { w: 'w-3/5', a: 'items-end' }, { w: 'w-full', a: 'items-start' }].map((b, i) => (
                <div key={i} className={`flex flex-col ${b.a}`}>
                  <div className={`${b.w} h-12 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse`} style={{ animationDelay: `${i * 150}ms` }} />
                </div>
              ))}
            </div>
            <div className="h-12 w-full bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse mt-auto" />
          </div>
        </div>
      </main>
    );
  }

  // Idle — show topic entry
  return (
    <main className="min-h-screen flex flex-col">
      {/* Back to dashboard */}
      <div className="p-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
      </div>
      <div className="flex-1">
        <TopicEntry onStart={handleTopicStart} />
      </div>
    </main>
  );
}
