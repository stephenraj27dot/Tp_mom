import React from 'react';
import { Disc3, PhoneCall, History, Settings, User } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenActivity,
  onOpenAuth,
  currentUser,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  return (
    <nav
      className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 border-t backdrop-blur-xl transition-all ${
        isDark
          ? 'bg-[#070B12]/95 border-white/[0.08] text-slate-300'
          : 'bg-white/95 border-slate-200 text-slate-700 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* MOM Generator Tab */}
        <button
          type="button"
          onClick={() => onTabChange('mom')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'mom' ? 'text-[#ff4d5a] font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Disc3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">MOM</span>
        </button>

        {/* Call Analyzer Tab */}
        <button
          type="button"
          onClick={() => onTabChange('call_analyzer')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'call_analyzer' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Call CRM</span>
        </button>

        {/* Activity History */}
        <button
          type="button"
          onClick={onOpenActivity}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Activity</span>
        </button>

        {/* Workspace Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Settings</span>
        </button>

        {/* User Account */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-[#ff4d5a] text-white font-bold text-[9px] flex items-center justify-center mb-0.5">
            {currentUser?.avatar || <User className="w-3 h-3" />}
          </div>
          <span className="text-[10px] truncate max-w-[45px]">
            {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
}
