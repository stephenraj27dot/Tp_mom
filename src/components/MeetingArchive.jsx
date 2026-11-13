import React, { useState, useMemo } from 'react';
import {
  FileText, ExternalLink, Copy, Check, Trash2, Calendar, Tag,
  ChevronDown, ChevronUp, Archive, Eye, Download, Search, Filter, PhoneCall
} from 'lucide-react';

export default function MeetingArchive({ meetings = [], onClear, onDelete, onSelect, activeTab = 'mom' }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const isCallMode = activeTab === 'call_analyzer';

  // Categories extracted from list
  const categories = useMemo(() => {
    const set = new Set();
    meetings.forEach((m) => {
      const cat = m.department || m.data?.lead_status || m.data?.department;
      if (cat) set.add(cat);
    });
    return ['All', ...Array.from(set)];
  }, [meetings]);

  // Filtered list
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const title = (m.title || '').toLowerCase();
      const summary = (m.summary || '').toLowerCase();
      const dept = (m.department || m.data?.lead_status || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || title.includes(term) || summary.includes(term) || dept.includes(term);
      const matchesCategory =
        categoryFilter === 'All' ||
        (m.department || m.data?.lead_status || '') === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [meetings, searchTerm, categoryFilter]);

  // Export full archive to CSV
  const exportArchiveCsv = () => {
    if (!meetings || meetings.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (isCallMode) {
      csvContent += 'ID,Company/Client,Status,Date,Summary,Phone,Email,Location\n';
      meetings.forEach((m) => {
        const lead = m.data?.lead || {};
        const row = [
          m.id,
          `"${(m.title || '').replace(/"/g, '""')}"`,
          `"${m.data?.lead_status || 'New'}"`,
          m.date || '',
          `"${(m.summary || '').replace(/"/g, '""')}"`,
          `"${lead.phone || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.location || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      csvContent += 'ID,Title,Department,Date,Summary\n';
      meetings.forEach((m) => {
        const row = [
          m.id,
          `"${(m.title || '').replace(/"/g, '""')}"`,
          `"${m.department || 'General'}"`,
          m.date || '',
          `"${(m.summary || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${isCallMode ? 'Call_Leads_Archive' : 'Meeting_MOM_Archive'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = (meeting) => {
    let text = `📌 *${meeting.title}*\n🏷 *Category:* ${meeting.department || 'General'}\n📅 *Date:* ${meeting.date || 'Recent'}\n`;
    if (meeting.summary) text += `\n📝 *Summary:*\n${meeting.summary}\n`;
    navigator.clipboard.writeText(text);
    setCopiedId(meeting.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!meetings || meetings.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0A0F1D]/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            {isCallMode ? <PhoneCall className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {isCallMode ? 'Call & Lead Intelligence Archive' : 'Team Meeting MOM Archive'}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                {meetings.length} records
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isCallMode
                ? 'Quick access to analyzed sales calls and client intelligence'
                : 'Quick access to recently synthesized executive documents'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <button
            type="button"
            onClick={exportArchiveCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            title="Download full history as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#ff4d5a]" />
            <span>Export CSV</span>
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear all saved records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={isOpen ? 'Collapse archive' : 'Expand archive'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-4 space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archive by title, client, or topic..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-[#ff4d5a]"
              />
            </div>

            {categories.length > 2 && (
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[#ff4d5a] text-white'
                        : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-2.5">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No matching records found in archive.
              </div>
            ) : (
              filteredMeetings.map((m) => (
                <div
                  key={m.id}
                  className="card-hover-interactive flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.15] gap-3 group transition-all"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:text-[#ff4d5a] group-hover:border-[#ff4d5a]/30 transition-all">
                      {isCallMode ? <PhoneCall className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {m.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ff4d5a]/10 text-[#ff4d5a] font-medium text-[10px]">
                          <Tag className="w-3 h-3" />
                          {m.department || m.data?.lead_status || 'General'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {m.date || 'Recent'}
                        </span>
                      </div>
                      {m.summary && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 max-w-xs sm:max-w-lg">
                          {m.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onSelect && onSelect(m)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#ff4d5a] hover:text-white border border-white/[0.08] text-slate-300 text-xs font-mono transition-all cursor-pointer"
                      title="Open full report in workspace"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySummary(m)}
                      className="p-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy summary"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete from archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
