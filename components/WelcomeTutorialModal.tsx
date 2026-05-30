'use client';

import React, { useState, useEffect } from 'react';
import { Map, Eye, GraduationCap, ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';

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
      icon: Map,
      title: "The Journey Begins",
      description: "Enter any topic—from Quantum Physics to Ancient History—and LearnIT will instantly generate a completely custom, structured learning roadmap tailored exactly to your pace and goals.",
      color: "from-emerald-400 to-teal-500",
      bgLight: "bg-emerald-500/10",
      borderLight: "border-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: Eye,
      title: "Deep Focus",
      description: "Dive into comprehensive lessons generated on-the-fly. Enter Zen Mode to hide all distractions and immerse yourself completely in your learning material.",
      color: "from-indigo-400 to-purple-500",
      bgLight: "bg-indigo-500/10",
      borderLight: "border-indigo-500/20",
      iconColor: "text-indigo-400"
    },
    {
      icon: GraduationCap,
      title: "Socratic Mentorship",
      description: "We don't just give you the answers. To progress through a roadmap, you must pass checkpoint challenges. Our AI Tutor uses the Socratic method to guide you to the answer yourself.",
      color: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-500/10",
      borderLight: "border-amber-500/20",
      iconColor: "text-amber-400"
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
  const Icon = slide.icon;

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
          
          <div className={`w-20 h-20 rounded-3xl ${slide.bgLight} border ${slide.borderLight} flex items-center justify-center mb-8 shadow-xl transition-colors duration-500 relative`}>
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} opacity-20 blur-xl`} />
            <Icon className={`w-10 h-10 ${slide.iconColor} relative z-10`} />
            
            {/* Sparkle for first slide */}
            {currentSlide === 0 && (
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
            )}
          </div>
          
          <div className="space-y-4">
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
