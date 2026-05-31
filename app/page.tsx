'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Zap, BookOpen, Brain, ChevronRight, Star, Users, TrendingUp, Sparkles, LogIn } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Socratic Learning',
    description: 'Our AI mentor never just tells you the answer — it guides you to discover it through questions.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: TrendingUp,
    title: 'Adaptive Roadmaps',
    description: 'A personalized curriculum generated from a quick assessment of your current knowledge level.',
    color: 'from-indigo-500/20 to-indigo-500/5',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Zap,
    title: 'Checkpoint Mastery',
    description: 'Each milestone is gated by an AI checkpoint. You must demonstrate understanding to advance.',
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
  },
  {
    icon: BookOpen,
    title: 'Rich Lessons On-Demand',
    description: 'Each node generates a deep, rich lesson the moment you click it — no waiting, no filler.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
];

const TESTIMONIALS = [
  { name: 'Arjun S.', subject: 'Machine Learning', quote: 'Went from absolute zero to building my first neural net in two weeks. The Socratic method actually works.' },
  { name: 'Priya M.', subject: 'Quantum Physics', quote: 'Every textbook I tried was a wall of jargon. LearnIT broke it down in a way that finally clicked.' },
  { name: 'Daniel K.', subject: 'Web Development', quote: 'I have tried 10 different platforms. This is the only one that actually made me think instead of just memorize.' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Animated counter for social proof
  useEffect(() => {
    const target = 12400;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedCount(target);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  if (loading || user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Background grid + glow */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-900/60 backdrop-blur-xl bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-base font-bold text-slate-100 tracking-tight">LearnIT</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded ml-2">Beta</span>
        </div>
        <button
          id="nav-signin-btn"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
        >
          <LogIn className="w-4 h-4" />
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6 pt-24 pb-16">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest animate-in fade-in duration-700">
          <Sparkles className="w-3 h-3" />
          AI-Powered Socratic Learning
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-50 leading-none tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Learn Anything.{' '}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Actually Master It.
            </span>
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          LearnIT builds a personalized roadmap for any topic, then guides you through it with a Socratic AI mentor — asking you questions instead of giving you answers, until you truly own the knowledge.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <button
            id="hero-start-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
          >
            Start Learning for Free
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="flex -space-x-2">
              {['E','P','A','D'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  {l}
                </div>
              ))}
            </div>
            <span>{animatedCount.toLocaleString()}+ learners</span>
          </div>
        </div>

        {/* Hero mockup card */}
        <div className="mt-16 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="glass-panel rounded-3xl border border-slate-800/80 p-6 shadow-2xl shadow-slate-950/80">
            {/* Fake progress bar header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
              </div>
              <span className="text-xs text-emerald-400 font-semibold tabular-nums">60%</span>
            </div>
            {/* Fake roadmap nodes */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Wave-Particle Duality', status: 'completed', desc: 'Mastered the double-slit experiment' },
                { label: 'Quantum Superposition', status: 'active', desc: 'Currently exploring Schrödinger\'s wave function' },
                { label: 'Quantum Entanglement', status: 'locked', desc: 'Unlock after completing superposition' },
              ].map((node, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                  node.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/5' :
                  node.status === 'active' ? 'border-slate-700 bg-slate-800/60 shadow-lg shadow-emerald-500/10' :
                  'border-slate-800/40 bg-slate-900/20 opacity-50'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    node.status === 'completed' ? 'bg-emerald-500 text-slate-950' :
                    node.status === 'active' ? 'bg-slate-700 text-emerald-400 ring-2 ring-emerald-500/40' :
                    'bg-slate-800 text-slate-600'
                  }`}>
                    {node.status === 'completed' ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold ${node.status === 'locked' ? 'text-slate-600' : 'text-slate-200'}`}>{node.label}</div>
                    <div className="text-xs text-slate-500">{node.desc}</div>
                  </div>
                  {node.status === 'active' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">How LearnIT Works</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Not another course platform. A thinking partner that transforms how you understand concepts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative glass-panel rounded-3xl p-6 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/50"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 border border-slate-800/40`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-24 px-6 border-t border-slate-900/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">Learners Who Got It</h2>
            <p className="text-slate-400 text-lg">Real results from real students who went from confused to confident.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 border border-slate-800/50 flex flex-col gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.subject}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="relative z-10 py-24 px-6 border-t border-slate-900/80">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">Ready to Master Something?</h2>
          <p className="text-slate-400 text-lg mb-10">Pick any topic. Our AI builds your curriculum in seconds.</p>
          <button
            id="footer-start-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
          >
            Start for Free
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-600 mt-6">No credit card. No subscription. Just learning.</p>
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}
