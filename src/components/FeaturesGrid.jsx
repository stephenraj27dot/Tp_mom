import React from 'react';
import { Sparkles, Zap, BrainCircuit, FileText } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      title: 'Gemini 3.5 STT Engine',
      desc: 'High-fidelity speech transcription preserving multi-speaker turns, technical jargon, and natural dialogue.',
      icon: Sparkles,
      tag: 'SPEECH-TO-TEXT',
    },
    {
      title: 'Zero Make.com Credits',
      desc: 'Powered directly by Google Gemini AI API with zero Make.com dependency, zero monthly ops limits, and instant turnaround.',
      icon: Zap,
      tag: '100% DIRECT AI',
    },
    {
      title: 'Actionable MOM Parsing',
      desc: 'Extracts discussion items, agreed decisions, assigned owners, and hard deadlines into structured points.',
      icon: BrainCircuit,
      tag: 'AI STRUCTURING',
    },
    {
      title: 'Google Docs Auto-Sync',
      desc: 'Generates clean, executive-ready Google Docs saved directly inside your team’s shared meeting folder.',
      icon: FileText,
      tag: 'DOCS INTEGRATION',
    },
  ];

  return (
    <div className="pt-8 pb-12 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff4d5a] mb-1">
          STUDIO CAPABILITIES
        </h3>
        <p className="text-lg sm:text-xl font-bold text-white">
          Enterprise-Grade Meeting Intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-3xl border border-rose-500/15 hover:border-[#ff4d5a]/40 bg-slate-900/40 hover:bg-slate-900/70 p-5 sm:p-6 transition-all duration-300 backdrop-blur-md shadow-sm hover:shadow-lg hover:shadow-[#ff4d5a]/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff4d5a]/20 to-rose-600/10 border border-[#ff4d5a]/30 flex items-center justify-center text-[#ff4d5a] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 group-hover:text-rose-400/80 transition-colors">
                  {feat.tag}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 group-hover:text-rose-100 transition-colors">
                {feat.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

