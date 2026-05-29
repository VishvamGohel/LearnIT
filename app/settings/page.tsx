'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Save, LogOut, AlertTriangle, ChevronLeft, Sparkles,
  Mail, User as UserIcon, Shield, Camera

} from 'lucide-react';

export default function SettingsPage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');

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

  // Generate initials avatar
  const initials = (displayName || user?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* TOP NAV */}
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all duration-200 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Account Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your identity and preferences</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* LEFT SIDEBAR — Avatar + Nav */}
          <div className="flex flex-col gap-4">
            {/* Avatar card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-6 flex flex-col items-center gap-4 text-center">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 text-3xl font-black text-slate-950 select-none">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-100 text-base">{displayName || 'Your Name'}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{user.email}</div>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">LearnIT Member</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
              {[
                { id: 'profile', label: 'Profile', icon: UserIcon, desc: 'Name & identity' },
                { id: 'account', label: 'Account', icon: Shield, desc: 'Security & sign out' },
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 border-l-2 ${
                    activeTab === id
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-100'
                      : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${activeTab === id ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-slate-600">{desc}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT CONTENT */}
          <div>
            {activeTab === 'profile' && (
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />

                {/* Section header */}
                <div className="p-6 md:p-8 border-b border-slate-800/60">
                  <h2 className="text-lg font-black text-slate-100">Public Profile</h2>
                  <p className="text-sm text-slate-500 mt-1">This is how you appear across LearnIT.</p>
                </div>

                <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => { setDisplayName(e.target.value); setError(''); setSaveSuccess(false); }}
                        placeholder="How you want to be called"
                        className="w-full bg-slate-950/60 border border-slate-700/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-2xl px-4 py-3.5 text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-slate-600 pl-1">Your name is visible on your profile and in your learning roadmaps.</p>
                  </div>

                  {/* Email — read only */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      Email Address
                      <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-700 rounded-md px-1.5 py-0.5">Read-only</span>
                    </label>
                    <input
                      type="text"
                      value={user.email || 'Signed in via Google'}
                      disabled
                      className="w-full bg-slate-950/30 border border-slate-800/60 rounded-2xl px-4 py-3.5 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-600 pl-1">Managed by your Google account.</p>
                  </div>

                  {/* Feedback */}
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/40 rounded-2xl text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  {saveSuccess && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl text-emerald-400 text-sm">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      Profile updated successfully!
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || displayName.trim() === (user.displayName || '')}
                      className="relative flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all duration-200
                        bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02]
                        disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                    >
                      {isSaving ? (
                        <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4">
                {/* Sign Out */}
                <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-800/60">
                    <h2 className="text-lg font-black text-slate-100">Account Security</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your session and account access.</p>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 text-sm">Sign Out</div>
                          <div className="text-xs text-slate-500 mt-0.5">End your current session on this device.</div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all duration-200 hover:text-slate-100 border border-slate-700 hover:border-slate-600 shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>


              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
