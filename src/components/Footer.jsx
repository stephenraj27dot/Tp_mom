import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-rose-500/10 bg-[#090D16]/95 py-8 text-center text-xs text-slate-500">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-lg overflow-hidden border border-[#ff4d5a]/30 p-0.5 bg-[#ff4d5a]/10">
            <img src="/tamilpreneur-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-slate-400">
            Tamilpreneur Studio • AI Automation Engine
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise Core Team Edition • 100% Confidential</span>
        </div>
      </div>
    </footer>
  );
}
