import React, { useState } from 'react';
import { FileText, ExternalLink, Copy, Check, Trash2, Calendar, Tag, ChevronDown, ChevronUp, Archive } from 'lucide-react';

export default function MeetingArchive({ meetings = [], onClear, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleCopySummary = (meeting) => {
    const text = `📌 *MOM: ${meeting.title}*\n🏷 *Team:* ${meeting.department || 'General'}\n🗓 *Date:* ${meeting.date || new Date().toLocaleDateString()}\n\n📄 *Google Doc Link:*\n${meeting.docUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedId(meeting.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!meetings || meetings.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0A0F1D]/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl transition-all">
      {/* Header with Accordion Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Team Meeting Archive
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                {meetings.length} docs
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Quick access to recently synthesized executive documents
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
          title={isOpen ? 'Collapse archive' : 'Expand archive'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Meeting Cards List */}
      {isOpen && (
        <div className="pt-4 space-y-3">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="card-hover-interactive flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.15] gap-3 group"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:text-[#ff4d5a] group-hover:border-[#ff4d5a]/30 transition-all">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {m.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ff4d5a]/10 text-[#ff4d5a] font-medium text-[10px]">
                      <Tag className="w-3 h-3" />
                      {m.department || 'General'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {m.date || 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <a
                  href={m.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group/btn inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#ff4d5a] border border-white/[0.08] hover:border-[#ff4d5a] text-slate-200 hover:text-white text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-[#ff4d5a]/25"
                >
                  <span>Open Doc</span>
                  <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopySummary(m)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                  title="Copy Slack/WhatsApp formatted summary"
                >
                  {copiedId === m.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(m.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {meetings.length > 2 && onClear && (
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear local archive
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

