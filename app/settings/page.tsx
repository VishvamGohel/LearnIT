'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Sparkles, 
  Save,
  LogOut,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';

export default function SettingsPage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      await updateProfile(displayName.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg shadow-slate-900">
              <SettingsIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight hidden sm:block">Account Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* PROFILE SECTION */}
        <section className="glass-panel rounded-3xl border border-slate-800/60 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Public Profile</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you want to be called"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="text"
                value={user.email || 'Signed in via Google'}
                disabled
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-2">Your email address is managed by your authentication provider (Google).</p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                Profile updated successfully!
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/60 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || displayName === user.displayName}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm transition-all duration-200"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* DANGER ZONE */}
        <section className="glass-panel rounded-3xl border border-red-900/30 p-6 md:p-8 bg-red-950/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-slate-100">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-semibold text-slate-200">Sign Out</h3>
              <p className="text-sm text-slate-500 mt-0.5">Log out of this device. You will need to authenticate again to access your roadmaps.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all duration-200 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
