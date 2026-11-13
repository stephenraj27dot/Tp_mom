import React, { useState } from 'react';
import {
  ExternalLink, Copy, Check, FileText, RotateCcw, FolderCheck, Sparkles,
  MessageSquare, CheckCircle2, ListChecks, Calendar, User, AlignLeft,
  Trash2, Download, Printer, PlusCircle, Edit3, Save, Share2, Mail, Plus, X
} from 'lucide-react';

export default function ExecutiveDocCard({ result, onReset, onDeleteCurrent, onUpdateRecord }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedForDocs, setCopiedForDocs] = useState(false);

  // ── Inline Edit Mode State ────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(result?.title || result?.data?.title || 'Minutes of Meeting');
  const [department, setDepartment] = useState(result?.department || result?.data?.department || 'General');
  const [date, setDate] = useState(result?.date || result?.data?.date || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(result?.summary || result?.data?.summary || '');
  const [discussionPoints, setDiscussionPoints] = useState(result?.discussion_points || result?.data?.discussion_points || []);
  const [decisions, setDecisions] = useState(result?.decisions || result?.data?.decisions || []);
  const [actionItems, setActionItems] = useState(result?.action_items || result?.data?.action_items || []);

  const rawDoc =
    result?.documentUrl ||
    result?.webViewLink ||
    result?.data?.documentUrl ||
    result?.data?.webViewLink;

  const validId =
    result?.id ||
    result?.documentId ||
    result?.data?.id ||
    result?.data?.documentId;

  const isTrashedPlaceholder = (url) => {
    return !url || url.includes('1v0L9I6qEHtReAEkk5BVDXOjZUQUozCcNw1_RBhunXDU') || url.includes('/d//edit');
  };

  const hasLiveGoogleDoc = rawDoc && !isTrashedPlaceholder(rawDoc) && (rawDoc.startsWith('https://docs.google.com') || rawDoc.startsWith('https://drive.google.com'));

  const docUrl = hasLiveGoogleDoc
    ? rawDoc
    : (validId && typeof validId === 'string' && validId.trim().length > 15 && !validId.includes('1v0L9'))
    ? `https://docs.google.com/document/d/${validId}/edit`
    : null;

  // Save Inline Edits
  const handleSaveEdits = () => {
    setIsEditing(false);
    const updatedResult = {
      ...result,
      title,
      department,
      date,
      summary,
      discussion_points: discussionPoints,
      decisions,
      action_items: actionItems,
      data: {
        ...(result?.data || {}),
        title,
        department,
        date,
        summary,
        discussion_points: discussionPoints,
        decisions,
        action_items: actionItems,
      }
    };
    if (onUpdateRecord) {
      onUpdateRecord(updatedResult);
    }
  };

  const getFormattedMOMText = () => {
    let text = `📌 *MOM: ${title}*\n🏷 *Team:* ${department}\n📅 *Date:* ${date}\n`;
    if (summary) text += `\n📝 *Summary:*\n${summary}\n`;
    if (discussionPoints.length > 0) text += `\n💬 *Discussion Points:*\n${discussionPoints.map((p) => `• ${p}`).join('\n')}\n`;
    if (decisions.length > 0) text += `\n🎯 *Decisions Agreed:*\n${decisions.map((d) => `• ${d}`).join('\n')}\n`;
    if (actionItems.length > 0) {
      text += `\n✅ *Action Items:*\n${actionItems.map((a) => `• ${a.task} — @${a.assigned_to || 'Assignee'} (Due: ${a.deadline || 'TBD'}) [${a.status || 'Pending'}]`).join('\n')}\n`;
    }
    if (docUrl) text += `\n📄 *Drive Document:*\n${docUrl}`;
    return text;
  };

  // Instant Native .DOC Generator with Company Styling
  const downloadOfficialDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 40px; }
          .header { border-bottom: 3px solid #ff4d5a; padding-bottom: 12px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #ff4d5a; color: #ffffff; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
          h1 { color: #0f172a; font-size: 24px; margin: 12px 0 6px 0; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          h2 { color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
          p { margin: 8px 0; font-size: 14px; }
          ul { margin: 8px 0; padding-left: 20px; font-size: 14px; }
          li { margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th { background: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
          td { padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; }
          .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class='header'>
          <span class='badge'>Tamilpreneur Core Team &bull; Official MOM</span>
          <h1>${title}</h1>
          <div class='meta'>
            <strong>Department:</strong> ${department} &nbsp;|&nbsp;
            <strong>Date:</strong> ${date} &nbsp;|&nbsp;
            <strong>Status:</strong> Approved
          </div>
        </div>

        ${summary ? `<h2>1. Executive Summary</h2><p>${summary}</p>` : ''}

        ${discussionPoints.length > 0 ? `
          <h2>2. Key Discussion Points</h2>
          <ul>${discussionPoints.map((p) => `<li>${p}</li>`).join('')}</ul>
        ` : ''}

        ${decisions.length > 0 ? `
          <h2>3. Decisions Agreed</h2>
          <ul>${decisions.map((d) => `<li><strong>&bull;</strong> ${d}</li>`).join('')}</ul>
        ` : ''}

        ${actionItems.length > 0 ? `
          <h2>4. Action Items & Ownership</h2>
          <table>
            <thead>
              <tr>
                <th style='width: 45%;'>Action Item / Task</th>
                <th style='width: 25%;'>Assigned Owner</th>
                <th style='width: 15%;'>Deadline</th>
                <th style='width: 15%;'>Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionItems.map((a) => `
                <tr>
                  <td><strong>${a.task}</strong></td>
                  <td>${a.assigned_to || 'Assignee'}</td>
                  <td>${a.deadline || 'TBD'}</td>
                  <td>${a.status || 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class='footer'>
          Generated dynamically by Tamilpreneur AI Studio &bull; Official Minutes of Meeting
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 45);
    a.download = `${cleanFileName}_MOM_${date}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const openNewGoogleDoc = () => {
    const text = getFormattedMOMText();
    navigator.clipboard.writeText(text);
    setCopiedForDocs(true);
    setTimeout(() => setCopiedForDocs(false), 3000);
    window.open('https://docs.new', '_blank');
  };

  const copyForTeam = () => {
    const text = getFormattedMOMText();
    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2500);
  };

  // 1-Click WhatsApp Share
  const shareWhatsApp = () => {
    const text = getFormattedMOMText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 1-Click Email Share
  const shareEmail = () => {
    const subject = `[MOM] ${title} - ${date}`;
    const body = getFormattedMOMText();
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/95 backdrop-blur-2xl p-5 sm:p-8 shadow-2xl relative animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff4d5a] font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> OFFICIAL MINUTES OF MEETING
            </span>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base sm:text-xl font-bold text-white bg-black/40 border border-[#ff4d5a] px-3 py-1 rounded-xl outline-none w-full"
              />
            ) : (
              <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md">
                {title}
              </h2>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => (isEditing ? handleSaveEdits() : setIsEditing(true))}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isEditing
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE CHANGES</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#ff4d5a]" />
                <span>EDIT MODE</span>
              </>
            )}
          </button>

          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#ff4d5a]/10 text-[#ff4d5a] border border-[#ff4d5a]/20">
            {department}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AI SYNTHESIZED
          </span>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={downloadOfficialDoc}
          className="group btn-executive-primary inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide cursor-pointer text-center bg-[#ff4d5a] hover:bg-[#e03d4a] text-white shadow-lg shadow-[#ff4d5a]/25 transition-all active:scale-95"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>DOWNLOADED (.DOC)!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>DOWNLOAD OFFICIAL MOM (.DOC)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={openNewGoogleDoc}
          className="group inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 hover:text-white cursor-pointer"
          title="Opens a fresh Google Doc and copies formatted MOM text so you can paste with Ctrl+V"
        >
          {copiedForDocs ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED! PRESS CTRL+V IN DOC</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>CREATE NEW GOOGLE DOC</span>
            </>
          )}
        </button>
      </div>

      {/* Sharing & Export Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 text-xs font-mono">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 hover:text-white transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Share to WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={shareEmail}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-300 hover:text-white transition-all cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span>Send via Email</span>
        </button>

        <button
          type="button"
          onClick={copyForTeam}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          {copiedSlack ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied text!</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy for Slack / Notes</span>
            </>
          )}
        </button>

        <a
          href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
        >
          <FolderCheck className="w-3.5 h-3.5 text-[#ff4d5a]" />
          <span>Drive Folder</span>
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* 1. Executive Summary */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-5">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#ff4d5a]" /> 1. Executive Brief
          </span>
          {isEditing && <span className="text-[10px] text-[#ff4d5a]">Editing enabled</span>}
        </div>
        {isEditing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full text-xs sm:text-sm text-slate-200 bg-black/40 border border-white/[0.1] rounded-xl p-3 outline-none focus:border-[#ff4d5a]"
          />
        ) : (
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{summary}</p>
        )}
      </div>

      {/* 2. Key Discussion Points */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-5">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> 2. Key Discussion Points
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() => setDiscussionPoints([...discussionPoints, 'New discussion point'])}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Point
            </button>
          )}
        </div>
        <div className="space-y-2">
          {discussionPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 font-bold text-xs">&bull;</span>
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const updated = [...discussionPoints];
                      updated[idx] = e.target.value;
                      setDiscussionPoints(updated);
                    }}
                    className="flex-1 text-xs bg-black/40 border border-white/[0.08] p-1.5 rounded-lg text-slate-200 outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setDiscussionPoints(discussionPoints.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs sm:text-sm text-slate-200">{point}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Decisions Agreed */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-5">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3. Decisions Agreed
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() => setDecisions([...decisions, 'New agreed decision'])}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Decision
            </button>
          )}
        </div>
        <div className="space-y-2">
          {decisions.map((dec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={dec}
                    onChange={(e) => {
                      const updated = [...decisions];
                      updated[idx] = e.target.value;
                      setDecisions(updated);
                    }}
                    className="flex-1 text-xs bg-black/40 border border-white/[0.08] p-1.5 rounded-lg text-slate-200 outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setDecisions(decisions.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs sm:text-sm text-slate-200">{dec}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Items & Ownership */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-6">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-[#ff4d5a]" /> 4. Action Items &amp; Ownership ({actionItems.length})
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() =>
                setActionItems([
                  ...actionItems,
                  { task: 'New Action Item', assigned_to: 'Team Member', deadline: 'Next Week', status: 'Pending' },
                ])
              }
              className="text-[10px] text-[#ff4d5a] hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Task
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Action Item</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Owner</th>
                <th className="py-2.5 px-3 font-semibold">Deadline</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                {isEditing && <th className="py-2.5 px-3 font-semibold">Remove</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {actionItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 text-white font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx] = { ...updated[idx], task: e.target.value };
                          setActionItems(updated);
                        }}
                        className="w-full text-xs bg-black/40 border border-white/[0.08] p-1 rounded text-white"
                      />
                    ) : (
                      item.task
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.assigned_to || ''}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx] = { ...updated[idx], assigned_to: e.target.value };
                          setActionItems(updated);
                        }}
                        className="w-full text-xs bg-black/40 border border-white/[0.08] p-1 rounded text-slate-300"
                      />
                    ) : (
                      item.assigned_to || 'Unassigned'
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.deadline || ''}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx] = { ...updated[idx], deadline: e.target.value };
                          setActionItems(updated);
                        }}
                        className="w-full text-xs bg-black/40 border border-white/[0.08] p-1 rounded text-slate-300"
                      />
                    ) : (
                      item.deadline || 'TBD'
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {isEditing ? (
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx] = { ...updated[idx], status: e.target.value };
                          setActionItems(updated);
                        }}
                        className="text-xs bg-black/60 border border-white/[0.1] rounded p-1 text-slate-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'In Progress'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    )}
                  </td>
                  {isEditing && (
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setActionItems(actionItems.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs font-mono">
        <button
          type="button"
          onClick={onDeleteCurrent}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Record</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Synthesize Another Meeting</span>
        </button>
      </div>
    </div>
  );
}
