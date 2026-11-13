import React, { useMemo } from 'react';
import { FileText, PhoneCall, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function ExecutiveKpiBar({ momArchive = [], callArchive = [] }) {
  const stats = useMemo(() => {
    const totalMeetings = momArchive.length;
    const totalCalls = callArchive.length;
    const wonLeads = callArchive.filter(
      (c) => (c.data?.lead_status || c.lead_status || '').toLowerCase() === 'won'
    ).length;
    const activePipeline = callArchive.filter((c) => {
      const st = (c.data?.lead_status || c.lead_status || '').toLowerCase();
      return ['negotiation', 'under discussion', 'requirement collected', 'contacted', 'new'].includes(st);
    }).length;

    // Estimate ~45 mins saved per meeting/call automated
    const hoursSaved = Math.max(1, Math.round(((totalMeetings + totalCalls) * 45) / 60));

    return { totalMeetings, totalCalls, wonLeads, activePipeline, hoursSaved };
  }, [momArchive, callArchive]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-1 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        {/* Metric 1 */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-white/[0.02]">
          <div className="w-8 h-8 rounded-lg bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Meetings</div>
            <div className="text-sm sm:text-base font-extrabold text-white">{stats.totalMeetings} Synthesized</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-white/[0.02]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Calls Analyzed</div>
            <div className="text-sm sm:text-base font-extrabold text-white">{stats.totalCalls} Calls</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-white/[0.02]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Won Deals</div>
            <div className="text-sm sm:text-base font-extrabold text-white">{stats.wonLeads} Closed</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-white/[0.02]">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Time Saved</div>
            <div className="text-sm sm:text-base font-extrabold text-white">~{stats.hoursSaved} hrs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
