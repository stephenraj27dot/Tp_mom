import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText, RotateCcw, FolderCheck, Sparkles, MessageSquare, CheckCircle2, ListChecks, Calendar, User, AlignLeft, Trash2, Download, Printer, PlusCircle } from 'lucide-react';

export default function ExecutiveDocCard({ result, onReset, onDeleteCurrent }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedForDocs, setCopiedForDocs] = useState(false);

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

  // Filter out any trashed or placeholder IDs
  const isTrashedPlaceholder = (url) => {
    return !url || url.includes('1v0L9I6qEHtReAEkk5BVDXOjZUQUozCcNw1_RBhunXDU') || url.includes('/d//edit');
  };

  const hasLiveGoogleDoc = rawDoc && !isTrashedPlaceholder(rawDoc) && (rawDoc.startsWith('https://docs.google.com') || rawDoc.startsWith('https://drive.google.com'));

  const docUrl = hasLiveGoogleDoc
    ? rawDoc
    : (validId && typeof validId === 'string' && validId.trim().length > 15 && !validId.includes('1v0L9'))
    ? `https://docs.google.com/document/d/${validId}/edit`
    : null;

  const docTitle =
    result?.title ||
    result?.data?.title ||
    'Minutes of Meeting';

  const docDept =
    result?.department ||
    result?.data?.department ||
    'General';

  const docDate = result?.date || result?.data?.date || new Date().toISOString().split('T')[0];
  const summary = result?.summary || result?.data?.summary;
  const decisions = result?.decisions || result?.data?.decisions || [];
  const actionItems = result?.action_items || result?.data?.action_items || [];
  const discussionPoints = result?.discussion_points || result?.data?.discussion_points || [];

  // Instant Native .DOC Generator (Works for ANY audio, 100% offline & zero quota dependency)
  const downloadOfficialDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${docTitle}</title>
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
          <h1>${docTitle}</h1>
          <div class='meta'>
            <strong>Department:</strong> ${docDept} &nbsp;|&nbsp;
            <strong>Date:</strong> ${docDate} &nbsp;|&nbsp;
            <strong>Status:</strong> Approved
          </div>
        </div>

        ${summary ? `<h2>1. Executive Summary</h2><p>${summary}</p>` : ''}

        ${discussionPoints.length > 0 ? `
          <h2>2. Key Discussion Points</h2>
          <ul>${discussionPoints.map(p => `<li>${p}</li>`).join('')}</ul>
        ` : ''}

        ${decisions.length > 0 ? `
          <h2>3. Decisions Agreed</h2>
          <ul>${decisions.map(d => `<li><strong>&bull;</strong> ${d}</li>`).join('')}</ul>
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
              ${actionItems.map(a => `
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
          Generated dynamically by Tamilpreneur AI MOM Studio &bull; Synthesized from meeting recording audio
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    a.download = `${cleanFileName}_MOM_${docDate}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const getFormattedMOMText = () => {
    let text = `📌 *MOM: ${docTitle}*\n🏷 *Team:* ${docDept}\n📅 *Date:* ${docDate}\n`;
    if (summary) text += `\n📝 *Summary:*\n${summary}\n`;
    if (discussionPoints.length > 0) text += `\n💬 *Discussion Points:*\n${discussionPoints.map(p => `• ${p}`).join('\n')}\n`;
    if (decisions.length > 0) text += `\n🎯 *Decisions Agreed:*\n${decisions.map(d => `• ${d}`).join('\n')}\n`;
    if (actionItems.length > 0) {
      text += `\n✅ *Action Items:*\n${actionItems.map(a => `• ${a.task} — @${a.assigned_to || 'Assignee'} (Due: ${a.deadline || 'TBD'}) [${a.status || 'Pending'}]`).join('\n')}\n`;
    }
    if (docUrl) text += `\n📄 *Drive Document:*\n${docUrl}`;
    return text;
  };

  // Open brand-new Google Doc & copy formatted text
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

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff4d5a] font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> OFFICIAL ARTIFACT SYNTHESIZED
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md">
              {docTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#ff4d5a]/10 text-[#ff4d5a] border border-[#ff4d5a]/20">
            {docDept}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AI SYNTHESIZED
          </span>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Dynamic Download Document Button */}
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

        {/* Create in Google Docs button (docs.new + auto copy) */}
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

      {/* Secondary Actions: Open in Google Docs (if live link returned) or Open Drive Folder or Print */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-xs font-mono">
        {hasLiveGoogleDoc && (
          <a
            href={docUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Auto-Generated Drive File</span>
          </a>
        )}

        <button
          type="button"
          onClick={copyForTeam}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          {copiedSlack ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied for Slack/WhatsApp</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy for Slack / WhatsApp</span>
            </>
          )}
        </button>

        <a
          href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all"
        >
          <FolderCheck className="w-3.5 h-3.5" />
          <span>Open Team Drive Folder</span>
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Executive Summary Card */}
      {summary && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-left mb-5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#ff4d5a]" /> Executive Brief
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Decisions & Action Items Grid */}
      {(decisions.length > 0 || actionItems.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
          {decisions.length > 0 && (
            <div className="rounded-2xl bg-black/40 border border-emerald-500/20 p-4 space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Decisions Agreed ({decisions.length})
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                {decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 font-bold">&bull;</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actionItems.length > 0 && (
            <div className="rounded-2xl bg-black/40 border border-[#ff4d5a]/20 p-4 space-y-2">
              <div className="text-[11px] font-mono text-[#ff4d5a] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" /> Action Owners ({actionItems.length})
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pl-1">
                {actionItems.map((item, i) => (
                  <li key={i} className="border-b border-white/[0.04] pb-1.5 last:border-none">
                    <div className="font-medium text-white">{item.task}</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span className="text-[#ff4d5a] flex items-center gap-1">
                        <User className="w-2.5 h-2.5" /> {item.assigned_to || 'Assignee'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {item.deadline || 'TBD'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Target Metadata & Links */}
      <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 text-left font-mono text-xs space-y-2.5 mb-6">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>DESTINATION FOLDER:</span>
          <a
            href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-semibold truncate underline"
          >
            <FolderCheck className="w-3.5 h-3.5" /> /meeting-audio (Open Drive)
          </a>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>ARTIFACT FORMAT:</span>
          <span className="text-slate-200">Word .DOC / Google Doc Ready</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
          <span>GENERATED ON:</span>
          <span className="text-slate-200">{new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ingest another meeting tape</span>
        </button>

        {onDeleteCurrent && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this saved MOM record?')) {
                onDeleteCurrent();
              }
            }}
            className="inline-flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer py-1.5 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete this MOM</span>
          </button>
        )}
      </div>
    </div>
  );
}
