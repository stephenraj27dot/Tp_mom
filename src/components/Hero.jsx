import React from 'react';
import { Mic, PhoneCall } from 'lucide-react';

export default function Hero({ activeTab = 'mom' }) {
  if (activeTab === 'call_analyzer') {
    return (
      <div className="pt-6 pb-4 text-center max-w-2xl mx-auto px-4 animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#ff4d5a]/25 bg-[#ff4d5a]/10 text-[#ff4d5a] font-mono text-[11px] mb-3 transition-colors cursor-default">
          <PhoneCall className="w-3 h-3" />
          <span>GEMINI AI LEAD INTELLIGENCE • SALES CONVERSATION COACHING</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Sales Call To{' '}
          <span className="text-[#ff4d5a]">
            Actionable CRM
          </span>
        </h1>

        <p className="mt-2.5 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Upload sales recordings in <span className="text-white font-mono font-medium">.MP3</span>,{' '}
          <span className="text-white font-mono font-medium">.WAV</span>, or <span className="text-white font-mono font-medium">WhatsApp Call</span> to automatically detect leads, extract client requirements, identify objections, and get AI sales coaching suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-4 text-center max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 font-mono text-[11px] mb-3 transition-colors cursor-default">
        <Mic className="w-3 h-3 text-[#ff4d5a]" />
        <span>DIRECT GEMINI AI • WORD &amp; GOOGLE DOCS OUTPUT</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
        Voice To{' '}
        <span className="text-[#ff4d5a]">
          Executive Record
        </span>
      </h1>

      <p className="mt-2.5 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
        Ingest meeting recordings in <span className="text-white font-mono font-medium">.MP3</span>,{' '}
        <span className="text-white font-mono font-medium">.WAV</span>, or <span className="text-white font-mono font-medium">WhatsApp Audio</span> to transcribe, distill decisions, and synthesize formatted executive minutes.
      </p>
    </div>
  );
}
