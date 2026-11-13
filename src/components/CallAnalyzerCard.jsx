import React, { useState } from 'react';
import {
  User, Building2, Phone, Mail, MapPin, Briefcase, Calendar, CheckCircle2,
  AlertTriangle, ArrowRight, ExternalLink, Copy, Check, Download, Sparkles,
  HelpCircle, ShieldAlert, Award, TrendingUp, Compass, FileText, RotateCcw
} from 'lucide-react';

const SHEETS_CRM_URL = 'https://docs.google.com/spreadsheets/d/17zWVa_hCrkreGLOT6mNLIHJJDUp-FUAbW09yisn9nVs/edit?gid=0#gid=0';
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1iZXLGeXpo9FAcbx6Kzp-zteNXnito_l-';

export default function CallAnalyzerCard({ result, onReset, onDeleteCurrent }) {
  const [copiedCrm, setCopiedCrm] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [downloadedDoc, setDownloadedDoc] = useState(false);

  const data = result?.data || result || {};
  const lead = data.lead || {};
  const isLead = data.is_lead !== false;
  const status = data.lead_status || 'New';
  const matchType = data.lead_match?.match_type || 'new_lead';
  const companyName = lead.company_name || lead.client_name || 'Prospect Client';
  const clientName = lead.client_name || lead.contact_person || 'Not Specified';
  const contactPerson = lead.contact_person || lead.client_name || 'Not Specified';
  const phone = lead.phone || 'N/A';
  const email = lead.email || 'N/A';
  const location = lead.location || 'N/A';
  const industry = lead.industry || 'General';
  const requirements = data.requirements || [];
  const questions = data.client_questions || [];
  const objections = data.client_objections || [];
  const followUps = data.follow_ups || [];
  const summary = data.conversation_summary || data.summary || 'Call conversation analyzed and synthesized.';
  const suggestions = data.ai_suggestions || '';
  const dateStr = data.date || new Date().toISOString().split('T')[0];

  const getStatusColor = (st) => {
    switch ((st || '').toLowerCase()) {
      case 'won': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'lost': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'negotiation': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'under discussion': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'requirement collected': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'contacted': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default: return 'bg-[#ff4d5a]/20 text-[#ff4d5a] border-[#ff4d5a]/40';
    }
  };

  // Generate Tab-Separated Row matching the exact 19 Google Sheets CRM columns:
  // Col A: Company/Lead, Col B: Status, Col C: Client Name, Col D: Company, Col E: Contact,
  // Col F: Phone, Col G: Email, Col H: Location, Col I: Industry, Col J: Requirements,
  // Col K: Questions, Col L: Objections, Col M: Follow-ups, Col N: Needs Review,
  // Col O: Review Items, Col P: Summary, Col Q: Lead-related Conv, Col R: Timestamp, Col S: Coaching
  const copyCrmRow = () => {
    const followUpStr = followUps.map(f => `${f.action} (${f.assigned_to || 'Unassigned'} - Due: ${f.due_date || 'TBD'})`).join('; ');
    const reviewItemsStr = (data.review_items || []).join('; ');
    const nowTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const cols = [
      companyName,
      status,
      clientName,
      lead.company_name || '',
      contactPerson,
      phone,
      email,
      location,
      industry,
      requirements.join(', '),
      questions.join('; '),
      objections.join('; '),
      followUpStr,
      data.needs_review ? 'TRUE' : 'FALSE',
      reviewItemsStr,
      summary,
      data.lead_related_conversation || summary,
      nowTimestamp,
      suggestions
    ];

    const tsvRow = cols.map(c => String(c || '').replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedCrm(true);
    setTimeout(() => setCopiedCrm(false), 3000);
  };

  const copyBriefText = () => {
    let brief = `📞 *LEAD INTELLIGENCE REPORT: ${companyName}*\n`;
    brief += `👤 *Client:* ${clientName} | 🏢 *Company:* ${lead.company_name || 'N/A'}\n`;
    brief += `🏷 *Status:* ${status} | 📅 *Date:* ${dateStr}\n`;
    brief += `📞 *Phone:* ${phone} | ✉️ *Email:* ${email} | 📍 *Location:* ${location}\n\n`;
    if (requirements.length > 0) brief += `💡 *Requirements:* ${requirements.join(', ')}\n\n`;
    brief += `📝 *Summary:*\n${summary}\n\n`;
    if (questions.length > 0) brief += `❓ *Client Questions:*\n${questions.map(q => `• ${q}`).join('\n')}\n\n`;
    if (objections.length > 0) brief += `⚠️ *Objections / Concerns:*\n${objections.map(o => `• ${o}`).join('\n')}\n\n`;
    if (followUps.length > 0) {
      brief += `✅ *Follow-up Actions:*\n${followUps.map(f => `• ${f.action} (Assigned: @${f.assigned_to || 'Team'} - Due: ${f.due_date || 'TBD'})`).join('\n')}\n\n`;
    }
    if (suggestions) {
      brief += `🏆 *Sales Coaching & AI Suggestions:*\n${suggestions}\n\n`;
    }
    brief += `📊 *Google Sheets CRM:* ${SHEETS_CRM_URL}`;
    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  const downloadOfficialDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Lead Report - ${companyName}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 40px; }
          .header { border-bottom: 3px solid #ff4d5a; padding-bottom: 12px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #ff4d5a; color: #ffffff; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
          h1 { color: #0f172a; font-size: 24px; margin: 12px 0 6px 0; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          h2 { color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th { background: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
          td { padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; }
          .callout { background: #f1f5f9; border-left: 4px solid #ff4d5a; padding: 12px 16px; margin: 16px 0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class='header'>
          <span class='badge'>Tamilpreneur Sales Intelligence &bull; Call Analysis</span>
          <h1>Lead Intelligence Report: ${companyName}</h1>
          <div class='meta'>
            <strong>Status:</strong> ${status} &nbsp;|&nbsp;
            <strong>Client:</strong> ${clientName} &nbsp;|&nbsp;
            <strong>Date:</strong> ${dateStr}
          </div>
        </div>

        <h2>1. Client Profile</h2>
        <table>
          <tr><th style='width:30%'>Company / Business</th><td>${lead.company_name || 'N/A'}</td></tr>
          <tr><th>Contact Person</th><td>${contactPerson}</td></tr>
          <tr><th>Phone</th><td>${phone}</td></tr>
          <tr><th>Email</th><td>${email}</td></tr>
          <tr><th>Location</th><td>${location}</td></tr>
          <tr><th>Industry</th><td>${industry}</td></tr>
        </table>

        <h2>2. Executive Call Summary</h2>
        <p>${summary}</p>

        ${requirements.length > 0 ? `
          <h2>3. Client Requirements</h2>
          <ul>${requirements.map(r => `<li><strong>&bull;</strong> ${r}</li>`).join('')}</ul>
        ` : ''}

        ${(questions.length > 0 || objections.length > 0) ? `
          <h2>4. Client Questions & Objections</h2>
          ${questions.length > 0 ? `<h3>Questions Asked:</h3><ul>${questions.map(q => `<li>${q}</li>`).join('')}</ul>` : ''}
          ${objections.length > 0 ? `<h3>Objections / Hesitations:</h3><ul>${objections.map(o => `<li>${o}</li>`).join('')}</ul>` : ''}
        ` : ''}

        ${followUps.length > 0 ? `
          <h2>5. Action Items & Follow-Ups</h2>
          <table>
            <thead>
              <tr><th>Action</th><th>Assigned To</th><th>Deadline</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${followUps.map(f => `<tr><td>${f.action}</td><td>${f.assigned_to || 'Unassigned'}</td><td>${f.due_date || 'TBD'}</td><td>${f.status || 'Pending'}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}

        ${suggestions ? `
          <h2>6. Sales Conversation Coaching & AI Suggestions</h2>
          <div class='callout'><pre style='white-space: pre-wrap; font-family: inherit;'>${suggestions}</pre></div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = companyName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    a.download = `Lead_Report_${cleanFileName}_${dateStr}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedDoc(true);
    setTimeout(() => setDownloadedDoc(false), 3000);
  };

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/95 backdrop-blur-2xl p-5 sm:p-8 shadow-2xl relative animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff4d5a] font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> LEAD INTELLIGENCE SYNTHESIZED
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md">
              {companyName}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] text-slate-300 border border-white/[0.08]">
            {isLead ? 'BUSINESS LEAD' : 'NON-LEAD'}
          </span>
        </div>
      </div>

      {/* Main CRM Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Open Sheets CRM */}
        <a
          href={SHEETS_CRM_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all shadow-sm active:scale-95"
          title="Open Google Spreadsheet CRM"
        >
          <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span>OPEN SHEETS CRM</span>
        </a>

        {/* 1-Click Copy CRM Row */}
        <button
          type="button"
          onClick={copyCrmRow}
          className="group inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Copies tab-separated row to paste directly into Google Sheets CRM"
        >
          {copiedCrm ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED! PRESS CTRL+V IN SHEET</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>COPY ROW FOR CRM</span>
            </>
          )}
        </button>

        {/* Download Word Document */}
        <button
          type="button"
          onClick={downloadOfficialDoc}
          className="group inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide bg-[#ff4d5a] hover:bg-[#e03d4a] text-white shadow-lg shadow-[#ff4d5a]/25 transition-all active:scale-95 cursor-pointer"
        >
          {downloadedDoc ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>DOWNLOADED (.DOC)!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>DOWNLOAD REPORT (.DOC)</span>
            </>
          )}
        </button>
      </div>

      {/* Client Profile Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6 font-mono text-xs">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Client</span>
          <span className="text-slate-200 font-semibold truncate block" title={clientName}>{clientName}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Phone</span>
          <span className="text-slate-200 font-semibold truncate block" title={phone}>{phone}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Email</span>
          <span className="text-slate-200 font-semibold truncate block" title={email}>{email}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Location</span>
          <span className="text-slate-200 font-semibold truncate block" title={location}>{location}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Industry</span>
          <span className="text-slate-200 font-semibold truncate block" title={industry}>{industry}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 block uppercase">Date</span>
          <span className="text-slate-200 font-semibold truncate block">{dateStr}</span>
        </div>
      </div>

      {/* Executive Call Summary */}
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#ff4d5a]" />
          Executive Conversation Summary
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Requirements Tags */}
      {requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Client Requirements Extracted
          </h3>
          <div className="flex flex-wrap gap-2">
            {requirements.map((req, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/25 text-amber-300"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Client Questions & Objections Grid */}
      {(questions.length > 0 || objections.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {questions.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Client Questions ({questions.length})
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {questions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">&bull;</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {objections.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Client Objections & Concerns ({objections.length})
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {objections.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&bull;</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Action Items */}
      {followUps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Follow-Up Actions ({followUps.length})
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Action Item</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Person</th>
                  <th className="py-2.5 px-3 font-semibold">Due Date</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {followUps.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-white font-medium">{item.action}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.assigned_to || 'Unassigned'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.due_date || 'TBD'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🏆 High-Value Feature: Sales Conversation Coaching & AI Suggestions */}
      {suggestions && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#ff4d5a]/10 via-purple-500/5 to-blue-500/10 border border-[#ff4d5a]/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ff4d5a]" />
              Sales Conversation Coaching & AI Suggestions
            </h3>
            <span className="text-[10px] font-mono text-[#ff4d5a] px-2 py-0.5 rounded bg-[#ff4d5a]/10 border border-[#ff4d5a]/30">
              AI SALES COACH
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-black/30 p-4 rounded-xl border border-white/[0.06]">
            {suggestions}
          </div>
        </div>
      )}

      {/* Footer Secondary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyBriefText}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {copiedBrief ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED BRIEF!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>COPY BRIEF FOR SLACK/WHATSAPP</span>
              </>
            )}
          </button>

          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>Drive Folder</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Analyze Next Call</span>
        </button>
      </div>
    </div>
  );
}
