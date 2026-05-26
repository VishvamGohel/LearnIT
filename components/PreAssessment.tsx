'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types';

interface PreAssessmentProps {
  topic: string;
  onComplete: (transcript: ChatMessage[]) => void;
}

export default function PreAssessment({ topic, onComplete }: PreAssessmentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the first question automatically when mounted
    setMessages([{
      id: '1',
      role: 'model',
      content: `Awesome choice. To map out the best possible curriculum for **${topic}**, what is your current experience level with it? (e.g., complete beginner, I know the basics, etc.)`,
      timestamp: Date.now()
    }]);
  }, [topic]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const MIN_LENGTH = 3;
  const isInputValid = input.trim().length >= MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsGenerating(true);

    // Count how many user messages have been sent so far
    const userTurnCount = newHistory.filter(m => m.role === 'user').length;

    if (userTurnCount === 1) {
      // After Q1 — ask Q2 about specific focus area
      setTimeout(() => {
        const followUp: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `Got it! One more question — what specific aspect of **${topic}** are you most interested in exploring? (e.g., a particular concept, a practical skill, preparing for something specific, etc.)`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, followUp]);
        setIsGenerating(false);
      }, 800);
    } else {
      // After Q2 — show compiling message then complete
      setTimeout(() => {
        onComplete(newHistory);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="w-full glass-panel border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Curriculum Assessment</h2>
            <p className="text-sm text-slate-400 mt-1">Customizing your roadmap for <span className="text-emerald-400 font-medium">{topic}</span></p>
          </div>

          {/* Step indicator */}
          <div className="ml-auto flex items-center gap-2">
            {[1, 2].map(step => {
              const userCount = messages.filter(m => m.role === 'user').length;
              const isDone = userCount >= step;
              const isActive = userCount === step - 1;
              return (
                <div
                  key={step}
                  className={`w-7 h-7 rounded-full border text-xs font-bold flex items-center justify-center transition-all duration-300
                    ${isDone
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : isActive
                      ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 border-slate-700 text-slate-600'
                    }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-500/10">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 text-sm leading-relaxed rounded-3xl ${msg.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-tr-none' : 'bg-emerald-950/30 border border-emerald-500/20 text-slate-200 rounded-tl-none shadow-[0_0_15px_rgba(16,185,129,0.05)]'}`}>
                <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-emerald-950/10 border border-emerald-500/10 text-emerald-400 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 text-sm">
                <Loader className="w-4 h-4 animate-spin" /> Compiling your custom roadmap...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating}
              placeholder={
                messages.filter(m => m.role === 'user').length === 0
                  ? 'e.g. I am a complete beginner'
                  : 'e.g. I want to focus on practical applications...'
              }
              className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600"
              autoFocus
            />
            <button
              type="submit"
              disabled={!isInputValid || isGenerating}
              className="px-6 rounded-2xl bg-emerald-500 text-slate-950 disabled:opacity-30 transition-all hover:bg-emerald-400"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {input.length > 0 && !isInputValid && (
            <p className="text-xs text-slate-500 px-2 transition-all">
              {MIN_LENGTH - input.trim().length} more character{MIN_LENGTH - input.trim().length !== 1 ? 's' : ''} needed
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
