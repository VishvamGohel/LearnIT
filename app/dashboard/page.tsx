'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Roadmap } from '@/types';
import {
  Plus, LogOut, User as UserIcon, BookOpen, TrendingUp, Zap, Clock,
  ChevronRight, Sparkles, Trash2, MoreVertical, Play, CheckCircle2
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

interface RoadmapRow {
  id: string;
  topic: string;
  roadmap_data: Roadmap;
  updated_at: string;
  created_at: string;
}

function RoadmapCard({ row, onDelete, onContinue }: { row: RoadmapRow; onDelete: (id: string) => void; onContinue: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roadmap = row.roadmap_data;
  const progress = roadmap.progressPercentage || 0;
  const totalNodes = roadmap.nodes?.length || 0;
  const completedNodes = roadmap.nodes?.filter(n => n.status === 'completed').length || 0;
  const isComplete = progress >= 100;

  const updatedAt = new Date(row.updated_at);
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const timeAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

  return (
    <div className="group relative glass-panel rounded-3xl border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/60 overflow-hidden flex flex-col">
      {/* Top accent gradient */}
      <div className={`h-1 w-full ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-emerald-500/60 to-indigo-500/40'}`} />

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-xs font-semibold uppercase tracking-widest ${isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isComplete ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 leading-snug line-clamp-2">{roadmap.topic}</h3>
          </div>
          {/* Kebab menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(p => !p); }}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden min-w-[120px]">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(row.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{completedNodes} / {totalNodes} milestones</span>
            <span className={`text-xs font-bold tabular-nums ${isComplete ? 'text-emerald-400' : 'text-slate-300'}`}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-auto">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onContinue(row.id)}
          className="group/btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/60 hover:bg-emerald-500 border border-slate-700/60 hover:border-transparent text-slate-300 hover:text-slate-950 text-sm font-semibold transition-all duration-200"
        >
          <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          {isComplete ? 'Review' : 'Continue'}
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800/50 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-black text-slate-100 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const fetchRoadmaps = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('id, topic, roadmap_data, updated_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setRoadmaps((data as RoadmapRow[]) || []);
    } catch (e) {
      console.error('Error fetching roadmaps:', e);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchRoadmaps();
  }, [user, fetchRoadmaps]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await supabase.from('roadmaps').delete().eq('id', id).eq('user_id', user!.id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
    setDeleteConfirm(null);
  };

  const handleContinue = (id: string) => {
    router.push(`/learn/${id}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Learner';
  const totalTopics = roadmaps.length;
  const completedTopics = roadmaps.filter(r => (r.roadmap_data?.progressPercentage || 0) >= 100).length;
  const avgProgress = roadmaps.length
    ? Math.round(roadmaps.reduce((acc, r) => acc + (r.roadmap_data?.progressPercentage || 0), 0) / roadmaps.length)
    : 0;

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* TOP NAV */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-base font-bold text-slate-100 tracking-tight hidden sm:block">LearnIT</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-topic-btn"
            onClick={() => router.push('/new')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Topic</span>
          </button>
          <div className="flex items-center gap-2 glass-panel border border-slate-800/80 pl-3 pr-2 py-1.5 rounded-xl cursor-pointer hover:border-emerald-500/40 transition-colors group" onClick={() => router.push('/settings')}>
            <UserIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate group-hover:text-slate-200 transition-colors">{displayName}</span>
          </div>
        </div>
      </header>

      {/* GREETING */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">
          Welcome back, <span className="text-emerald-400">{displayName.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-2">Pick up where you left off, or dive into something new.</p>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <StatCard icon={BookOpen} label="Topics Started" value={totalTopics} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedTopics} color="bg-teal-500/10 text-teal-400" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${avgProgress}%`} color="bg-indigo-500/10 text-indigo-400" />
      </section>

      {/* ROADMAPS GRID */}
      <section className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-200">Your Learning Roadmaps</h2>
          {roadmaps.length > 0 && (
            <span className="text-xs text-slate-600 font-medium">{roadmaps.length} topic{roadmaps.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel rounded-3xl border border-slate-800/40 h-56 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No topics yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-8">Enter any subject — from Quantum Physics to JavaScript — and your AI-powered learning roadmap will be ready in seconds.</p>
            <button
              id="empty-new-topic-btn"
              onClick={() => router.push('/new')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              Start Your First Topic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmaps.map(row => (
              <div key={row.id} className="relative">
                {deleteConfirm === row.id && (
                  <div className="absolute inset-0 z-10 rounded-3xl bg-red-950/80 backdrop-blur-sm border border-red-800/60 flex flex-col items-center justify-center gap-3 p-4">
                    <p className="text-sm font-semibold text-red-300 text-center">Delete "{row.topic}"?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(row.id)} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors">
                        Yes, delete
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <RoadmapCard row={row} onDelete={handleDelete} onContinue={handleContinue} />
              </div>
            ))}
            {/* New topic card */}
            <button
              onClick={() => router.push('/new')}
              className="group glass-panel rounded-3xl border border-dashed border-slate-700/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-emerald-500/20 border border-slate-700 group-hover:border-emerald-500/40 flex items-center justify-center transition-all duration-300">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">Start New Topic</div>
                <div className="text-xs text-slate-600 group-hover:text-slate-500 mt-0.5 transition-colors">Add to your roadmaps</div>
              </div>
            </button>
          </div>
        )}
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer / Trademark */}
      <footer className="mt-8 text-center text-xs text-slate-600/50 py-4 font-medium tracking-wide">
        Made by Vishvam Gohel
      </footer>
    </main>
  );
}
