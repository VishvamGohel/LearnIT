'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import RoadmapTree from '@/components/RoadmapTree';
import AITutorChat from '@/components/AITutorChat';
import ProgressDashboard from '@/components/ProgressDashboard';
import TopicEntry from '@/components/TopicEntry';
import PreAssessment from '@/components/PreAssessment';
import MarkdownViewer from '@/components/MarkdownViewer';
import { Roadmap, RoadmapNode, ChatMessage, AppStatus } from '@/types';
import { ChevronLeft, ChevronRight, MessageSquare, Map, BookOpen } from 'lucide-react';

// Mock initial data
const MOCK_ROADMAP: Roadmap = {
  id: 'r1',
  topic: 'Quantum Mechanics',
  activeNodeId: 'n1',
  progressPercentage: 25,
  createdAt: Date.now(),
  nodes: [
    {
      id: 'n1',
      title: 'Wave-Particle Duality',
      description: 'Understand that particles can exhibit both wave and particle properties.',
      status: 'in-progress',
      order: 1,
      checkpointQuestion: 'Which famous experiment demonstrates this duality?',
      checkpointAnswer: 'double slit'
    },
    {
      id: 'n2',
      title: 'Superposition',
      description: 'Learn how a quantum system can be in multiple states simultaneously.',
      status: 'locked',
      order: 2,
      checkpointQuestion: 'What thought experiment involves a cat in a box?',
      checkpointAnswer: 'schrodinger'
    },
    {
      id: 'n3',
      title: 'Entanglement',
      description: 'Discover how particles become linked regardless of distance.',
      status: 'locked',
      order: 3,
      checkpointQuestion: 'Einstein referred to entanglement as "spooky action at a ___"?',
      checkpointAnswer: 'distance'
    }
  ]
};

