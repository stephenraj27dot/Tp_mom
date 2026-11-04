import React from 'react';
import { HardDrive, ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-white/[0.08] bg-[#070B12]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
        {/* Brand Instrument Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
          <div className="relative group cursor-pointer shrink-0" title="Tamilpreneur Studio">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-[#ff4d5a]/20 border border-[#ff4d5a]/30 shrink-0 bg-[#ff4d5a]/10 flex items-center justify-center p-1 sm:p-1.5 transition-transform group-hover:scale-105">
              <img
                src="/tamilpreneur-logo.png"
                alt="Tamilpreneur Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              <span className="font-extrabold text-white tracking-tight text-sm sm:text-base md:text-lg truncate">
                <span className="text-[#ff4d5a] font-black">T</span>amil
                <span className="text-[#ff4d5a] font-black">P</span>reneur{' '}
                <span className="text-white font-black">Studio</span>
              </span>
              <span className="hidden md:inline-block font-mono text-[10px] text-slate-400 uppercase px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                MOM DECK
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden sm:block truncate">
              Autonomous Speech-to-MOM Executive Generator
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Telemetry Indicator */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] sm:text-[11px] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="hidden sm:inline">MAKE.COM ACTIVE</span>
            <span className="sm:hidden font-bold">ONLINE</span>
          </div>

          <a
            href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-[#ff4d5a]/40 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-mono text-[11px] transition-all hover:-translate-y-0.5 active:scale-95"
            title="Open Google Drive folder /meeting-audio"
          >
            <HardDrive className="w-3 h-3 text-[#ff4d5a]" />
            <span>/meeting-audio</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </header>
  );
}
