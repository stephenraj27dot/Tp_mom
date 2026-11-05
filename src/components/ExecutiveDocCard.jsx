import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText, RotateCcw, FolderCheck, Sparkles, MessageSquare, CheckCircle2, ListChecks, Calendar, User, AlignLeft, Trash2 } from 'lucide-react';

export default function ExecutiveDocCard({ result, onReset, onDeleteCurrent }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);

  const rawDoc =
    result?.documentUrl ||
    result?.webViewLink ||
    result?.data?.documentUrl ||
    result?.data?.webViewLink;

  const validId =
    result?.id ||
    result?.documentId ||
    result?.data?.id ||
    result?.data?.documentId;

  const docUrl =
    rawDoc && !rawDoc.includes('/d//edit') && rawDoc.startsWith('https://')
      ? rawDoc
      : (validId && typeof validId === 'string' && validId.trim().length > 5)
      ? `https://docs.google.com/document/d/${validId}/edit`
      : 'https://docs.google.com/document/d/1v0L9I6qEHtReAEkk5BVDXOjZUQUozCcNw1_RBhunXDU/edit';

  const docTitle =
    result?.title ||
    result?.data?.title ||
    'Minutes of Meeting';

  const docDept =
    result?.department ||
    result?.data?.department ||
    'General';

  const summary = result?.summary || result?.data?.summary;
  const decisions = result?.decisions || result?.data?.decisions || [];
  const actionItems = result?.action_items || result?.data?.action_items || [];
  const discussionPoints = result?.discussion_points || result?.data?.discussion_points || [];

  const copyUrl = () => {
    navigator.clipboard.writeText(docUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyForTeam = () => {
    let text = `📌 *MOM: ${docTitle}*\n🏷 *Team:* ${docDept}\n🗓 *Date:* ${result?.date || new Date().toLocaleDateString()}\n`;

    if (summary) {
      text += `\n📝 *Summary:*\n${summary}\n`;
    }

    if (decisions.length > 0) {
      text += `\n🎯 *Decisions Agreed:*\n${decisions.map(d => `• ${d}`).join('\n')}\n`;
    }

    if (actionItems.length > 0) {
      text += `\n✅ *Action Items:*\n${actionItems.map(a => `• ${a.task} — @${a.assigned_to || 'Assignee'} (Due: ${a.deadline || 'TBD'})`).join('\n')}\n`;
    }

    text += `\n📄 *Full Document Link:*\n${docUrl}`;

    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff4d5a] font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> OFFICIAL ARTIFACT SYNTHESIZED
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md">
              {docTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#ff4d5a]/10 text-[#ff4d5a] border border-[#ff4d5a]/20">
            {docDept}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SYNCED TO DRIVE
          </span>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <a
          href={docUrl}
          target="_blank"
          rel="noreferrer"
          className="group btn-executive-primary inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide cursor-pointer text-center"
        >
          <span>OPEN IN GOOGLE DOCS</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
        </a>

        <button
          type="button"
          onClick={copyForTeam}
          className="group btn-executive-secondary inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
        >
          {copiedSlack ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED FOR SLACK/WHATSAPP</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-slate-300 group-hover:scale-110 group-hover:text-[#ff4d5a] transition-all" />
              <span>COPY FOR SLACK / WHATSAPP</span>
            </>
          )}
        </button>
      </div>

      {/* Executive Summary Card (if synthesized) */}
      {summary && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#ff4d5a]" /> Executive Brief
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Decisions & Action Items Grid */}
      {(decisions.length > 0 || actionItems.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
          {decisions.length > 0 && (
            <div className="rounded-2xl bg-black/40 border border-emerald-500/20 p-4 space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Decisions Agreed ({decisions.length})
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                {decisions.slice(0, 4).map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actionItems.length > 0 && (
            <div className="rounded-2xl bg-black/40 border border-[#ff4d5a]/20 p-4 space-y-2">
              <div className="text-[11px] font-mono text-[#ff4d5a] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" /> Action Owners ({actionItems.length})
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pl-1">
                {actionItems.slice(0, 3).map((item, i) => (
                  <li key={i} className="border-b border-white/[0.04] pb-1.5 last:border-none">
                    <div className="font-medium text-white">{item.task}</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span className="text-[#ff4d5a] flex items-center gap-1">
                        <User className="w-2.5 h-2.5" /> {item.assigned_to || 'Assignee'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {item.deadline || 'TBD'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Target Metadata & Links */}
      <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 text-left font-mono text-xs space-y-2.5 mb-6">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>DESTINATION FOLDER:</span>
          <a
            href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-semibold truncate underline"
          >
            <FolderCheck className="w-3.5 h-3.5" /> /meeting-audio (Open Drive)
          </a>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>DOC LINK:</span>
          <button
            type="button"
            onClick={copyUrl}
            className="text-slate-300 hover:text-white flex items-center gap-1 underline truncate max-w-[220px] sm:max-w-xs cursor-pointer"
          >
            {copiedUrl ? 'Copied!' : 'Copy direct link'}
          </button>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>GENERATED ON:</span>
          <span className="text-slate-200">{new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ingest another meeting tape</span>
        </button>

        {onDeleteCurrent && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this saved MOM record?')) {
                onDeleteCurrent();
              }
            }}
            className="inline-flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer py-1.5 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete this MOM</span>
          </button>
        )}
      </div>
    </div>
  );
}
