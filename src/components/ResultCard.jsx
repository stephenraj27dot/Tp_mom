import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileCheck, ArrowRight, RotateCcw, FolderOpen } from 'lucide-react';

export default function ResultCard({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  const docUrl =
    result?.documentUrl ||
    (result?.documentId
      ? `https://docs.google.com/document/d/${result.documentId}/edit`
      : 'https://docs.google.com');

  const copyUrl = () => {
    navigator.clipboard.writeText(docUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 text-center animate-fade-in">
      {/* Success Badge Icon */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
        <FileCheck className="w-8 h-8" />
      </div>

      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
        Automation Succeeded
      </span>

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
        Minutes of Meeting Ready!
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-md mx-auto">
        Your meeting audio has been transcribed, structured into actionable notes, and synced directly to Google Docs.
      </p>

      {/* Primary Google Doc CTA Button */}
      <div className="max-w-md mx-auto mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={docUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff4d5a] to-[#ff3344] hover:from-[#ff3a48] hover:to-[#ff1f32] text-white font-bold text-sm shadow-xl shadow-[#ff4d5a]/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span>Open Google Doc</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          type="button"
          onClick={copyUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Metadata Preview Box */}
      <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left mb-6 text-xs text-slate-300 space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Meeting Title:</span>
          <span className="font-semibold text-white truncate max-w-[250px]">
            {result?.title || 'Minutes of Meeting'}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Date:</span>
          <span className="font-mono text-slate-200">{result?.date || new Date().toISOString().split('T')[0]}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400">Stored In Google Drive:</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5" /> /meeting-audio
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Process another meeting recording</span>
      </button>
    </div>
  );
}

