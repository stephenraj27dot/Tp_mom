import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Disc3, Radio, Volume2, VolumeX, Loader2, Edit3, Tag } from 'lucide-react';
import { transcodeAudioInBrowser } from '../utils/browserAudioTranscoder';

const MOM_DEPARTMENTS = [
  { id: 'General', label: 'General', icon: '🏢' },
  { id: 'Tech & Product', label: 'Tech & Product', icon: '🚀' },
  { id: 'Marketing & Growth', label: 'Marketing & Growth', icon: '📢' },
  { id: 'Community & Events', label: 'Community & Events', icon: '🤝' },
  { id: 'Leadership', label: 'Leadership', icon: '💼' }
];

const CALL_TYPES = [
  { id: 'Inbound Lead', label: 'Inbound Lead', icon: '🔥' },
  { id: 'Outbound Pitch', label: 'Outbound Pitch', icon: '📞' },
  { id: 'Discovery Call', label: 'Discovery Call', icon: '💬' },
  { id: 'Negotiation', label: 'Negotiation', icon: '🤝' },
  { id: 'Client Support', label: 'Client Support', icon: '🛠️' }
];

export default function AudioConsole({
  file,
  onFileSelect,
  onFileRemove,
  title,
  onTitleChange,
  department = 'General',
  onDepartmentChange,
  activeTab = 'mom'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wavePeaks, setWavePeaks] = useState([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);

  const pills = activeTab === 'call_analyzer' ? CALL_TYPES : MOM_DEPARTMENTS;

  // ── Waveform decoder ────────────────────────────────────────────────────────
  const decodeWaveform = async (blobData) => {
    try {
      setIsDecoding(true);
      if (blobData.size > 25 * 1024 * 1024) {
        generateSynthPeaks();
        return;
      }
      const ab = await blobData.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        generateSynthPeaks();
        return;
      }
      const ctx = new AudioCtx();
      let audioBuf = null;
      try {
        audioBuf = await new Promise((resolve, reject) => {
          ctx.decodeAudioData(ab.slice(0), resolve, reject);
        });
      } catch {
        generateSynthPeaks();
        return;
      } finally {
        if (ctx.state !== 'closed') ctx.close().catch(() => {});
      }

      if (!audioBuf) {
        generateSynthPeaks();
        return;
      }

      const raw = audioBuf.getChannelData(0);
      const count = 64;
      const block = Math.floor(raw.length / count);
      const peaks = [];
      for (let i = 0; i < count; i++) {
        let s = 0;
        for (let j = 0; j < block; j++) s += Math.abs(raw[i * block + j]);
        peaks.push(s / block);
      }
      const max = Math.max(...peaks) || 1;
      setWavePeaks(peaks.map(p => Math.max(0.14, p / max)));
      if (audioBuf.duration) setDuration(audioBuf.duration);
    } catch {
      generateSynthPeaks();
    } finally {
      setIsDecoding(false);
    }
  };

  const generateSynthPeaks = () => {
    const peaks = Array.from({ length: 64 }, (_, i) =>
      Math.max(0.15, Math.min(0.96, Math.sin(i * 0.28) * 0.4 + Math.cos(i * 0.45) * 0.3 + 0.42))
    );
    setWavePeaks(peaks);
    setDuration(d => d || 60);
    setIsDecoding(false);
  };

  // ── Universal In-Browser Transcoder & Player Engine (100% Client-Side, 0 Latency) ──
  useEffect(() => {
    if (!file) {
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setWavePeaks([]);
      setIsOptimizing(false);
      return;
    }

    let isCancelled = false;
    let activeUrl = URL.createObjectURL(file);
    setAudioUrl(activeUrl);
    setIsPlaying(false);
    setCurrentTime(0);

    // Auto set a clean default title if blank
    if (!title && onTitleChange) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/WhatsApp Audio \d{4}-\d{2}-\d{2} at/, activeTab === 'call_analyzer' ? 'Client Call' : 'Team Sync')
        .trim();
      onTitleChange(cleanName || (activeTab === 'call_analyzer' ? 'Client Sales Call' : 'Tamilpreneur Meeting'));
    }

    const processAudio = async () => {
      try {
        setIsOptimizing(true);

        // Instant In-Browser Decoding (WASM libopus + Web Audio - 100% local, zero Render wait!)
        const res = await transcodeAudioInBrowser(file);
        if (isCancelled) return;

        if (res.success && res.wavBlob) {
          URL.revokeObjectURL(activeUrl);
          activeUrl = URL.createObjectURL(res.wavBlob);
          setAudioUrl(activeUrl);
          setWavePeaks(res.peaks || []);
          if (res.duration) setDuration(res.duration);
          return;
        }

        const fallback = res.fixedBlob || file;
        URL.revokeObjectURL(activeUrl);
        activeUrl = URL.createObjectURL(fallback);
        setAudioUrl(activeUrl);
        if (res.isHeavy) {
          generateSynthPeaks();
        } else {
          decodeWaveform(fallback);
        }
      } catch (err) {
        console.warn('[AudioConsole] Local transcode fallback:', err);
        if (isCancelled) return;
        decodeWaveform(file);
      } finally {
        if (!isCancelled) setIsOptimizing(false);
      }
    };

    processAudio();

    return () => {
      isCancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [file]);

  // Prime audio element whenever audioUrl changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handleLoadedMetadata = () => {
    const a = audioRef.current;
    if (a && a.duration && !isNaN(a.duration) && a.duration !== Infinity) {
      setDuration(a.duration);
    }
  };

  const handleTimeUpdate = () => {
    const a = audioRef.current;
    if (a) {
      setCurrentTime(a.currentTime);
      if (!duration && a.duration && !isNaN(a.duration)) {
        setDuration(a.duration);
      }
    }
  };

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;

    if (!a.paused) {
      a.pause();
    } else {
      try {
        a.volume = isMuted ? 0 : volume;
        a.muted = isMuted;
        const p = a.play();
        if (p !== undefined) await p;
      } catch (err) {
        console.error('[AudioConsole] play() blocked:', err);
      }
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    const next = !isMuted;
    setIsMuted(next);
    if (a) {
      a.muted = next;
      if (!next) a.volume = volume;
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    const a = audioRef.current;
    if (a) {
      a.volume = v;
      a.muted = v === 0;
    }
  };

  const scrub = (clientX) => {
    const a = audioRef.current;
    if (!a || !duration || !waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const rewind = () => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const eject = () => {
    const a = audioRef.current;
    if (a) a.pause();
    setIsPlaying(false);
    onFileRemove();
  };

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const fmtSize = (b) => (!b ? '0 MB' : (b / 1048576).toFixed(2) + ' MB');
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.webm,.mp4,.mov,.mkv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />

      {!file ? (
        /* ═══════════════ EMPTY STATE: Precision Drop Deck ═══════════════ */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden card-hover-interactive ${
            isDragging
              ? 'border-[#ff4d5a] bg-[#ff4d5a]/10 scale-[1.01]'
              : 'border-white/[0.08] hover:border-white/[0.2] bg-[#0A0F1D]/85 hover:bg-[#0E1528]/95 shadow-xl'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

          <div className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] group-hover:border-[#ff4d5a]/50 group-hover:bg-[#ff4d5a]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 shadow-inner">
              <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff4d5a] group-hover:rotate-180 transition-transform duration-700 ease-out" />
            </div>

            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#ff4d5a] uppercase font-bold mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>{activeTab === 'call_analyzer' ? 'SALES CALL RECORDING DECK' : 'EXECUTIVE RECORDING DECK'}</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-2">
              {activeTab === 'call_analyzer' ? 'Drop sales or client call recording' : 'Drop meeting recording audio'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Upload <span className="text-slate-200 font-mono">.MP3</span>,{' '}
              <span className="text-slate-200 font-mono">.WAV</span>, or{' '}
              <span className="text-slate-200 font-mono">WhatsApp Audio</span>.{' '}
              {activeTab === 'call_analyzer'
                ? 'Automatically extracts lead info, client requirements, objections & gives sales coaching.'
                : 'Automatically extracts action items, decisions, and creates formatted documents.'}
            </p>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-white/[0.06] group-hover:bg-[#ff4d5a] border border-white/[0.12] group-hover:border-[#ff4d5a] text-slate-100 group-hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-sm group-hover:shadow-md group-hover:shadow-[#ff4d5a]/25"
            >
              Select Audio Recording
            </button>
          </div>
        </div>
      ) : (
        /* ═══════════════ LOADED STATE: Studio Deck ═══════════════ */
        <div className="rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/90 backdrop-blur-xl p-5 sm:p-7 shadow-2xl relative space-y-5">
          {/* Top Row: File Badge & Dismiss */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#ff4d5a]/15 border border-[#ff4d5a]/30 flex items-center justify-center text-[#ff4d5a] shrink-0">
                <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
                  <span>{fmtSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.type || 'audio/recording'}</span>
                  {isOptimizing && (
                    <>
                      <span>•</span>
                      <span className="text-[#ff4d5a] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Preparing Waveform...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={rewind}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={eject}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove recording"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline Meeting/Lead Title & Context Pills */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Edit3 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={
                  activeTab === 'call_analyzer'
                    ? 'Enter Lead / Client / Company Name (or leave blank to auto-detect)'
                    : 'Enter Formal Meeting Title (or leave blank to auto-detect)'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-[#ff4d5a] focus:ring-1 focus:ring-[#ff4d5a] text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Department / Call Type Selector */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
                <Tag className="w-3 h-3" />
                {activeTab === 'call_analyzer' ? 'Type:' : 'Team:'}
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                {pills.map((dept) => {
                  const isSelected = department === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => onDepartmentChange(dept.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff4d5a]/20 border border-[#ff4d5a]/50 text-white shadow-sm'
                          : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="mr-1">{dept.icon}</span>
                      <span>{dept.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Waveform Visualizer */}
          <div className="space-y-2">
            <div
              ref={waveformRef}
              onClick={(e) => scrub(e.clientX)}
              className="relative h-16 sm:h-20 bg-black/40 rounded-2xl border border-white/[0.06] p-2 flex items-center justify-between gap-1 cursor-pointer overflow-hidden group select-none"
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#ff4d5a]/10 border-r-2 border-[#ff4d5a] transition-all duration-100 pointer-events-none"
                style={{ width: `${pct}%` }}
              />

              {wavePeaks.length > 0 ? (
                wavePeaks.map((peak, idx) => {
                  const isPlayed = (idx / wavePeaks.length) * 100 <= pct;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex items-center justify-center h-full pointer-events-none"
                    >
                      <div
                        className={`w-full max-w-[4px] rounded-full transition-all duration-150 ${
                          isPlayed
                            ? 'bg-[#ff4d5a]'
                            : 'bg-white/[0.12] group-hover:bg-white/[0.25]'
                        }`}
                        style={{ height: `${Math.max(14, peak * 100)}%` }}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center text-xs font-mono text-slate-500">
                  {isDecoding ? 'Decoding audio waveform...' : 'Audio Tape Loaded'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>{fmtTime(currentTime)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Clean Controls & Volume */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlay}
                className="group inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-[#ff4d5a] border border-white/[0.1] hover:border-[#ff4d5a] text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md hover:shadow-[#ff4d5a]/25 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 group-hover:scale-110 transition-transform" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-1.5 pl-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#ff4d5a]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono text-slate-400 hover:text-white underline transition-colors cursor-pointer"
            >
              Change file
            </button>
          </div>

          {/* Browser Audio Player Element */}
          {audioUrl && (
            <div className="pt-1">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full h-8 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
