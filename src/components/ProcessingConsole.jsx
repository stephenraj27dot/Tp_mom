import React, { useEffect, useState } from 'react';
import { Loader2, Radio, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ProcessingConsole({ currentStage, error, fileName }) {
  const [tickerTime, setTickerTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    { stage: 1, text: `INGEST: Staging audio payload [${fileName || 'audio.mp3'}]` },
    { stage: 2, text: 'PIPELINE: Streaming audio buffer directly to Google Gemini Engine' },
    { stage: 3, text: 'GEMINI STT: Transcribing speech turns & preserving speaker context' },
    { stage: 4, text: 'INTELLIGENCE: Structuring discussion points, decisions & deadlines' },
    { stage: 5, text: 'SYNTHESIS: Compiling executive Minutes of Meeting artifact' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-[#0A0F1D]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Scanning Laser Beam Effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff4d5a] to-transparent animate-pulse" />

      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff4d5a]/15 border border-[#ff4d5a]/30 flex items-center justify-center text-[#ff4d5a]">
            <Radio className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Executive Processing In Progress
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              DIRECT AI ENGINE: Autonomous Gemini MOM Synthesizer
            </p>
          </div>
        </div>

        <div className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300">
          TIME: 00:{tickerTime < 10 ? `0${tickerTime}` : tickerTime}s
        </div>
      </div>

      {/* Sweeping Radar Bar Visualizer */}
      <div className="relative h-12 bg-black/40 rounded-xl border border-white/[0.06] overflow-hidden mb-6 flex items-center px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4d5a]/20 to-transparent w-48 animate-laser-sweep" />
        <div className="flex items-center space-x-1.5 w-full justify-between">
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                i <= currentStage * 7
                  ? 'bg-[#ff4d5a] h-6'
                  : 'bg-white/[0.08] h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Technical Telemetry Log Feed */}
      <div className="space-y-2 font-mono text-xs">
        {logs.map((log) => {
          const isDone = currentStage > log.stage;
          const isCurrent = currentStage === log.stage;

          if (currentStage < log.stage) return null;

          return (
            <div
              key={log.stage}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-[#ff4d5a]/10 border border-[#ff4d5a]/30 text-white'
                  : 'text-slate-400 bg-white/[0.02]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-[#ff4d5a] animate-spin shrink-0" />
              )}
              <span className="truncate">{log.text}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold">Transmission Interrupted:</span> {error}
          </div>
        </div>
      )}
    </div>
  );
}

