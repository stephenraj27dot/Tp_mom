import React from 'react';
import { Calendar, Tag, Users, FileEdit } from 'lucide-react';

export default function MeetingDetailsForm({ details, onChange }) {
  const departments = [
    'General & All Hands',
    'Product & Engineering',
    'Executive Leadership',
    'Marketing & Growth',
    'Design & Studio',
    'Operations & HR'
  ];

  return (
    <div className="rounded-3xl border border-rose-500/20 bg-slate-900/50 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-black/20">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <FileEdit className="w-4 h-4 text-[#ff4d5a]" />
        Meeting Context (Optional)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Meeting Title / Subject
          </label>
          <input
            type="text"
            value={details.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Q4 Product Roadmap & Sprint Review"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-[#ff4d5a] focus:ring-1 focus:ring-[#ff4d5a] text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Leave blank to let Gemini auto-detect the title from audio
          </span>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Meeting Date
          </label>
          <input
            type="date"
            value={details.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-[#ff4d5a] focus:ring-1 focus:ring-[#ff4d5a] text-sm text-white transition-all outline-none"
          />
        </div>

        {/* Department / Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Department / Category
          </label>
          <select
            value={details.department}
            onChange={(e) => onChange('department', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-[#ff4d5a] focus:ring-1 focus:ring-[#ff4d5a] text-sm text-white transition-all outline-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept} className="bg-slate-900 text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Attendees / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Key Attendees / Keywords (Optional)
          </label>
          <input
            type="text"
            value={details.attendees}
            onChange={(e) => onChange('attendees', e.target.value)}
            placeholder="e.g. Stephen, Sarah, Alex, Karthik"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-[#ff4d5a] focus:ring-1 focus:ring-[#ff4d5a] text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
}

