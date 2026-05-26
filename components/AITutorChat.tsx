'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoadmapNode } from '@/types';
import { Send, GraduationCap, Sparkles, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AITutorChatProps {
  activeNode: RoadmapNode | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isGenerating: boolean;
  onTriggerCheckpoint: () => void;
}

export default function AITutorChat({ 
  activeNode, 
  chatHistory, 
  onSendMessage, 
  isGenerating,
  onTriggerCheckpoint 
}: AITutorChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Tutor Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Socratic Mentor</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active learning mode
            </span>
          </div>
        </div>
        
        {activeNode && (
          <button
            onClick={onTriggerCheckpoint}
            disabled={activeNode.status === 'completed'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Checkpoint Test
          </button>
        )}
      </div>

      {/* Main Chat Display */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-500/10">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 max-w-sm mx-auto">
            <GraduationCap className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-sm font-medium text-slate-300">
              {activeNode 
                ? `Click above to begin learning "${activeNode.title}". I will guide you step-by-step using first principles.` 
                : 'Select an unlocked roadmap node on the left to activate your Socratic mentor.'}
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border
                  ${msg.role === 'user'
                    ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none'
                    : msg.role === 'system'
                    ? 'bg-slate-900/60 border-emerald-500/30 text-emerald-300 rounded-tl-none italic'
                    : 'bg-emerald-950/20 border-emerald-500/10 text-slate-200 rounded-tl-none'
                  }
                `}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1 marker:text-emerald-500" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1 marker:text-emerald-500" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-emerald-300" {...props} />,
                      code: ({ node, inline, ...props }: any) =>
                        inline
                          ? <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                          : <code className="block bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs font-mono whitespace-pre-wrap my-2" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-emerald-950/10 border border-emerald-500/5 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Formulating question...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/40 border-t border-slate-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeNode ? "Write your explanation or query here..." : "Select a milestone first..."}
          disabled={!activeNode || isGenerating}
          className="flex-1 bg-slate-950 border border-slate-900 focus:border-emerald-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        />
        <button
          type="submit"
          disabled={!input.trim() || isGenerating || !activeNode}
          className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
