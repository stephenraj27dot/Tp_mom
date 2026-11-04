import React from 'react';
import { Mic } from 'lucide-react';

export default function Hero() {
  return (
    <div className="pt-6 pb-4 text-center max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 font-mono text-[11px] mb-3 transition-colors cursor-default">
        <Mic className="w-3 h-3 text-[#ff4d5a]" />
        <span>GEMINI 3.5 STT • DIRECT GOOGLE DOCS OUTPUT</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
        Voice To{' '}
        <span className="text-[#ff4d5a]">
          Executive Record
        </span>
      </h1>

      <p className="mt-2.5 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
        Ingest meeting recordings in <span className="text-white font-mono font-medium">.MP3</span> or{' '}
        <span className="text-white font-mono font-medium">.WAV</span> to transcribe, distill decisions, and synthesize formatted executive minutes directly to Google Drive.
      </p>
    </div>
  );
}
