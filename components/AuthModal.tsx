'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name');
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl z-10 backdrop-blur-xl animate-in zoom-in-95 duration-350">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-950 border border-slate-800/80 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-[280px]">
            {isSignUp ? 'Join LearnIT to sync your custom roadmaps and milestones' : 'Sign in to sync your custom roadmaps across devices'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-in shake duration-300">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800/80 focus:border-emerald-500/50 focus:outline-none rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800/80 focus:border-emerald-500/50 focus:outline-none rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-950 border border-slate-800/80 focus:border-emerald-500/50 focus:outline-none rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center select-none">
          <div className="absolute inset-x-0 top-1/2 border-t border-slate-800" />
          <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
            Or continue with
          </span>
        </div>

        {/* Google Login */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-semibold text-sm hover:border-slate-700"
        >
          {/* Custom Google SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.98 1 12 1 7.24 1 3.2 3.75 1.2 7.78l3.86 3C5.98 7.9 8.74 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.4-4.94 3.4-8.55z"
            />
            <path
              fill="#FBBC05"
              d="M5.06 14.78c-.23-.68-.36-1.4-.36-2.15s.13-1.47.36-2.15l-3.86-3C.44 9.07 0 10.48 0 12s.44 2.93 1.2 4.38l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.26 0-6.02-2.86-7.01-5.74l-3.86 3C3.2 20.25 7.24 23 12 23z"
            />
          </svg>
          Google
        </button>

        {/* Footer Toggle */}
        <p className="text-center text-xs text-slate-500 mt-8">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

      </div>
    </div>
  );
}
