'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types';

interface PreAssessmentProps {
  topic: string;
  onComplete: (transcript: ChatMessage[]) => void;
}

type QuestionStep = {
  id: string;
  question: string;
  options: { label: string; value: string }[];
};

const STEPS: QuestionStep[] = [
  {
    id: 'level',
    question: 'What is your current experience level?',
    options: [
      { label: 'Complete Beginner', value: 'Complete Beginner' },
      { label: 'Know the Basics', value: 'Know the Basics' },
      { label: 'Intermediate', value: 'Intermediate' },
      { label: 'Advanced', value: 'Advanced' }
    ]
  },
  {
    id: 'goal',
    question: 'What is your primary goal?',
    options: [
      { label: 'Practical Application (Building things)', value: 'Practical Application' },
      { label: 'Deep Theoretical Understanding', value: 'Deep Theoretical Understanding' },
      { label: 'Interview / Exam Prep', value: 'Interview / Exam Prep' },
      { label: 'Just Curious / Hobby', value: 'Just Curious' }
    ]
  },
  {
    id: 'pace',
    question: 'What pace and depth do you prefer?',
    options: [
      { label: 'Quick Crash Course (High-level)', value: 'Quick Crash Course' },
      { label: 'Standard Pace (Balanced)', value: 'Standard Pace' },
      { label: 'Deep Dive (Thorough)', value: 'Deep Dive' },
      { label: 'Intensive Bootcamp (Everything)', value: 'Intensive Bootcamp' }
    ]
  }
];

export default function PreAssessment({ topic, onComplete }: PreAssessmentProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  const handleOptionSelect = (value: string) => {
    if (isGenerating) return;

    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsGenerating(true);
      
      // Convert the structured answers into a ChatMessage transcript format
      // so we don't have to drastically rewrite the parent component and API logic
      const transcript: ChatMessage[] = [
        {
          id: 'q1', role: 'model', content: STEPS[0].question, timestamp: Date.now() - 5000
        },
        {
          id: 'a1', role: 'user', content: newAnswers['level'], timestamp: Date.now() - 4000
        },
        {
          id: 'q2', role: 'model', content: STEPS[1].question, timestamp: Date.now() - 3000
        },
        {
          id: 'a2', role: 'user', content: newAnswers['goal'], timestamp: Date.now() - 2000
        },
        {
          id: 'q3', role: 'model', content: STEPS[2].question, timestamp: Date.now() - 1000
        },
        {
          id: 'a3', role: 'user', content: newAnswers['pace'], timestamp: Date.now()
        }
      ];

      setTimeout(() => {
        onComplete(transcript);
      }, 1500); // Artificial delay to show the loading state nicely
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="w-full glass-panel border border-slate-800 rounded-3xl overflow-hidden flex flex-col min-h-[450px] shadow-2xl relative">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800/60 bg-slate-900/60 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-slate-100 truncate">Curriculum Assessment</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5 truncate">Customizing your roadmap for <span className="text-emerald-400 font-medium">{topic}</span></p>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0 self-start sm:self-auto pl-13 sm:pl-0">
              {STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex || isGenerating;
                const isActive = idx === currentStepIndex && !isGenerating;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full border text-[10px] md:text-xs font-bold flex items-center justify-center transition-all duration-300
                        ${isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : isActive
                          ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-900 border-slate-700 text-slate-600'
                        }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-3 md:w-4 h-0.5 mx-0.5 md:mx-1 transition-colors duration-300 ${isDone ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-8 flex flex-col justify-center relative">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500 text-center h-full">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Compiling Curriculum</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  Using your profile to build the perfect learning roadmap for {topic}...
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep.id}>
              <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">
                {currentStep.question}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStep.options.map((option, idx) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className="group relative flex items-center p-5 rounded-2xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-emerald-500/50 transition-all duration-200 text-left overflow-hidden hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)]"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="flex-1 text-slate-300 group-hover:text-emerald-100 font-medium relative z-10 transition-colors">
                      {option.label}
                    </span>
                    <ArrowRight className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 relative z-10" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
