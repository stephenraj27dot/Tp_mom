import React, { useState } from 'react';
import {
  X, User, Shield, Database, Moon, Sun, Globe, Check, Copy,
  CheckCircle2, AlertCircle, Save, ExternalLink, Users, Layers
} from 'lucide-react';
import {
  getCurrentUser, updateProfile, isSupabaseConfigured,
  setCustomSupabaseConfig, getTeamMembers
} from '../services/supabaseService';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
  onProfileUpdated
}) {
  const currentUser = getCurrentUser() || {
    id: 'guest',
    fullName: 'Team Member',
    email: 'member@tamilpreneur.in',
    teamRole: 'Specialist',
    department: 'General',
    avatar: 'TM'
  };

  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [teamRole, setTeamRole] = useState(currentUser.teamRole || '');
  const [department, setDepartment] = useState(currentUser.department || 'General');

  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('tp_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('tp_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'database' | 'team'

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isCloudConnected = isSupabaseConfigured();
  const teamMembers = getTeamMembers();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({
        fullName,
        teamRole,
        department,
        avatar: fullName.slice(0, 2).toUpperCase()
      });
      if (onProfileUpdated) onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  };

  const handleSaveSupabase = () => {
    const res = setCustomSupabaseConfig(supabaseUrl, supabaseAnonKey);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        window.location.reload();
      }, 1000);
    } else {
      alert('Failed to connect: ' + res.error);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Tamilpreneur Supabase Schema:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  team_role TEXT,
  department TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.mom_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  decisions JSONB,
  action_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.call_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  lead_status TEXT,
  summary TEXT,
  requirements JSONB,
  follow_ups JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-xl my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 transition-all ${
          isDark
            ? 'bg-[#0A0F1D] border-white/[0.1] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff4d5a]/15 border border-[#ff4d5a]/30 flex items-center justify-center text-[#ff4d5a]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Workspace Settings
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                User Profile, Supabase Database &amp; Corporate Preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white bg-white/[0.04]' : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center p-1 rounded-xl my-5 ${isDark ? 'bg-black/50 border border-white/[0.06]' : 'bg-slate-100'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/30'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile &amp; Theme</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/30'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Database</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/30'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team ({teamMembers.length})</span>
          </button>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* TAB 1: Profile & Preferences */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-12 h-12 rounded-2xl bg-[#ff4d5a] text-white flex items-center justify-center font-black text-base shadow-md">
                {currentUser.avatar || 'TP'}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentUser.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#ff4d5a]/10 text-[#ff4d5a] border border-[#ff4d5a]/20">
                  {currentUser.teamRole}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${
                    isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${
                    isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Tech & Product">Tech &amp; Product</option>
                  <option value="Sales & Growth">Sales &amp; Growth</option>
                  <option value="Marketing & Growth">Marketing &amp; Growth</option>
                  <option value="Operations">Operations</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Role Title
              </label>
              <input
                type="text"
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${
                  isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Theme & Language Quick Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                  {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Display Theme</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.1]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                  }`}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>Switch to {isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#ff4d5a]" />
                  <span>Default Language</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs border outline-none cursor-pointer ${
                    isDark ? 'bg-black/40 border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="english">🇬🇧 English</option>
                  <option value="tamil">🇮🇳 தமிழ் (Tamil)</option>
                  <option value="bilingual">🔄 Bilingual (Tamil + Eng)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-executive-primary px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center space-x-2 cursor-pointer shadow-md shadow-[#ff4d5a]/25"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Supabase Database Configuration */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                  }`}
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    {isCloudConnected ? 'Supabase Cloud: Connected & Active' : 'Storage Engine: Enterprise Local Team Store'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isCloudConnected
                      ? 'All accounts, MOMs, and call reports sync to your cloud PostgreSQL database.'
                      : 'Data is safely partitioned per team member in browser memory.'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isCloudConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {isCloudConnected ? 'ONLINE' : 'ACTIVE'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/[0.08] text-white focus:border-[#ff4d5a] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/[0.08] text-white focus:border-[#ff4d5a] outline-none font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={copySqlSchema}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer border border-white/[0.06]"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Schema Copied!' : 'Copy Supabase SQL Schema'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSupabase}
                className="btn-executive-primary px-5 py-2 rounded-xl font-bold text-xs text-white cursor-pointer shadow-md shadow-[#ff4d5a]/25"
              >
                Save &amp; Connect Cloud
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Team Directory */}
        {activeTab === 'team' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Registered members in your organization. Each member has isolated private history and KPI records.
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#ff4d5a]/20 border border-[#ff4d5a]/30 text-[#ff4d5a] flex items-center justify-center font-bold text-xs shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{member.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08] shrink-0">
                    {member.teamRole}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
