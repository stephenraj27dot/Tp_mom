import React from 'react';
import { HardDrive, ExternalLink, FileText, PhoneCall, Table } from 'lucide-react';

const MOM_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';
const CRM_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/17zWVa_hCrkreGLOT6mNLIHJJDUp-FUAbW09yisn9nVs/edit?gid=0#gid=0';

export default function Header({ activeTab = 'mom', onTabChange }) {
  return (
    <header className="border-b border-white/[0.08] bg-[#070B12]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
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
              <span className="hidden md:inline-block font-mono text-[10px] text-[#ff4d5a] font-bold uppercase px-1.5 py-0.5 rounded border border-[#ff4d5a]/30 bg-[#ff4d5a]/10">
                AI SUITE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden sm:block truncate">
              {activeTab === 'mom' ? 'Autonomous Speech-to-MOM Generator' : 'Lead Intelligence & Sales Coaching CRM'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('mom')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mom'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MOM Generator</span>
            <span className="sm:hidden">MOM</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('call_analyzer')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'call_analyzer'
                ? 'bg-[#ff4d5a] text-white shadow-md shadow-[#ff4d5a]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Analyzer</span>
            <span className="sm:hidden">Call</span>
          </button>
        </div>

        {/* Quick Links & Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>DIRECT AI ACTIVE</span>
          </div>

          {activeTab === 'mom' ? (
            <a
              href={MOM_DRIVE_FOLDER}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-[#ff4d5a]/40 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-mono text-[11px] transition-all"
              title="Open Google Drive folder /meeting-audio"
            >
              <HardDrive className="w-3 h-3 text-[#ff4d5a]" />
              <span>/meeting-audio</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          ) : (
            <a
              href={CRM_SHEETS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/25 hover:border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:text-white font-mono text-[11px] transition-all"
              title="Open Google Sheets CRM"
            >
              <Table className="w-3 h-3 text-emerald-400" />
              <span>Sheets CRM</span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