export default function Home() {
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [topic, setTopic] = useState('');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'roadmap' | 'lesson' | 'tutor'>('roadmap');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRoadmapDrawerOpen, setIsRoadmapDrawerOpen] = useState(false);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('learnItRoadmap');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRoadmap(parsed);
        if (parsed) setAppStatus('learning');
      } catch (e) {
        console.error("Failed to parse saved roadmap");
      }
    }
  }, []);

  // Save to local storage when roadmap changes
  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('learnItRoadmap', JSON.stringify(roadmap));
    }
  }, [roadmap]);

  // Fire confetti celebration when the roadmap is 100% complete
  useEffect(() => {
    if (roadmap?.progressPercentage !== 100) return;

    const fireConfetti = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.7 },
        disableForReducedMotion: true,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    // Small delay so the node-completion animation plays first
    setTimeout(() => {
      fireConfetti(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
      fireConfetti(0.2,  { spread: 60, origin: { x: 0.8, y: 0.7 } });
      fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.5, y: 0.6 } });
      fireConfetti(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.3, y: 0.7 } });
      fireConfetti(0.1,  { spread: 120, startVelocity: 45, origin: { x: 0.7, y: 0.7 } });
    }, 400);
  }, [roadmap?.progressPercentage]);

  const activeNode = roadmap?.nodes.find(n => n.id === roadmap.activeNodeId) || null;

  const fetchLesson = async (node: RoadmapNode, currentRoadmap: Roadmap) => {
    // Mark node as loading
    setRoadmap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === node.id ? { ...n, isLoadingLesson: true } : n
        )
      };
    });

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          return {
            ...prev,
            nodes: prev.nodes.map(n =>
              n.id === node.id
                ? { ...n, learningMaterial: data.content, isLoadingLesson: false }
                : n
            )
          };
        });
      } else {
        throw new Error(data.error || 'Failed to generate lesson');
      }
    } catch (e: any) {
      console.error('Lesson generation failed:', e);
      setRoadmap(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === node.id
              ? { ...n, learningMaterial: '> ⚠️ Failed to load lesson. Please try clicking this node again.', isLoadingLesson: false }
              : n
          )
        };
      });
    }
  };

  const handleNodeSelect = (node: RoadmapNode) => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, activeNodeId: node.id });
    setChatHistory([]);
    // On mobile, auto switch to the lesson tab when a node is clicked
    setActiveMobileTab('lesson');
    // Only fetch if lesson hasn't been generated yet
    if (!node.learningMaterial && !node.isLoadingLesson) {
      fetchLesson(node, roadmap);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: chatHistory,
          nodeTitle: activeNode?.title
        })
      });

      const data = await response.json();

      if (response.ok) {
        let aiText = data.reply;
        let isPassed = false;
        
        // Hidden trigger check
        if (aiText.includes('[CHECKPOINT_PASSED]')) {
          isPassed = true;
          aiText = aiText.replace('[CHECKPOINT_PASSED]', '').trim();
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: aiText,
          timestamp: Date.now()
        };
        setChatHistory(prev => [...prev, aiMsg]);

        // Update Roadmap if passed
        if (isPassed && activeNode) {
          setRoadmap(prev => {
            if (!prev) return null;
            const newNodes = [...prev.nodes];
            const currentIndex = newNodes.findIndex(n => n.id === activeNode.id);
            
            // Mark current as completed
            if (currentIndex !== -1) {
              newNodes[currentIndex].status = 'completed';
            }
            // Unlock next node
            let nextId = prev.activeNodeId;
            if (currentIndex + 1 < newNodes.length) {
              newNodes[currentIndex + 1].status = 'in-progress';
              nextId = newNodes[currentIndex + 1].id;
            }
            
            const completedCount = newNodes.filter(n => n.status === 'completed').length;
            const newPercentage = Math.round((completedCount / newNodes.length) * 100);

            return {
              ...prev,
              nodes: newNodes,
              progressPercentage: newPercentage,
              activeNodeId: nextId
            };
          });
        }
      } else {
        throw new Error(data.error || 'Failed to fetch AI response');
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error connecting to AI Tutor: ${error.message}`,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerCheckpoint = () => {
    if (!activeNode) return;
    const sysMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `Checkpoint Challenge: ${activeNode.checkpointQuestion}`,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, sysMsg]);
    // On mobile, auto switch to tutor tab to see the test
    setActiveMobileTab('tutor');
    // On desktop Zen Mode, auto open the Tutor Drawer so they can see it!
    if (isZenMode) {
      setIsTutorDrawerOpen(true);
    }
  };

  const handleToggleZenMode = () => {
    setIsZenMode(prev => {
      const nextZen = !prev;
      if (nextZen) {
        // Automatically collapse sidebars
        setIsLeftOpen(false);
        setIsRightOpen(false);
      } else {
        // Restore sidebars
        setIsLeftOpen(true);
        setIsRightOpen(true);
      }
      return nextZen;
    });
    // Close any drawers that might be open
    setIsRoadmapDrawerOpen(false);
    setIsTutorDrawerOpen(false);
  };

  const handleTopicStart = (enteredTopic: string) => {
    setTopic(enteredTopic);
    setAppStatus('assessing');
  };

  const handleAssessmentComplete = async (transcript: ChatMessage[]) => {
    setAppStatus('generating');
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, transcript })
      });
      
      const data = await res.json();
      if (res.ok && data.nodes) {
        const firstNode = data.nodes[0];
        const newRoadmap: Roadmap = {
          id: `roadmap_${Date.now()}`,
          topic,
          nodes: data.nodes,
          activeNodeId: firstNode.id,
          progressPercentage: 0,
          createdAt: Date.now(),
          userLevel: data.userLevel,
          userGoal: data.userGoal,
          userPace: data.userPace,
        };
        setRoadmap(newRoadmap);
        setAppStatus('learning');
        setActiveMobileTab('lesson');
        // Kick off lesson generation for the first node immediately
        fetchLesson(firstNode, newRoadmap);

      } else {
        alert("Generation failed: " + data.error);
        setAppStatus('idle');
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to API");
      setAppStatus('idle');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('learnItRoadmap');
    setRoadmap(null);
    setChatHistory([]);
    setTopic('');
    setAppStatus('idle');
    setIsZenMode(false);
    setIsRoadmapDrawerOpen(false);
    setIsTutorDrawerOpen(false);
  };

  if (appStatus === 'idle') {
    return <main className="h-screen"><TopicEntry onStart={handleTopicStart} /></main>;
  }

  if (appStatus === 'assessing') {
    return <main className="h-screen"><PreAssessment topic={topic} onComplete={handleAssessmentComplete} /></main>;
  }

  if (appStatus === 'generating') {
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
            <div className="hidden sm:block h-12 w-32 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
            <div className="hidden sm:block h-12 w-32 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Skeleton body */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">

          {/* Left — Roadmap skeleton */}
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

          {/* Center — Lesson content skeleton */}
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
              <div className="h-4 w-full bg-slate-800/60 rounded-full animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-800/60 rounded-full animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-800/40 rounded-full animate-pulse" />
            </div>

            {/* Centered status message */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">
                Building your <span className="text-emerald-400 font-semibold">{topic}</span> curriculum...
              </p>
            </div>
          </div>

          {/* Right — Chat skeleton */}
          <div className="hidden lg:flex w-full lg:w-1/4 lg:max-w-[400px] glass-panel rounded-3xl p-6 flex-col gap-4 shrink-0 min-h-0">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/40 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-24 bg-slate-800 rounded-full animate-pulse" />
                <div className="h-2.5 w-16 bg-emerald-900/40 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {[{ w: 'w-4/5', align: 'items-start' }, { w: 'w-3/5', align: 'items-end' }, { w: 'w-full', align: 'items-start' }].map((b, i) => (
                <div key={i} className={`flex flex-col ${b.align}`}>
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

  // Render the learning dashboard
  return (
    <main className="h-screen max-h-screen flex flex-col p-4 md:p-8 gap-6 max-w-[1600px] mx-auto overflow-hidden animate-in fade-in duration-1000 relative">
      {!isZenMode && (
        <header className="w-full shrink-0">
          <ProgressDashboard roadmap={roadmap} onReset={handleReset} />
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
          <RoadmapTree 
            nodes={roadmap?.nodes || []} 
            activeNodeId={roadmap?.activeNodeId || ''} 
            onNodeSelect={handleNodeSelect} 
          />
        </div>

        {!isLeftOpen && !isZenMode && (
          <div 
            onClick={() => setIsLeftOpen(true)}
            className="hidden lg:flex w-16 flex-col items-center py-6 glass-panel rounded-3xl shrink-0 cursor-pointer hover:bg-slate-800/40 transition-all border border-slate-800/50 shadow-xl"
          >
            <Map className="w-5 h-5 text-emerald-500 mb-6" />
            <ChevronRight className="w-5 h-5 text-slate-400 mb-4" />
            <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 whitespace-nowrap">
              Roadmap
            </div>
          </div>
        )}

        {/* Center: Reading Area */}
        <div className={`
          ${activeMobileTab === 'lesson' ? 'flex flex-col flex-1' : 'hidden'}
          lg:flex lg:flex-1 flex-col min-h-0 glass-panel rounded-3xl p-2 relative overflow-hidden shadow-2xl shadow-slate-950/80 transition-all duration-300
        `}>
          <MarkdownViewer 
            title={activeNode?.title || "Welcome"}
            content={activeNode?.learningMaterial || "Select a node from the roadmap to begin your lesson."}
            isLoading={activeNode?.isLoadingLesson === true}
            isZenMode={isZenMode}
            onToggleZen={handleToggleZenMode}
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
          <div 
            onClick={() => setIsRightOpen(true)}
            className="hidden lg:flex w-16 flex-col items-center py-6 glass-panel rounded-3xl shrink-0 cursor-pointer hover:bg-slate-800/40 transition-all border border-slate-800/50 shadow-xl"
          >
            <MessageSquare className="w-5 h-5 text-emerald-500 mb-6" />
            <ChevronLeft className="w-5 h-5 text-slate-400 mb-4" />
            <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 whitespace-nowrap">
              Tutor
            </div>
          </div>
        )}
      </section>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden shrink-0 w-full bg-slate-950/80 border border-slate-900 rounded-3xl p-2 flex justify-around items-center backdrop-blur-xl shadow-lg">
        <button
          onClick={() => setActiveMobileTab('roadmap')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
            activeMobileTab === 'roadmap'
              ? 'text-emerald-400 bg-slate-900/60 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Roadmap</span>
        </button>

        <button
          onClick={() => setActiveMobileTab('lesson')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
            activeMobileTab === 'lesson'
              ? 'text-emerald-400 bg-slate-900/60 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Lesson</span>
        </button>

        <button
          onClick={() => setActiveMobileTab('tutor')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
            activeMobileTab === 'tutor'
              ? 'text-emerald-400 bg-slate-900/60 font-semibold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Tutor</span>
        </button>
      </div>

      {/* Zen Mode Floating Handles (Desktop only) */}
      {isZenMode && (
        <>
          {/* Left Floating Map Handle */}
          <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-left-4 duration-300">
            <button
              onClick={() => setIsRoadmapDrawerOpen(true)}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 hover:scale-105"
              title="Open Roadmap Drawer"
            >
              <Map className="w-5 h-5" />
            </button>
          </div>

          {/* Right Floating Tutor Handle */}
          <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setIsTutorDrawerOpen(true)}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 hover:scale-105"
              title="Open Tutor Drawer"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Zen Mode Left Roadmap Drawer */}
      {isZenMode && isRoadmapDrawerOpen && (
        <>
          <div 
            className="hidden lg:block fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 animate-in fade-in duration-300"
            onClick={() => setIsRoadmapDrawerOpen(false)}
          />
          <div className="fixed top-4 bottom-4 left-4 w-80 glass-panel rounded-3xl p-4 z-50 flex flex-col min-h-0 shadow-2xl transition-all duration-350 border border-slate-800 animate-in slide-in-from-left-8">
            <div className="flex justify-between items-center px-2 pb-3 border-b border-slate-900/60 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roadmap</span>
              <button 
                onClick={() => setIsRoadmapDrawerOpen(false)}
                className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 mt-2">
              <RoadmapTree 
                nodes={roadmap?.nodes || []} 
                activeNodeId={roadmap?.activeNodeId || ''} 
                onNodeSelect={(node) => {
                  handleNodeSelect(node);
                  setIsRoadmapDrawerOpen(false);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Zen Mode Right Tutor Drawer */}
      {isZenMode && isTutorDrawerOpen && (
        <>
          <div 
            className="hidden lg:block fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 animate-in fade-in duration-300"
            onClick={() => setIsTutorDrawerOpen(false)}
          />
          <div className="fixed top-4 bottom-4 right-4 w-96 glass-panel rounded-3xl z-50 flex flex-col min-h-0 shadow-2xl transition-all duration-350 border border-slate-800 animate-in slide-in-from-right-8">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-900/60 bg-slate-900/40 rounded-t-3xl shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Socratic Mentor</span>
              <button 
                onClick={() => setIsTutorDrawerOpen(false)}
                className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
    </main>
  );
}
