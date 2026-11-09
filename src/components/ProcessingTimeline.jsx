import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Mic, BrainCircuit, FileCheck, Cloud } from 'lucide-react';

export default function ProcessingTimeline({ currentStage, error }) {
  const stages = [
    {
      id: 1,
      title: 'Direct Audio Ingestion',
      desc: 'Transmitting and preparing audio payload for Google Gemini AI',
      icon: Cloud,
    },
    {
      id: 2,
      title: 'Gemini Speech Intelligence',
      desc: 'Transcribing speech turns with multi-speaker diarization',
      icon: Mic,
    },
    {
      id: 3,
      title: 'MOM Decision Extraction',
      desc: 'Structuring discussion points, tasks, deadlines & priorities',
      icon: BrainCircuit,
    },
    {
      id: 4,
      title: 'Executive Artifact Synthesis',
      desc: 'Formatting executive minutes ready for instant export & sync',
      icon: FileCheck,
    },
  ];

  return (
    <div className="rounded-3xl border border-rose-500/25 bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/30">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <Loader2 className="w-5 h-5 text-[#ff4d5a] animate-spin" />
            Executing Direct AI Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct Google Gemini AI processing (Zero Make.com credits required)
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-[#ff4d5a] border border-rose-500/30">
          Running Stage {Math.min(currentStage, 4)} of 4
        </span>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isDone = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isPending = currentStage < stage.id;

          return (
            <div
              key={stage.id}
              className={`flex items-start space-x-3.5 p-3.5 rounded-2xl transition-all duration-300 border ${
                isCurrent
                  ? 'bg-[#ff4d5a]/10 border-[#ff4d5a]/40 shadow-md shadow-[#ff4d5a]/10'
                  : isDone
                  ? 'bg-slate-950/40 border-emerald-500/25'
                  : 'bg-slate-950/20 border-slate-800/40 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDone
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : isCurrent
                    ? 'bg-[#ff4d5a]/20 border-[#ff4d5a]/50 text-[#ff4d5a]'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent
                        ? 'text-white'
                        : isDone
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-medium text-[#ff4d5a] uppercase animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono font-medium text-emerald-400">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          <b>Error encountered:</b> {error}
        </div>
      )}
    </div>
  );
}

