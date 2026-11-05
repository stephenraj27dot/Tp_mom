/**
 * In-Browser Audio Transcoder & Waveform Engine
 * -------------------------------------------------------------
 * Decodes Opus, OGG, WhatsApp voice notes, AAC, M4A, AMR, WebM
 * in pure client-side Web Audio API and converts to a universal 
 * 16-bit PCM WAV Blob.
 * 
 * Works 100% on Vercel static deployments without any backend server.
 */

export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;
  const numSamples = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio data (interleaved channels)
  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert float [-1.0, 1.0] to 16-bit signed integer [-32768, 32767]
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function extractPeaksFromBuffer(buffer, count = 64) {
  const raw = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(raw.length / count));
  const peaks = [];

  for (let i = 0; i < count; i++) {
    let sum = 0;
    const start = i * block;
    const end = Math.min(start + block, raw.length);
    for (let j = start; j < end; j++) {
      sum += Math.abs(raw[j]);
    }
    peaks.push(sum / Math.max(1, end - start));
  }

  const max = Math.max(...peaks) || 1;
  return peaks.map(p => Math.max(0.14, p / max));
}

/**
 * Transcodes any audio file into a 100% browser-playable WAV file
 * and extracts waveform peaks in a single pass.
 */
export async function transcodeAudioInBrowser(file) {
  // Heavy file safeguard: Skip full in-memory decode if > 30MB
  if (file.size > 30 * 1024 * 1024) {
    return { isHeavy: true };
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API not supported in this browser');
  }

  const ctx = new AudioCtx();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const peaks = extractPeaksFromBuffer(audioBuffer, 64);
    const wavBlob = audioBufferToWav(audioBuffer);
    const duration = audioBuffer.duration;

    return {
      success: true,
      wavBlob,
      duration,
      peaks,
    };
  } finally {
    if (ctx.state !== 'closed') {
      ctx.close().catch(() => {});
    }
  }
}
