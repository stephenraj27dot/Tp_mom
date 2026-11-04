import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Disc3, Radio, Volume2, VolumeX, Loader2, Edit3, Tag } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'General', label: 'General', icon: '🏢' },
  { id: 'Tech & Product', label: 'Tech & Product', icon: '🚀' },
  { id: 'Marketing & Growth', label: 'Marketing & Growth', icon: '📢' },
  { id: 'Community & Events', label: 'Community & Events', icon: '🤝' },
  { id: 'Leadership', label: 'Leadership', icon: '💼' }
];

export default function AudioConsole({
  file,
  onFileSelect,
  onFileRemove,
  title,
  onTitleChange,
  department = 'General',
  onDepartmentChange
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

  // ── Waveform decoder ────────────────────────────────────────────────────────
  const decodeWaveform = async (blobData) => {
    try {
      setIsDecoding(true);
      // Memory Guard: For heavy/GB-range files (> 25MB), use synth peaks to prevent browser RAM freeze
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
      const audioBuf = await ctx.decodeAudioData(ab.slice(0));
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

  // ── Auto-transcode WhatsApp/AAC/Opus for 100% sound ───────────────────────────
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
        .replace(/WhatsApp Audio \d{4}-\d{2}-\d{2} at/, 'Team Sync')
        .trim();
      onTitleChange(cleanName || 'Tamilpreneur Meeting');
    }

    const nameLower = file.name.toLowerCase();
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isWhatsAppOrNonStandard =
      nameLower.includes('whatsapp') ||
      ['aac', 'opus', 'ogg', 'm4a', 'amr', 'webm'].includes(ext);

    const transcodeToMp3 = async () => {
      try {
        setIsOptimizing(true);
        const formData = new FormData();
        formData.append('audio', file);

        const res = await fetch('/api/transcode', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Transcode server failed');
        const mp3Blob = await res.blob();
        if (isCancelled) return;

        URL.revokeObjectURL(activeUrl);
        activeUrl = URL.createObjectURL(mp3Blob);
        setAudioUrl(activeUrl);
        decodeWaveform(mp3Blob);
      } catch (err) {
        console.warn('[AudioConsole] Transcode fallback:', err);
      } finally {
        if (!isCancelled) setIsOptimizing(false);
      }
    };

    if (isWhatsAppOrNonStandard) {
      transcodeToMp3();
    } else {
      decodeWaveform(file);
    }

    return () => {
      isCancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [file]);

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
              <span>EXECUTIVE RECORDING DECK</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-2">
              Drop meeting recording audio
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Upload <span className="text-slate-200 font-mono">.MP3</span>,{' '}
              <span className="text-slate-200 font-mono">.WAV</span>, or{' '}
              <span className="text-slate-200 font-mono">WhatsApp Audio</span>. Automatically extracts action items and syncs with Google Docs.
            </p>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-white/[0.06] group-hover:bg-[#ff4d5a] border border-white/[0.12] group-hover:border-[#ff4d5a] text-slate-100 group-hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-sm group-hover:shadow-md group-hover:shadow-[#ff4d5a]/25"
            >
              Select Audio File
            </button>
          </div>

          <div className="border-t border-white/[0.06] px-5 py-2.5 bg-black/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
            <span>FORMATS: MP3, WAV, WHATSAPP, M4A</span>
            <span className="text-emerald-400 font-medium">TAMILPRENEUR STUDIO ENGINE</span>
            <span>AUTO GOOGLE DOCS</span>
          </div>
        </div>
      ) : (
        /* ═══════════════ LOADED STATE: Professional Audio Deck ═══════════════ */
        <div className="relative rounded-3xl border border-white/[0.1] bg-[#0A0F1D]/90 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl space-y-4 card-hover-interactive animate-fade-in-up">

          {/* Tape Header & Inline Custom Meeting Title */}
          <div className="pb-3 border-b border-white/[0.06] space-y-3">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#ff4d5a]/10 border border-[#ff4d5a]/25 text-[#ff4d5a] flex items-center justify-center shrink-0 ${
                    isPlaying ? 'animate-spin-tape' : ''
                  }`}
                >
                  <Disc3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span className="truncate max-w-[160px] sm:max-w-xs">{file.name}</span>
                    <span>({fmtSize(file.size)})</span>
                    <span>•</span>
                    {file.size > 25 * 1024 * 1024 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        ⚡ Direct Scale Stream Active
                      </span>
                    ) : isOptimizing ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Optimizing...
                      </span>
                    ) : (
                      <span className="text-emerald-400">Ready</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={rewind}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all hover:-translate-y-0.5 active:scale-95"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={eject}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] transition-all hover:-translate-y-0.5 active:scale-95"
                  title="Eject audio"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editable Meeting Title Field */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus-within:border-[#ff4d5a]/60 focus-within:ring-1 focus-within:ring-[#ff4d5a]/30 transition-all">
                <Edit3 className="w-4 h-4 text-[#ff4d5a] shrink-0" />
                <input
                  type="text"
                  value={title || ''}
                  onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                  placeholder="Enter meeting title (e.g. Weekly Product Sync)"
                  className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:inline">
                  Click to rename
                </span>
              </div>
            </div>

            {/* Department Selection Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Select Team / Category:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = department === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => onDepartmentChange && onDepartmentChange(dept.id)}
                      className={`pill-hover-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                        isSelected
                          ? 'active bg-[#ff4d5a] text-white shadow-sm'
                          : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
                      }`}
                    >
                      <span>{dept.icon}</span>
                      <span>{dept.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Waveform Display */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#ff4d5a]' : 'bg-slate-600'}`} />
                <span className="text-white font-semibold text-xs sm:text-sm">{fmtTime(currentTime)}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 text-xs sm:text-sm">{fmtTime(duration)}</span>
              </div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider hidden sm:inline">
                Click waveform to scrub
              </span>
            </div>

            <div
              ref={waveformRef}
              onMouseDown={(e) => scrub(e.clientX)}
              onTouchStart={(e) => e.touches?.[0] && scrub(e.touches[0].clientX)}
              onTouchMove={(e) => e.touches?.[0] && scrub(e.touches[0].clientX)}
              className="relative h-20 sm:h-22 bg-[#050811] rounded-2xl border border-white/[0.07] p-2 flex items-center gap-[2px] sm:gap-[3px] cursor-pointer group overflow-hidden select-none"
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#ff4d5a]/[0.10] pointer-events-none transition-all duration-75"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#ff4d5a] pointer-events-none z-20 transition-all duration-75"
                style={{ left: `${pct}%` }}
              />
              {wavePeaks.map((peak, i) => (
                <div key={i} className="flex-1 flex items-center justify-center h-full min-w-0">
                  <div
                    className={`w-full rounded-full transition-all duration-150 ${
                      (i / wavePeaks.length) * 100 <= pct
                        ? 'bg-[#ff4d5a]'
                        : 'bg-slate-700/60 group-hover:bg-slate-600/90'
                    }`}
                    style={{ height: `${Math.round(peak * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Clean Controls & Volume */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlay}
                className="group inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-[#ff4d5a] border border-white/[0.1] hover:border-[#ff4d5a] text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md hover:shadow-[#ff4d5a]/25"
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
              className="text-xs font-mono text-slate-400 hover:text-white underline transition-colors"
            >
              Change file
            </button>
          </div>

          {/* Browser Audio Player Bar */}
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
