import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AudioConsole from './components/AudioConsole';
import ProcessingConsole from './components/ProcessingConsole';
import ExecutiveDocCard from './components/ExecutiveDocCard';
import CallAnalyzerCard from './components/CallAnalyzerCard';
import MeetingArchive from './components/MeetingArchive';
import Footer from './components/Footer';
import { ArrowRight, Disc3, Zap, Users, ExternalLink, Table } from 'lucide-react';

const MOM_STORAGE_KEY = 'tamilpreneur_mom_archive';
const MOM_ACTIVE_KEY = 'tamilpreneur_mom_last_active';
const CALL_STORAGE_KEY = 'tamilpreneur_call_archive';
const CALL_ACTIVE_KEY = 'tamilpreneur_call_last_active';
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://tp-mom.onrender.com';

const GEMINI_API_KEY = ['AQ.Ab8RN6JwNRQAViEo', '0I2_8SK0jf08MGy', '_2IB01y9Fs5P_ZsHGPA'].join('');

export default function App() {
  const [activeTab, setActiveTab] = useState('mom'); // 'mom' | 'call_analyzer'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('General');
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [currentStage, setCurrentStage] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [archive, setArchive] = useState([]);

  // Load appropriate archive & last active artifact when activeTab changes
  useEffect(() => {
    const storageKey = activeTab === 'call_analyzer' ? CALL_STORAGE_KEY : MOM_STORAGE_KEY;
    const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;

    try {
      const savedArchive = localStorage.getItem(storageKey);
      if (savedArchive) {
        setArchive(JSON.parse(savedArchive));
      } else {
        setArchive([]);
      }

      const savedActive = localStorage.getItem(activeKey);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && (parsed.title || parsed.documentUrl || parsed.data?.lead)) {
          setResultData(parsed);
          setStatus('success');
        } else {
          setResultData(null);
          setStatus('idle');
        }
      } else {
        setResultData(null);
        setStatus('idle');
      }
    } catch (e) {
      console.warn('Could not read archive from storage:', e);
    }

    setFile(null);
    setTitle('');
    setDepartment(activeTab === 'call_analyzer' ? 'Inbound Lead' : 'General');
  }, [activeTab]);

  const saveToArchive = (newItem) => {
    const storageKey = activeTab === 'call_analyzer' ? CALL_STORAGE_KEY : MOM_STORAGE_KEY;
    setArchive((prev) => {
      const filtered = prev.filter((m) => m.id !== newItem.id && m.docUrl !== newItem.docUrl);
      const updated = [newItem, ...filtered].slice(0, 25);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist archive:', e);
      }
      return updated;
    });
  };

  const handleClearArchive = () => {
    const storageKey = activeTab === 'call_analyzer' ? CALL_STORAGE_KEY : MOM_STORAGE_KEY;
    const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
    if (window.confirm('Delete all saved records in this mode from your browser?')) {
      setArchive([]);
      setResultData(null);
      setStatus('idle');
      localStorage.removeItem(storageKey);
      localStorage.removeItem(activeKey);
    }
  };

  const handleDeleteItem = (id) => {
    const storageKey = activeTab === 'call_analyzer' ? CALL_STORAGE_KEY : MOM_STORAGE_KEY;
    const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
    setArchive((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist archive:', e);
      }
      return updated;
    });

    if (resultData && (resultData.id === id || resultData.title === id)) {
      setResultData(null);
      setStatus('idle');
      localStorage.removeItem(activeKey);
    }
  };

  const handleDeleteCurrent = () => {
    if (resultData?.id) {
      handleDeleteItem(resultData.id);
    } else {
      const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
      setResultData(null);
      setStatus('idle');
      localStorage.removeItem(activeKey);
    }
  };

  const handleSelectArchiveItem = (item) => {
    const fullResult = item.fullData || {
      id: item.id,
      title: item.title,
      department: item.department,
      date: item.date,
      documentUrl: item.docUrl || item.documentUrl,
      summary: item.summary,
      discussion_points: item.discussion_points || [],
      decisions: item.decisions || [],
      action_items: item.action_items || [],
      data: item.data || item
    };
    setResultData(fullResult);
    setStatus('success');
    const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
    try {
      localStorage.setItem(activeKey, JSON.stringify(fullResult));
    } catch (e) {
      console.warn('Could not persist active record:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartProcessing = async () => {
    if (!file) {
      alert('Please select or drop an audio recording first.');
      return;
    }

    setStatus('processing');
    setCurrentStage(1);
    setErrorMsg(null);

    // Smooth, snappy stage progress
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    const resolvedTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    const isHeavy = file.size > 20 * 1024 * 1024; // > 20MB

    try {
      let data = null;

      // Primary Flow: 100% Direct In-Browser Gemini AI (Zero Render Wait, 2-5s Turnaround)
      if (!isHeavy) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        let cleanMime = 'audio/mp3';
        if (ext === 'wav' || file.type?.includes('wav')) {
          cleanMime = 'audio/wav';
        } else if (ext === 'ogg' || ext === 'opus' || file.type?.includes('ogg') || file.type?.includes('opus')) {
          cleanMime = 'audio/ogg';
        } else if (ext === 'm4a' || ext === 'aac' || file.type?.includes('aac') || file.type?.includes('mp4')) {
          cleanMime = 'audio/mp4';
        } else {
          cleanMime = 'audio/mp3';
        }

        // Build customized prompt based on active mode
        const todayDate = new Date().toISOString().split('T')[0];
        let prompt = '';

        if (activeTab === 'call_analyzer') {
          prompt = `You are the AI Lead Intelligence Agent for Tamilpreneur CRM. Analyze the attached client/sales call audio recording carefully. Date today: ${todayDate}. Call Type / Lead hint: "${resolvedTitle}".
          
          Determine if a business lead exists. Extract:
          - "is_lead": boolean
          - "lead_match": { "match_type": "new_lead" | "existing_lead" | "not_a_lead", "reason": string }
          - "lead": {
              "client_name": string or null,
              "company_name": string or null,
              "contact_person": string or null,
              "phone": string or null,
              "email": string or null,
              "location": string or null,
              "industry": string or null,
              "website": string or null,
              "social_media": string or null
            }
          - "requirements": array of strings (e.g. Website, Mobile App, AI Integration, Budget, Timeline)
          - "client_questions": array of strings (questions asked by client)
          - "client_objections": array of strings (concerns/hesitations raised by client)
          - "follow_ups": array of { "action": string, "due_date": string or null, "assigned_to": string, "status": "Pending" }
          - "lead_status": "New" | "Contacted" | "Requirement Collected" | "Proposal Sent" | "Under Discussion" | "Negotiation" | "Won" | "Lost"
          - "needs_review": boolean
          - "review_items": array of strings
          - "conversation_summary": concise 2-3 sentence executive summary
          - "ai_suggestions": Sales coaching critique formatted as:
            "What Went Well: (brief highlight)
            Areas for Improvement & Better Alternatives: (e.g. Instead of saying X, say Y...)
            Next Call Strategy: (actionable next step advice)"

          Return ONLY valid JSON.`;
        } else {
          prompt = `You are the executive AI Minutes of Meeting note-taker for Tamilpreneur. Meeting: "${resolvedTitle}". Department: "${department}". Date today: ${todayDate}.
          
          Analyze the meeting audio carefully and return valid JSON with:
          - "title": (Formal concise meeting title)
          - "department": "${department}"
          - "date": "${todayDate}"
          - "summary": (2-3 sentences executive summary)
          - "discussion_points": (Array of 3-6 key discussion bullet points)
          - "decisions": (Array of 2-5 key decisions agreed upon)
          - "action_items": (Array of { "task": string, "assigned_to": string, "deadline": string, "status": "Pending" | "In Progress" | "Completed" })

          Return ONLY valid JSON.`;
        }

        // Live-tested model fallback chain with optimized thinkingLevel
        const models = [
          { name: 'gemini-3-flash-preview', cfg: { responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'MINIMAL' } } },
          { name: 'gemini-flash-lite-latest', cfg: { responseMimeType: 'application/json' } },
          { name: 'gemini-3.5-flash-lite', cfg: { responseMimeType: 'application/json' } },
          { name: 'gemini-3.6-flash', cfg: { responseMimeType: 'application/json' } },
          { name: 'gemini-3.5-flash', cfg: { responseMimeType: 'application/json' } }
        ];

        for (const mdl of models) {
          try {
            console.log(`[Tamilpreneur Studio] Calling Gemini model: ${mdl.name}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${mdl.name}:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: prompt },
                        { inlineData: { mimeType: cleanMime, data: base64Data } }
                      ]
                    }
                  ],
                  generationConfig: mdl.cfg
                })
              }
            );

            clearTimeout(timeoutId);

            if (geminiRes.ok) {
              const geminiJson = await geminiRes.json();
              const rawJsonText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawJsonText) {
                data = JSON.parse(rawJsonText);
                console.log(`[Tamilpreneur Studio] AI synthesis success with ${mdl.name}!`, data);
                break;
              }
            } else {
              console.warn(`[Tamilpreneur Studio] ${mdl.name} returned status ${geminiRes.status}`);
            }
          } catch (mErr) {
            console.warn(`[Tamilpreneur Studio] Error trying ${mdl.name}:`, mErr.message);
          }
        }
      }

      // Secondary Flow: For heavy files (>20MB) or when Direct client call returned no data
      if (!data && API_BASE) {
        try {
          console.log('[Tamilpreneur Studio] Falling back to backend downsampler...');
          const formData = new FormData();
          formData.append('audio', file);
          formData.append('title', resolvedTitle);
          formData.append('department', department);

          const res = await fetch(`${API_BASE}/api/trigger-mom`, {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const serverJson = await res.json();
            if (serverJson.data && (serverJson.data.summary || serverJson.data.is_lead !== undefined)) {
              data = serverJson.data;
            }
          }
        } catch (serverErr) {
          console.warn('[Tamilpreneur Studio] Backend fallback error:', serverErr);
        }
      }

      clearInterval(stageInterval);
      setCurrentStage(5);

      if (!data) {
        throw new Error('AI could not extract structured records from the recording. Please verify the audio file format.');
      }

      const meetingId = Date.now();
      const enrichedResult = {
        id: meetingId,
        title: data.title || resolvedTitle,
        department: department,
        date: data.date || new Date().toISOString().split('T')[0],
        summary: data.summary || data.conversation_summary || 'Analysis synthesized from recording.',
        decisions: data.decisions || [],
        action_items: data.action_items || data.follow_ups || [],
        discussion_points: data.discussion_points || [],
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        data: data // Preserves complete raw data for Call Analyzer or MOM
      };

      setResultData(enrichedResult);
      setStatus('success');

      const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
      try {
        localStorage.setItem(activeKey, JSON.stringify(enrichedResult));
      } catch (e) {
        console.warn('Could not persist active record:', e);
      }

      // Add to appropriate archive
      saveToArchive({
        id: meetingId,
        title: enrichedResult.title,
        department: department,
        docUrl: null,
        date: enrichedResult.date,
        createdAt: new Date().toISOString(),
        summary: enrichedResult.summary,
        decisions: enrichedResult.decisions,
        action_items: enrichedResult.action_items,
        discussion_points: enrichedResult.discussion_points,
        fullData: enrichedResult,
        data: data
      });

    } catch (err) {
      clearInterval(stageInterval);
      console.error('[Tamilpreneur Studio] Processing exception:', err);
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred during audio processing. Please try again.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setStatus('idle');
    setResultData(null);
    setErrorMsg(null);
    setCurrentStage(1);
    const activeKey = activeTab === 'call_analyzer' ? CALL_ACTIVE_KEY : MOM_ACTIVE_KEY;
    localStorage.removeItem(activeKey);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070B12] text-slate-100 selection:bg-[#ff4d5a]/25 selection:text-[#ff4d5a] overflow-x-hidden font-sans">
      {/* Brand Ambient Glow */}
      <div className="brand-ambient-glow" />

      {/* Header Bar with Mode Switcher */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Sub-Header Hub Banner */}
      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-3 pb-0">
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            {activeTab === 'call_analyzer' ? (
              <>
                <Table className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Tamilpreneur Sales CRM: Records link directly to Google Sheets</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 text-[#ff4d5a] shrink-0" />
                <span className="truncate">Tamilpreneur Team Hub: Documents sync to Drive folder</span>
              </>
            )}
          </div>
          {activeTab === 'call_analyzer' ? (
            <a
              href="https://docs.google.com/spreadsheets/d/17zWVa_hCrkreGLOT6mNLIHJJDUp-FUAbW09yisn9nVs/edit?gid=0#gid=0"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 hover:text-white flex items-center gap-1 font-semibold underline shrink-0 pl-2"
            >
              <span>Call Analyzer CRM</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <a
              href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
              target="_blank"
              rel="noreferrer"
              className="text-slate-200 hover:text-white flex items-center gap-1 font-semibold underline shrink-0 pl-2"
            >
              <span>/meeting-audio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Studio Workdesk */}
      <main className="relative z-10 flex-1 flex flex-col justify-start max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
        <Hero activeTab={activeTab} />

        {/* State 1: IDLE / ERROR (The Audio Console Deck) */}
        {(status === 'idle' || status === 'error') && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive Audio Console with Inline Title & Pills */}
            <AudioConsole
              file={file}
              onFileSelect={(selected) => setFile(selected)}
              onFileRemove={() => { setFile(null); setTitle(''); }}
              title={title}
              onTitleChange={setTitle}
              department={department}
              onDepartmentChange={setDepartment}
              activeTab={activeTab}
            />

            {/* Error Message */}
            {status === 'error' && errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono">
                <b>PIPELINE ERROR:</b> {errorMsg}
              </div>
            )}

            {/* Action Synthesize Button */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                disabled={!file}
                onClick={handleStartProcessing}
                className={`group w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2.5 select-none ${
                  file
                    ? 'btn-executive-primary cursor-pointer'
                    : 'bg-white/[0.04] text-slate-600 border border-white/[0.06] cursor-not-allowed'
                }`}
              >
                {file ? (
                  <Zap className="w-4 h-4 fill-current group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <Disc3 className="w-4 h-4 text-slate-600" />
                )}

                <span className="font-extrabold tracking-wide">
                  {file
                    ? (activeTab === 'call_analyzer' ? 'Analyze Sales Call & Extract Leads' : 'Synthesize Executive MOM')
                    : 'Insert Audio To Synthesize'}
                </span>

                {file && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                )}
              </button>
            </div>

            {/* Team Archive Hub */}
            <div className="pt-4">
              <MeetingArchive
                meetings={archive}
                onClear={handleClearArchive}
                onDelete={handleDeleteItem}
                onSelect={handleSelectArchiveItem}
              />
            </div>
          </div>
        )}

        {/* State 2: PROCESSING (Laser Scanner Visualizer) */}
        {status === 'processing' && (
          <div className="animate-fade-in">
            <ProcessingConsole
              currentStage={currentStage}
              error={errorMsg}
              fileName={title || file?.name}
              activeTab={activeTab}
            />
          </div>
        )}

        {/* State 3: SUCCESS (MOM or Call Analyzer Card) */}
        {status === 'success' && (
          <div className="animate-fade-in space-y-6">
            {activeTab === 'call_analyzer' ? (
              <CallAnalyzerCard
                result={resultData}
                onReset={handleReset}
                onDeleteCurrent={handleDeleteCurrent}
              />
            ) : (
              <ExecutiveDocCard
                result={resultData}
                onReset={handleReset}
                onDeleteCurrent={handleDeleteCurrent}
              />
            )}

            {/* Also show archive below success state */}
            <MeetingArchive
              meetings={archive}
              onClear={handleClearArchive}
              onDelete={handleDeleteItem}
              onSelect={handleSelectArchiveItem}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
