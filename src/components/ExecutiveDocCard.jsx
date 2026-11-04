import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText, RotateCcw, FolderCheck, Sparkles, MessageSquare, Share2 } from 'lucide-react';

export default function ExecutiveDocCard({ result, onReset }) {
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
      : validId
      ? `https://docs.google.com/document/d/${validId}/edit`
      : 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';

  const docTitle =
    result?.title ||
    result?.data?.title ||
    'Minutes of Meeting';

  const docDept =
    result?.department ||
    result?.data?.department ||
    'General';

  const copyUrl = () => {
    navigator.clipboard.writeText(docUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyForTeam = () => {
    const text = `📌 *MOM: ${docTitle}*\n🏷 *Team:* ${docDept}\n🗓 *Date:* ${result?.date || new Date().toLocaleDateString()}\n\n📄 *Full Document Link:*\n${docUrl}`;
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
          className="btn-executive-primary inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide cursor-pointer text-center"
        >
          <span>OPEN IN GOOGLE DOCS</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          type="button"
          onClick={copyForTeam}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-100 text-xs sm:text-sm font-semibold transition-all active:scale-95"
        >
          {copiedSlack ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED FOR SLACK/WHATSAPP</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-slate-300" />
              <span>COPY FOR SLACK / WHATSAPP</span>
            </>
          )}
        </button>
      </div>

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
            className="text-slate-300 hover:text-white flex items-center gap-1 underline truncate max-w-[220px] sm:max-w-xs"
          >
            {copiedUrl ? 'Copied!' : 'Copy direct link'}
          </button>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>GENERATED ON:</span>
          <span className="text-slate-200">{new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Reset control */}
      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ingest another meeting tape</span>
        </button>
      </div>
    </div>
  );
}
