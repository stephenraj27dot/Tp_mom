import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, RotateCcw, Radio, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LiveVoiceRecorder({ onRecordingComplete, activeTab = 'mom' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported in this browser. Please upload an audio file instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Audio visualizer setup
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      }

      // Check supported MIME types for recording
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const prefix = activeTab === 'call_analyzer' ? 'Live_Call_Recording' : 'Live_Meeting_Recording';
        const recordedFile = new File([audioBlob], `${prefix}_${timestamp}.${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });

        cleanupAudio();
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);

        if (onRecordingComplete) {
          onRecordingComplete(recordedFile);
        }
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[LiveVoiceRecorder] Permission / init error:', err);
      setErrorMessage(err.message || 'Microphone access denied. Please allow microphone permissions in your browser.');
      cleanupAudio();
      setIsRecording(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    cleanupAudio();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="relative group rounded-3xl border border-white/[0.08] hover:border-white/[0.2] bg-[#0A0F1D]/85 p-6 sm:p-8 shadow-xl transition-all">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Pulsing Mic Badge */}
        <div className="relative mb-4">
          {isRecording && !isPaused && (
            <span className="absolute -inset-2 rounded-full bg-[#ff4d5a]/30 animate-ping" />
          )}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-[#ff4d5a] text-white shadow-lg shadow-[#ff4d5a]/40 scale-105'
                : 'bg-white/[0.04] border border-white/[0.08] text-[#ff4d5a]'
            }`}
          >
            <Mic className={`w-8 h-8 sm:w-10 sm:h-10 ${isRecording && !isPaused ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Status / Title */}
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#ff4d5a] uppercase font-bold mb-2">
          <Radio className={`w-3.5 h-3.5 ${isRecording && !isPaused ? 'animate-spin-slow' : ''}`} />
          <span>
            {isRecording
              ? isPaused
                ? 'RECORDING PAUSED'
                : 'RECORDING LIVE AUDIO...'
              : activeTab === 'call_analyzer'
              ? 'LIVE CALL RECORDING DECK'
              : 'LIVE MEETING RECORDER'}
          </span>
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-2">
          {isRecording
            ? `Live Recording: ${formatTimer(recordingTime)}`
            : activeTab === 'call_analyzer'
            ? 'Record Sales Call Live In Browser'
            : 'Record Meeting Directly In Browser'}
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          {isRecording
            ? 'Speak clearly into your microphone. Once finished, hit Complete to transcribe & analyze instantly.'
            : activeTab === 'call_analyzer'
            ? 'Start a live sales call recording. AI will detect leads, extract requirements, and formulate coaching tips.'
            : 'Start live meeting recording. AI will distill action items, decisions, and generate formal minutes.'}
        </p>

        {/* Real-time Dynamic Audio Visualizer Waves */}
        {isRecording && (
          <div className="w-full max-w-xs mb-6 space-y-2">
            <div className="flex items-center justify-between gap-1 h-10 px-4 bg-black/40 rounded-xl border border-white/[0.06]">
              {[...Array(24)].map((_, i) => {
                const heightPct = isPaused
                  ? 15
                  : Math.max(15, Math.min(100, Math.sin((i + volumeLevel) * 0.4) * 50 + volumeLevel * 0.8));
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full bg-[#ff4d5a] transition-all duration-75"
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-500 text-center">
              MIC INPUT SENSITIVITY: {volumeLevel}%
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="btn-executive-primary inline-flex items-center space-x-2.5 px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-lg shadow-[#ff4d5a]/25 active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Live Recording</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeRecording}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={stopRecording}
                className="btn-executive-primary inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg shadow-[#ff4d5a]/30 active:scale-95 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish &amp; Analyze</span>
              </button>

              <button
                type="button"
                onClick={cancelRecording}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 max-w-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
