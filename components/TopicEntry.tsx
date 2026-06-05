'use client';
import React, { useState } from 'react';
import { Sparkles, ArrowRight, FileText, Upload, Type } from 'lucide-react';

export default function TopicEntry({ onStart }: { onStart: (topic: string, file?: File) => void }) {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'text' | 'pdf'>('text');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && topic.trim()) {
      onStart(topic.trim());
    } else if (mode === 'pdf' && file && topic.trim()) {
      onStart(topic.trim(), file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 animate-in fade-in zoom-in duration-700 relative">
      
      {/* Background Decorative Blobs for Glassmorphism Context */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="p-2.5 px-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8 inline-flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <span className="text-emerald-300 font-semibold tracking-widest text-xs uppercase drop-shadow-md">AI Learning Engine v2.0</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 text-center tracking-tight mb-8 leading-[1.1]">
        What do you want to <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-[0_0_30px_rgba(52,211,148,0.3)]">
          master
        </span> today?
      </h1>
      
      <form 
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-6 p-6 md:p-8 bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-500 relative overflow-hidden"
      >
        {/* Inner Card Glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Mode Toggle (Segmented Control) */}
        <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md relative z-10 w-full max-w-sm mx-auto mb-2 shadow-inner">
          <button 
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${mode === 'text' ? 'bg-white/10 text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <Type className="w-4 h-4" /> Topic
          </button>
          <button 
            type="button"
            onClick={() => setMode('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${mode === 'pdf' ? 'bg-white/10 text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <FileText className="w-4 h-4" /> Document
          </button>
        </div>

        {mode === 'pdf' && (
          <div className="w-full flex flex-col gap-3 relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="group border border-white/10 bg-black/20 hover:bg-black/40 hover:border-emerald-500/50 rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-md shadow-inner">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${file ? 'bg-emerald-500/20 text-emerald-400 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-400 group-hover:scale-110 group-hover:text-emerald-400'}`}>
                <Upload className="w-8 h-8" />
              </div>
              
              {file ? (
                <div className="text-center z-10">
                  <p className="text-emerald-300 font-bold text-lg">{file.name}</p>
                  <p className="text-emerald-500/70 text-sm mt-1 font-medium tracking-wide">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process</p>
                </div>
              ) : (
                <div className="text-center z-10">
                  <p className="text-slate-200 font-semibold text-lg">Drop your PDF here, or click to browse</p>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Textbooks, syllabuses, or papers (up to 15 pages)</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition duration-500" />
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={mode === 'text' ? "e.g. Neural Networks, Roman History..." : "What is this document about?"}
              className="relative w-full bg-black/40 backdrop-blur-md border border-white/10 px-8 py-5 text-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 rounded-2xl shadow-inner transition-all duration-300"
              autoFocus
            />
          </div>
          
          <button 
            disabled={!mounted || !topic.trim() || (mode === 'pdf' && !file)}
            type="submit" 
            className="group relative px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)] md:w-auto w-full transition-all duration-300 active:scale-[0.98]"
          >
            {/* Button Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="relative z-10 text-slate-950 text-xl tracking-wide flex items-center gap-2">
              Begin <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
