import React, { useState, useRef, useEffect } from 'react';
import {
  HardDrive, ExternalLink, FileText, PhoneCall, Table, Moon, Sun,
  Settings, History, LogIn, LogOut, User, ChevronDown, Shield
} from 'lucide-react';

const MOM_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';
const CRM_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/17zWVa_hCrkreGLOT6mNLIHJJDUp-FUAbW09yisn9nVs/edit?gid=0#gid=0';

export default function Header({
  activeTab = 'mom',
  onTabChange,
  theme = 'dark',
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenSettings,
  onOpenActivity,
  onSignOut
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-xl ${
        isDark
          ? 'bg-[#070B12]/90 border-white/[0.08] text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Instrument Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
          <div className="relative group cursor-pointer shrink-0" title="Tamilpreneur AI Studio">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-[#ff4d5a]/20 border border-[#ff4d5a]/30 shrink-0 bg-[#ff4d5a]/10 flex items-center justify-center p-1 sm:p-1.5 transition-transform group-hover:scale-105">
              <img
                src="/tamilpreneur-logo.png"
                alt="Tamilpreneur Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              <span className={`font-extrabold tracking-tight text-sm sm:text-base md:text-lg truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-[#ff4d5a] font-black">T</span>amil
                <span className="text-[#ff4d5a] font-black">P</span>reneur{' '}
                <span className="font-black">Studio</span>
              </span>
              <span className="hidden lg:inline-block font-mono text-[9px] text-[#ff4d5a] font-bold uppercase px-1.5 py-0.5 rounded border border-[#ff4d5a]/30 bg-[#ff4d5a]/10">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden sm:block truncate">
              {activeTab === 'mom' ? 'Speech-to-MOM Generator' : 'Lead Intelligence CRM'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (MOM vs Call Analyzer) */}
        <div className={`flex items-center p-1 rounded-xl shrink-0 ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-100 border border-slate-200'}`}>
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('mom')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mom'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/25'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MOM Generator</span>
            <span className="sm:hidden">MOM</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('call_analyzer')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'call_analyzer'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/25'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Analyzer</span>
            <span className="sm:hidden">Call</span>
          </button>
        </div>

        {/* Right Controls: Theme Toggle + Settings + User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.08] text-amber-400 border border-white/[0.08]'
                : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border border-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`hidden sm:flex p-2 rounded-xl transition-all cursor-pointer ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
            }`}
            title="Workspace Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Account / Profile Dropdown */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#ff4d5a] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.avatar || 'TP'}
                </div>
                <div className="hidden md:block text-left min-w-0 max-w-[100px]">
                  <p className="text-xs font-bold truncate leading-tight">
                    {currentUser.fullName.split(' ')[0]}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 truncate">
                    {currentUser.teamRole.split(' ')[0]}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-fade-in ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/[0.1] text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
                  }`}
                >
                  <div className="p-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#ff4d5a]/10 text-[#ff4d5a]">
                      {currentUser.teamRole}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onOpenActivity(); }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/[0.06] text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <History className="w-4 h-4 text-[#ff4d5a]" />
                    <span>My Activity &amp; History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onOpenSettings(); }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/[0.06] text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>Workspace Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onOpenAuth(); }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/[0.06] text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Switch Team Member</span>
                  </button>

                  <div className="my-1 border-t border-white/[0.08]" />

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onSignOut(); }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-executive-primary px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs text-white flex items-center space-x-1.5 cursor-pointer shadow-md shadow-[#ff4d5a]/25"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
