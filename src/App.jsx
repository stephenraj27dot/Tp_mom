import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AudioConsole from './components/AudioConsole';
import ProcessingConsole from './components/ProcessingConsole';
import ExecutiveDocCard from './components/ExecutiveDocCard';
import MeetingArchive from './components/MeetingArchive';
import Footer from './components/Footer';
import { ArrowRight, Disc3, Zap, Users, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'tamilpreneur_mom_archive';

export default function App() {
  const [file, setFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [department, setDepartment] = useState('General');
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [currentStage, setCurrentStage] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [meetingsArchive, setMeetingsArchive] = useState([]);

  // Load team archive from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMeetingsArchive(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read meeting archive from storage:', e);
    }
  }, []);

  const saveToArchive = (newItem) => {
    setMeetingsArchive((prev) => {
      const filtered = prev.filter((m) => m.docUrl !== newItem.docUrl);
      const updated = [newItem, ...filtered].slice(0, 15); // keep last 15
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist archive:', e);
      }
      return updated;
    });
  };

  const handleClearArchive = () => {
    if (window.confirm('Clear your local meeting archive history?')) {
      setMeetingsArchive([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleDeleteMeeting = (id) => {
    setMeetingsArchive((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartProcessing = async () => {
    if (!file) {
      alert('Please insert a meeting audio tape (.mp3, .wav, or WhatsApp audio) first.');
      return;
    }

    setStatus('processing');
    setCurrentStage(1);
    setErrorMsg(null);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 5 ? prev + 1 : prev));
    }, 4500);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', meetingTitle.trim());
      formData.append('department', department);

      let res;
      try {
        res = await fetch('/api/trigger-mom', {
          method: 'POST',
          body: formData,
        });
      } catch (networkErr) {
        console.warn('Backend proxy unreachable, switching to direct base64 webhook transmission...');
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        res = await fetch('https://hook.eu1.make.com/tdvaw77919n84mzfsx6cm7oxbha45bku', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_data: base64Data,
            file_name: file.name,
            title: meetingTitle ? `[${department}] ${meetingTitle}` : '',
            department: department,
          }),
        });
      }

      clearInterval(stageInterval);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Make.com pipeline returned an error.');
      }

      const data = await res.json();
      setCurrentStage(5);

      const resolvedTitle = meetingTitle.trim() || data.title || file.name.replace(/\.[^/.]+$/, '');
      const finalDocUrl = data.documentUrl || 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';

      const enrichedResult = {
        ...data,
        title: resolvedTitle,
        department: department,
        documentUrl: finalDocUrl,
        date: data.date || new Date().toISOString().split('T')[0],
      };

      setResultData(enrichedResult);
      setStatus('success');

      // Add to team archive
      saveToArchive({
        id: Date.now(),
        title: resolvedTitle,
        department: department,
        docUrl: finalDocUrl,
        date: enrichedResult.date,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      clearInterval(stageInterval);
      console.error('Error in MOM processing:', err);
      setErrorMsg(err.message || 'Pipeline execution failed.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setMeetingTitle('');
    setStatus('idle');
    setResultData(null);
    setErrorMsg(null);
    setCurrentStage(1);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070B12] text-slate-100 selection:bg-[#ff4d5a]/25 selection:text-[#ff4d5a] overflow-x-hidden font-sans">
      {/* Refined Executive Ambient Backdrop */}
      <div className="brand-ambient-glow" />

      {/* Header Bar */}
      <Header />

      {/* Team Drive Collaboration Banner */}
      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-3 pb-0">
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Users className="w-3.5 h-3.5 text-[#ff4d5a] shrink-0" />
            <span className="truncate">
              Tamilpreneur Team Hub: Documents sync to Drive folder
            </span>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP"
            target="_blank"
            rel="noreferrer"
            className="text-slate-200 hover:text-white flex items-center gap-1 font-semibold underline shrink-0 pl-2"
          >
            <span>/meeting-audio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Studio Workdesk */}
      <main className="relative z-10 flex-1 flex flex-col justify-start max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
        <Hero />

        {/* State 1: IDLE / ERROR (The Audio Console Deck) */}
        {(status === 'idle' || status === 'error') && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive Audio Console with Inline Title & Department Pills */}
            <AudioConsole
              file={file}
              onFileSelect={(selected) => setFile(selected)}
              onFileRemove={() => { setFile(null); setMeetingTitle(''); }}
              title={meetingTitle}
              onTitleChange={setMeetingTitle}
              department={department}
              onDepartmentChange={setDepartment}
            />

            {/* Error Message */}
            {status === 'error' && errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono">
                <b>PIPELINE ERROR:</b> {errorMsg}
              </div>
            )}

            {/* CLEAN, PROFESSIONAL EXECUTIVE BUTTON WITH HOVER SHEEN & ARROW TRANSLATE */}
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
                  {file ? 'Synthesize Executive MOM' : 'Insert Audio To Synthesize'}
                </span>

                {file && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                )}
              </button>
            </div>

            {/* Team Meeting Archive Hub (History of synthesized docs) */}
            <div className="pt-4">
              <MeetingArchive
                meetings={meetingsArchive}
                onClear={handleClearArchive}
                onDelete={handleDeleteMeeting}
              />
            </div>
          </div>
        )}

        {/* State 2: PROCESSING (Laser Scanner) */}
        {status === 'processing' && (
          <div className="animate-fade-in">
            <ProcessingConsole
              currentStage={currentStage}
              error={errorMsg}
              fileName={meetingTitle || file?.name}
            />
          </div>
        )}

        {/* State 3: SUCCESS (Executive Document Artifact) */}
        {status === 'success' && (
          <div className="animate-fade-in space-y-6">
            <ExecutiveDocCard result={resultData} onReset={handleReset} />

            {/* Also show archive below success state */}
            <MeetingArchive
              meetings={meetingsArchive}
              onClear={handleClearArchive}
              onDelete={handleDeleteMeeting}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
