import React, { useRef, useState } from 'react';
import { UploadCloud, Music, X, Play, Pause, Volume2, FileAudio, CheckCircle2 } from 'lucide-react';

export default function AudioUploader({ file, onFileSelect, onFileRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (selectedFile) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (validTypes.includes(selectedFile.type) || ['mp3', 'wav', 'm4a'].includes(ext)) {
      onFileSelect(selectedFile);
    } else {
      alert('Please select a valid audio file (.mp3 or .wav).');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        className="hidden"
        onChange={handleFileInput}
      />

      {!file ? (
        /* Empty Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[#ff4d5a] bg-[#ff4d5a]/10 scale-[1.01]'
              : 'border-rose-500/25 hover:border-[#ff4d5a]/60 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          {/* Glowing Aura on Hover */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#ff4d5a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Upload Icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff4d5a]/20 to-rose-600/10 border border-[#ff4d5a]/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ff4d5a]/20 transition-all duration-300">
            <UploadCloud className="w-8 h-8 text-[#ff4d5a]" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            Drag and drop your meeting audio here
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-5 max-w-sm">
            Upload MP3 or WAV files up to 25MB for real-time transcription and MOM generation
          </p>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4d5a] to-[#ff3344] hover:from-[#ff3a48] hover:to-[#ff1f32] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#ff4d5a]/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            Select Audio File
          </button>

          {/* Badges footer */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400">
              FORMATS: MP3, WAV
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400">
              MAX: 25 MB
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              GEMINI 3.5 STT READY
            </span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="relative rounded-3xl border border-rose-500/30 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4d5a]/20 to-rose-500/10 border border-[#ff4d5a]/30 flex items-center justify-center shrink-0">
                <FileAudio className="w-6 h-6 text-[#ff4d5a]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center space-x-2.5 text-xs text-slate-400 mt-0.5 font-mono">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-[#ff4d5a] font-semibold">
                    {file.name.split('.').pop()}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready to process
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Preview Controls */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <audio
              ref={audioRef}
              src={URL.createObjectURL(file)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-9 h-9 rounded-xl bg-[#ff4d5a]/15 hover:bg-[#ff4d5a]/25 border border-[#ff4d5a]/30 text-[#ff4d5a] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <span className="text-xs text-slate-400">
                {isPlaying ? 'Playing preview...' : 'Click to preview audio'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#ff4d5a] hover:text-rose-400 underline font-medium cursor-pointer"
            >
              Change file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

