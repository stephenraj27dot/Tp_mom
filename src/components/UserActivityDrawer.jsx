import React from 'react';
import {
  X, Clock, FileText, PhoneCall, CheckCircle2, Share2, LogIn,
  Sparkles, History, UserCheck
} from 'lucide-react';
import { getUserActivityLogs } from '../services/supabaseService';

export default function UserActivityDrawer({ isOpen, onClose, user, theme = 'dark' }) {
  if (!isOpen || !user) return null;

  const logs = getUserActivityLogs(user.id);
  const isDark = theme === 'dark';

  const formatTimestamp = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'mom_synthesized':
        return <FileText className="w-4 h-4 text-[#ff4d5a]" />;
      case 'call_analyzed':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'account_created':
      case 'logged_in':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'shared_whatsapp':
      case 'shared_email':
        return <Share2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md h-full shadow-2xl p-6 flex flex-col border-l transition-all ${
          isDark
            ? 'bg-[#0A0F1D] border-white/[0.08] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff4d5a]/15 border border-[#ff4d5a]/30 flex items-center justify-center text-[#ff4d5a]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Activity &amp; Recent Work
              </h3>
              <p className="text-xs text-slate-400">{user.fullName}'s Audit Trail</p>
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

        {/* User Card */}
        <div className="my-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff4d5a] text-white font-black flex items-center justify-center text-sm shadow-md">
            {user.avatar || 'TP'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            <p className="text-[10px] font-mono text-[#ff4d5a]">{user.teamRole} • {user.department}</p>
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-mono">No recent activity logged yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">Your synthesized MOMs and analyzed calls will appear here.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/[0.06] shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {log.details}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] font-mono text-slate-400">
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] text-center">
          <p className="text-[10px] font-mono text-slate-500">
            Protected with Row Level Security &bull; User ID: {user.id.slice(0, 16)}...
          </p>
        </div>
      </div>
    </div>
  );
}
