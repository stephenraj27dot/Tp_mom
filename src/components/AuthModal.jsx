import React, { useState } from 'react';
import {
  User, Mail, Lock, Briefcase, Building, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle2, AlertCircle, X, LogIn, UserPlus, Users
} from 'lucide-react';
import { signIn, signUp, getTeamMembers } from '../services/supabaseService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, forceAuth = false, theme = 'dark' }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamRole, setTeamRole] = useState('Sales & Growth Specialist');
  const [department, setDepartment] = useState('Tech & Product');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const teamMembers = getTeamMembers();

  const handleQuickLogin = async (memberEmail, memberPass = 'password123') => {
    setError(null);
    setLoading(true);
    try {
      const session = await signIn({ email: memberEmail, password: memberPass });
      setSuccessMsg(`Welcome back, ${session.user.fullName}!`);
      setTimeout(() => {
        onAuthSuccess(session.user);
        if (onClose) onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const session = await signIn({ email, password });
        setSuccessMsg(`Welcome, ${session.user.fullName}!`);
        setTimeout(() => {
          onAuthSuccess(session.user);
          if (onClose) onClose();
        }, 500);
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        const session = await signUp({
          email,
          password,
          fullName,
          teamRole,
          department
        });
        setSuccessMsg(`Account created for ${session.user.fullName}! Logging you in...`);
        setTimeout(() => {
          onAuthSuccess(session.user);
          if (onClose) onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-md my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 transition-all ${
          isDark
            ? 'bg-[#0A0F1D] border-white/[0.1] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Dismiss Button (only if not forced) */}
        {!forceAuth && onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white bg-white/[0.04]' : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tamilpreneur Enterprise AI Studio</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {mode === 'signin' ? 'Sign In To Your Workspace' : 'Create Team Account'}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'signin'
              ? 'Access your private MOMs, sales call intelligence, and CRM history.'
              : 'Join your organization. Each team member has isolated private data.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={`flex items-center p-1 rounded-xl mb-6 ${isDark ? 'bg-black/50 border border-white/[0.06]' : 'bg-slate-100'}`}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/30'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/30'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Stephen Raj"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border focus:ring-1 focus:ring-[#ff4d5a] outline-none transition-all ${
                      isDark
                        ? 'bg-black/40 border-white/[0.08] text-white focus:border-[#ff4d5a]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#ff4d5a]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full px-2.5 py-2.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Tech & Product">Tech &amp; Product</option>
                    <option value="Sales & Growth">Sales &amp; Growth</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={teamRole}
                    onChange={(e) => setTeamRole(e.target.value)}
                    placeholder="e.g. Sales Specialist"
                    className={`w-full px-2.5 py-2.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tamilpreneur.in"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border focus:ring-1 focus:ring-[#ff4d5a] outline-none transition-all ${
                  isDark
                    ? 'bg-black/40 border-white/[0.08] text-white focus:border-[#ff4d5a]'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#ff4d5a]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm border focus:ring-1 focus:ring-[#ff4d5a] outline-none transition-all ${
                  isDark
                    ? 'bg-black/40 border-white/[0.08] text-white focus:border-[#ff4d5a]'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#ff4d5a]'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-executive-primary py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#ff4d5a]/25 mt-2"
          >
            <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Team Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Team Logins (1-Click for Testing) */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Users className="w-3.5 h-3.5 text-[#ff4d5a]" />
              Quick Demo Team Logins
            </span>
            <span className="text-[10px] font-mono text-emerald-400">1-Click Test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {teamMembers.slice(0, 3).map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickLogin(member.email)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group hover:scale-[1.02] ${
                  isDark
                    ? 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-[#ff4d5a]/40'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#ff4d5a]/40'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ff4d5a]/20 border border-[#ff4d5a]/30 text-[#ff4d5a] flex items-center justify-center font-bold text-xs shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {member.fullName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {member.teamRole.split(' ')[0]}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Guest fallback if forceAuth is true */}
        {forceAuth && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                const guest = {
                  id: 'guest_user',
                  fullName: 'Guest Member',
                  email: 'guest@tamilpreneur.in',
                  teamRole: 'Guest Explorer',
                  department: 'General',
                  avatar: 'GM'
                };
                onAuthSuccess(guest);
                if (onClose) onClose();
              }}
              className="text-xs font-mono text-slate-400 hover:text-white underline transition-colors cursor-pointer"
            >
              Continue as Guest (Preview without login)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
