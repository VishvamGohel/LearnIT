'use client';

import React, { useState, useEffect } from 'react';
import { Map, Eye, GraduationCap, ChevronRight, ChevronLeft, Sparkles, X, Check, MessageSquare } from 'lucide-react';

interface WelcomeTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeTutorialModal({ isOpen, onClose }: WelcomeTutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsRendered(false), 300); // Wait for fade out
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isRendered) return null;

  const slides = [
    {
      title: "The Journey Begins",
      description: "Enter any topic—from Quantum Physics to Ancient History—and LearnIT instantly generates a structured learning roadmap tailored to your pace.",
      color: "from-emerald-400 to-teal-500",
      renderVisual: () => (
        <div className="w-full h-32 flex justify-center items-center relative">
          {/* Mini Roadmap Timeline */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-800/80" />
          
          <div className="flex flex-col gap-5 relative z-10 w-full max-w-[200px]">
            {/* Node 1: Completed */}
            <div className="flex items-center gap-3 w-full">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 shrink-0">
                <Check className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full" />
            </div>
            {/* Node 2: Active */}
            <div className="flex items-center gap-3 w-full opacity-90">
              <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] z-10 shrink-0 relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="h-2 w-3/4 bg-slate-800 rounded-full" />
            </div>
            {/* Node 3: Locked */}
            <div className="flex items-center gap-3 w-full opacity-40">
              <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center z-10 shrink-0" />
              <div className="h-2 w-1/2 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Deep Focus",
      description: "Dive into comprehensive lessons generated on-the-fly. Enter Zen Mode to hide all distractions and immerse yourself completely.",
      color: "from-indigo-400 to-purple-500",
      renderVisual: () => (
        <div className="w-full h-32 flex justify-center items-center">
          {/* Mini Reading Pane */}
          <div className="w-full max-w-[240px] h-28 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <div className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center gap-1">
                <Eye className="w-2.5 h-2.5 text-indigo-400" />
                <span className="text-[8px] font-bold text-indigo-400">Zen Mode</span>
              </div>
            </div>
            <div className="w-1/2 h-3 bg-slate-700 rounded-full mb-3 mt-1" />
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2" />
            <div className="w-5/6 h-1.5 bg-slate-800 rounded-full mb-2" />
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2" />
            <div className="w-4/6 h-1.5 bg-slate-800 rounded-full" />
          </div>
        </div>
      )
    },
    {
      title: "Socratic Mentorship",
      description: "We don't just give you the answers. To progress, you must pass Checkpoints. Our AI Tutor uses the Socratic method to guide you.",
      color: "from-emerald-400 to-teal-400",
      renderVisual: () => (
        <div className="w-full h-32 flex justify-center items-center">
          {/* Mini Chat Interface */}
          <div className="w-full max-w-[240px] flex flex-col gap-2">
            {/* Tutor message */}
            <div className="flex gap-2 items-start w-5/6">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-tl-none p-2 w-full">
                <div className="w-full h-1 bg-slate-700 rounded-full mb-1" />
                <div className="w-4/5 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
            {/* User message */}
            <div className="flex gap-2 items-start justify-end w-full">
              <div className="bg-emerald-600/90 rounded-xl rounded-tr-none p-2 w-3/5 shadow-md">
                <div className="w-full h-1 bg-emerald-950/40 rounded-full mb-1" />
                <div className="w-2/3 h-1 bg-emerald-950/40 rounded-full" />
              </div>
            </div>
            {/* Take Checkpoint button */}
            <div className="mt-1 w-full bg-slate-900/80 border border-emerald-500/30 rounded-lg py-1.5 flex justify-center items-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Take Checkpoint
              </span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg glass-panel rounded-[2rem] border border-slate-800/80 shadow-2xl shadow-slate-950 overflow-hidden flex flex-col transition-all duration-500 delay-100 ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}>
        
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br ${slide.color} opacity-10 blur-[100px] transition-colors duration-700`} />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-300 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content area */}
        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center relative z-10 min-h-[360px] justify-center">
          
          {/* Dynamic Visual Mockup */}
          <div className="w-full flex items-center justify-center mb-6">
            {slide.renderVisual()}
          </div>
          
          <div className="space-y-3">
            <h2 className={`text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br ${slide.color} transition-all duration-500`}>
              {slide.title}
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base px-2">
              {slide.description}
            </p>
          </div>
          
        </div>

        {/* Footer controls */}
        <div className="px-8 py-6 bg-slate-900/40 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Progress Dots */}
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide 
                    ? `w-8 bg-gradient-to-r ${slide.color}` 
                    : 'w-2 bg-slate-800'
                }`} 
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentSlide > 0 && (
              <button 
                onClick={prevSlide}
                className="p-3 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={nextSlide}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-950 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r ${slide.color}`}
            >
              {currentSlide === slides.length - 1 ? (
                <>Get Started <Sparkles className="w-4 h-4" /></>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
