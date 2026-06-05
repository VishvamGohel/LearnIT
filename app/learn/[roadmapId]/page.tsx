'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import RoadmapTree from '@/components/RoadmapTree';
import AITutorChat from '@/components/AITutorChat';
import ProgressDashboard from '@/components/ProgressDashboard';
import MarkdownViewer from '@/components/MarkdownViewer';
import QuizModal from '@/components/QuizModal';
import { Roadmap, RoadmapNode, ChatMessage } from '@/types';
import { ChevronLeft, ChevronRight, MessageSquare, Map, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

export default function LearnPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [fetching, setFetching] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'roadmap' | 'lesson' | 'tutor'>('lesson');
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRoadmapDrawerOpen, setIsRoadmapDrawerOpen] = useState(false);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }
    loadRoadmap();
  }, [user, loading, roadmapId]);

  const loadRoadmap = async () => {
    setFetching(true);
    try {
      // Try Supabase first
      if (user) {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('roadmap_data')
          .eq('id', roadmapId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.roadmap_data) {
          setRoadmap(data.roadmap_data as unknown as Roadmap);
          setFetching(false);
          return;
        }
      }
      // Fallback to localStorage (guest / just created)
      const saved = localStorage.getItem('learnItRoadmap');
      if (saved) {
        const parsed = JSON.parse(saved) as Roadmap;
        if (parsed.id === roadmapId) {
          setRoadmap(parsed);
          setFetching(false);
          return;
        }
      }
      // Not found — go back to dashboard
      router.push('/dashboard');
    } catch (e) {
      console.error('Error loading roadmap:', e);
      router.push('/dashboard');
    } finally {
      setFetching(false);
    }
  };

  // --- Sync roadmap back to Supabase on change ---
  const syncRoadmap = useCallback(async (updated: Roadmap) => {
    localStorage.setItem('learnItRoadmap', JSON.stringify(updated));
    if (!user) return;
    try {
      await supabase
        .from('roadmaps')
        .update({ roadmap_data: updated, updated_at: new Date().toISOString() })
        .eq('id', updated.id)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('Sync error:', e);
    }
  }, [user]);

  // --- Confetti on 100% ---
  useEffect(() => {
    if (roadmap?.progressPercentage !== 100) return;
    const fire = (ratio: number, opts: confetti.Options) => {
      confetti({ origin: { y: 0.7 }, disableForReducedMotion: true, ...opts, particleCount: Math.floor(200 * ratio) });
    };
    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
      fire(0.2, { spread: 60, origin: { x: 0.8, y: 0.7 } });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.5, y: 0.6 } });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.3, y: 0.7 } });
      fire(0.1, { spread: 120, startVelocity: 45, origin: { x: 0.7, y: 0.7 } });
    }, 400);
  }, [roadmap?.progressPercentage]);

  const activeNode = roadmap?.nodes.find(n => n.id === roadmap.activeNodeId) || null;

  // --- Lesson fetching ---
  const fetchLesson = async (node: RoadmapNode, currentRoadmap: Roadmap) => {
    setRoadmap(prev => {
      if (!prev) return prev;
      return { ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, isLoadingLesson: true } : n) };
    });

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId: currentRoadmap.id,
          nodeTitle: node.title,
          nodeDescription: node.description,
          topic: currentRoadmap.topic,
          userLevel: currentRoadmap.userLevel || 'beginner',
          userGoal: currentRoadmap.userGoal || 'general understanding',
          userPace: currentRoadmap.userPace || 'standard pace',
        })
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setRoadmap(prev => {
          if (!prev) return prev;
          const updated = { 
            ...prev, 
            nodes: prev.nodes.map(n => n.id === node.id ? { 
              ...n, 
              learningMaterial: data.content, 
              quiz: data.quiz,
              isLoadingLesson: false 
            } : n) 
          };
          syncRoadmap(updated);
          return updated;
        });
      } else throw new Error(data.error || 'Failed to generate lesson');
    } catch (e: any) {
      console.error('Lesson generation failed:', e);
      setRoadmap(prev => {
        if (!prev) return prev;
        return { ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, learningMaterial: '> ⚠️ Failed to load lesson. Please try clicking this node again.', isLoadingLesson: false } : n) };
      });
    }
  };

  // --- Auto-fetch missing lesson ---
  useEffect(() => {
    if (roadmap && activeNode && !activeNode.learningMaterial && !activeNode.isLoadingLesson) {
      fetchLesson(activeNode, roadmap);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNode?.id, activeNode?.learningMaterial, activeNode?.isLoadingLesson]);

  const handleNodeSelect = (node: RoadmapNode) => {
    if (!roadmap) return;
    const updated = { ...roadmap, activeNodeId: node.id };
    setRoadmap(updated);
    syncRoadmap(updated);
    setChatHistory([]);
    setActiveMobileTab('lesson');
    if (!node.learningMaterial && !node.isLoadingLesson) {
      fetchLesson(node, roadmap);
    }
  };

  const passCheckpoint = () => {
    if (!activeNode) return;
    setRoadmap(prev => {
      if (!prev) return null;
      const newNodes = [...prev.nodes];
      const idx = newNodes.findIndex(n => n.id === activeNode.id);
      if (idx !== -1) newNodes[idx] = { ...newNodes[idx], status: 'completed' };
      let nextId = prev.activeNodeId;
      if (idx + 1 < newNodes.length) {
        newNodes[idx + 1] = { ...newNodes[idx + 1], status: 'in-progress' };
        nextId = newNodes[idx + 1].id;
      }
      const completedCount = newNodes.filter(n => n.status === 'completed').length;
      const newPercentage = Math.round((completedCount / newNodes.length) * 100);
      const updated = { ...prev, nodes: newNodes, progressPercentage: newPercentage, activeNodeId: nextId };
      syncRoadmap(updated);
      return updated;
    });
  };

  const handleQuizFail = (failedQuestions: any[]) => {
    if (!activeNode) return;
    
    setRoadmap(prev => {
      if (!prev) return prev;
      const updatedNodes = prev.nodes.map(n => n.id === activeNode.id ? { ...n, hasFailedQuiz: true, failedQuestions } : n);
      const updated = { ...prev, nodes: updatedNodes };
      syncRoadmap(updated);
      return updated;
    });

    setActiveMobileTab('tutor');
    setIsRightOpen(true);
    if (isZenMode) setIsTutorDrawerOpen(true);

    // Trigger AI response automatically with failed context
    setIsGenerating(true);
    fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: "", 
        history: chatHistory, 
        nodeTitle: activeNode.title,
        failedContext: failedQuestions 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.reply) {
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: data.reply, timestamp: Date.now() };
        setChatHistory(prev => [...prev, aiMsg]);
      }
    })
    .catch(error => {
      console.error("AI Tutor Error:", error);
    })
    .finally(() => setIsGenerating(false));
  };

  const handleSendMessage = async (message: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: message, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          history: chatHistory, 
          nodeTitle: activeNode?.title,
          failedContext: activeNode?.failedQuestions 
        })
      });
      const data = await response.json();

      if (response.ok) {
        let aiText = data.reply;
        let isPassed = false;
        if (aiText.includes('[CHECKPOINT_PASSED]')) {
          isPassed = true;
          aiText = aiText.replace('[CHECKPOINT_PASSED]', '').trim();
        }

        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: aiText, timestamp: Date.now() };
        setChatHistory(prev => [...prev, aiMsg]);

        if (isPassed && activeNode) {
          passCheckpoint();
        }
      } else throw new Error(data.error || 'Failed to fetch AI response');
    } catch (error: any) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', content: `Error: ${error.message}`, timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerCheckpoint = () => {
    if (!activeNode) return;
    const sysMsg: ChatMessage = { id: Date.now().toString(), role: 'system', content: `Checkpoint Challenge: ${activeNode.checkpointQuestion}`, timestamp: Date.now() };
    setChatHistory(prev => [...prev, sysMsg]);
    setActiveMobileTab('tutor');
    setIsRightOpen(true);
    if (isZenMode) setIsTutorDrawerOpen(true);
  };

  const handleToggleZenMode = () => {
    setIsZenMode(prev => {
      const next = !prev;
      if (next) { setIsLeftOpen(false); setIsRightOpen(false); }
      else { setIsLeftOpen(true); setIsRightOpen(true); }
      return next;
    });
    setIsRoadmapDrawerOpen(false);
    setIsTutorDrawerOpen(false);
  };

  const handleReset = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (loading || fetching) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading your roadmap...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* ── Entire page content — blurs when quiz is open ── */}
      <main
        className="h-screen max-h-screen flex flex-col p-4 md:p-8 gap-6 max-w-[1600px] mx-auto overflow-hidden animate-in fade-in duration-1000 relative transition-[filter] duration-300"
        style={{ filter: isQuizModalOpen ? 'blur(5px) brightness(0.6)' : 'none' }}
      >
      {/* Back to Dashboard button (visible when not in zen mode) */}
      {!isZenMode && (
        <header className="w-full shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-xs font-medium transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </button>
          </div>
          <ProgressDashboard
            roadmap={roadmap}
            onReset={handleReset}
            user={user}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onLogout={logout}
          />
        </header>
      )}

      <section className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Roadmap */}
        <div className={`
          ${activeMobileTab === 'roadmap' ? 'flex flex-col flex-1' : 'hidden'}
          lg:flex lg:w-1/4 lg:max-w-xs flex-col min-h-0 glass-panel rounded-3xl p-2 relative overflow-hidden shrink-0 transition-all duration-300 shadow-xl shadow-slate-950/50
          ${!isLeftOpen || isZenMode ? 'lg:hidden' : ''}
        `}>
          <button
            onClick={() => setIsLeftOpen(false)}
            className="absolute top-6 right-4 z-50 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl text-slate-400 border border-slate-800 backdrop-blur hidden lg:block"
            title="Collapse Roadmap"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <RoadmapTree nodes={roadmap?.nodes || []} activeNodeId={roadmap?.activeNodeId || ''} onNodeSelect={handleNodeSelect} />
        </div>

        {!isLeftOpen && !isZenMode && (
          <div onClick={() => setIsLeftOpen(true)} className="hidden lg:flex w-16 flex-col items-center py-6 glass-panel rounded-3xl shrink-0 cursor-pointer hover:bg-slate-800/40 transition-all border border-slate-800/50 shadow-xl">
            <Map className="w-5 h-5 text-emerald-500 mb-6" />
            <ChevronRight className="w-5 h-5 text-slate-400 mb-4" />
            <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 whitespace-nowrap">Roadmap</div>
          </div>
        )}

        {/* Center: Lesson */}
        <div className={`
          ${activeMobileTab === 'lesson' ? 'flex flex-col flex-1' : 'hidden'}
          lg:flex lg:flex-1 flex-col min-h-0 glass-panel rounded-3xl p-2 relative overflow-hidden shadow-2xl shadow-slate-950/80 transition-all duration-300
        `}>
          <MarkdownViewer
            title={activeNode?.title || 'Welcome'}
            content={activeNode?.learningMaterial || 'Select a node from the roadmap to begin your lesson.'}
            isLoading={activeNode ? (!activeNode.learningMaterial || activeNode.isLoadingLesson) : false}
            isZenMode={isZenMode}
            onToggleZen={handleToggleZenMode}
            onTriggerCheckpoint={handleTriggerCheckpoint}
            isCompleted={activeNode?.status === 'completed'}
            hasFailedQuiz={activeNode?.hasFailedQuiz}
            hasNextNode={!!roadmap?.nodes.find(n => activeNode && n.order === activeNode.order + 1)}
            onNextNode={() => {
              const next = roadmap?.nodes.find(n => activeNode && n.order === activeNode.order + 1);
              if (next) handleNodeSelect(next);
            }}
            quiz={activeNode?.quiz}
            onOpenQuiz={() => setIsQuizModalOpen(true)}
          />
        </div>

        {/* Right Sidebar: AI Tutor */}
        <div className={`
          ${activeMobileTab === 'tutor' ? 'flex flex-col flex-1' : 'hidden'}
          lg:flex lg:w-1/4 lg:max-w-[400px] flex-col min-h-0 shrink-0 relative transition-all duration-300 shadow-xl shadow-slate-950/50
          ${!isRightOpen || isZenMode ? 'lg:hidden' : ''}
        `}>
          <button
            onClick={() => setIsRightOpen(false)}
            className="absolute top-2 left-2 z-50 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl text-slate-400 border border-slate-800 backdrop-blur hidden lg:block"
            title="Collapse Chat"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <AITutorChat
            activeNode={activeNode}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onTriggerCheckpoint={handleTriggerCheckpoint}
          />
        </div>

        {!isRightOpen && !isZenMode && (
          <div onClick={() => setIsRightOpen(true)} className="hidden lg:flex w-16 flex-col items-center py-6 glass-panel rounded-3xl shrink-0 cursor-pointer hover:bg-slate-800/40 transition-all border border-slate-800/50 shadow-xl">
            <MessageSquare className="w-5 h-5 text-emerald-500 mb-6" />
            <ChevronLeft className="w-5 h-5 text-slate-400 mb-4" />
            <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 whitespace-nowrap">Tutor</div>
          </div>
        )}
      </section>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden shrink-0 w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-2 flex justify-around items-center backdrop-blur-xl shadow-lg">
        {(['roadmap', 'lesson', 'tutor'] as const).map(tab => {
          const Icon = tab === 'roadmap' ? Map : tab === 'lesson' ? BookOpen : MessageSquare;
          return (
            <button
              key={tab}
              onClick={() => setActiveMobileTab(tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
                activeMobileTab === tab ? 'text-emerald-400 bg-slate-900/60 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider capitalize">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Zen Mode Floating Handles */}
      {isZenMode && (
        <>
          <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-left-4 duration-300">
            <button onClick={() => setIsRoadmapDrawerOpen(true)} className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 hover:scale-105" title="Open Roadmap Drawer">
              <Map className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setIsTutorDrawerOpen(true)} className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 hover:scale-105" title="Open Tutor Drawer">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Zen Mode Left Roadmap Drawer */}
      {isZenMode && isRoadmapDrawerOpen && (
        <>
          <div className="hidden lg:block fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 animate-in fade-in duration-300" onClick={() => setIsRoadmapDrawerOpen(false)} />
          <div className="fixed top-4 bottom-4 left-4 w-80 glass-panel rounded-3xl p-4 z-50 flex flex-col min-h-0 shadow-2xl border border-slate-800 animate-in slide-in-from-left-8">
            <div className="flex justify-between items-center px-2 pb-3 border-b border-slate-900/60 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roadmap</span>
              <button onClick={() => setIsRoadmapDrawerOpen(false)} className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200"><ChevronLeft className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 mt-2">
              <RoadmapTree
                nodes={roadmap?.nodes || []}
                activeNodeId={roadmap?.activeNodeId || ''}
                onNodeSelect={(node) => { handleNodeSelect(node); setIsRoadmapDrawerOpen(false); }}
              />
            </div>
          </div>
        </>
      )}

      {/* Zen Mode Right Tutor Drawer */}
      {isZenMode && isTutorDrawerOpen && (
        <>
          <div className="hidden lg:block fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 animate-in fade-in duration-300" onClick={() => setIsTutorDrawerOpen(false)} />
          <div className="fixed top-4 bottom-4 right-4 w-96 glass-panel rounded-3xl z-50 flex flex-col min-h-0 shadow-2xl border border-slate-800 animate-in slide-in-from-right-8">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-900/60 bg-slate-900/40 rounded-t-3xl shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Socratic Mentor</span>
              <button onClick={() => setIsTutorDrawerOpen(false)} className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 min-h-0">
              <AITutorChat
                activeNode={activeNode}
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                onTriggerCheckpoint={handleTriggerCheckpoint}
              />
            </div>
          </div>
        </>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>

      {/* ── Quiz Modal — lives OUTSIDE main so blur doesn't affect it ── */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quiz={activeNode?.quiz || []}
        onPass={() => {
          setIsQuizModalOpen(false);
          passCheckpoint();
        }}
        onFail={(failedQuestions) => {
          setIsQuizModalOpen(false);
          handleQuizFail(failedQuestions);
        }}
      />
    </div>
  );
}
