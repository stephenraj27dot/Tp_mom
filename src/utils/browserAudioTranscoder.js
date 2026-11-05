import { OggOpusDecoder } from 'ogg-opus-decoder';

/**
 * Universal In-Browser Audio Transcoder & Waveform Engine
 * -------------------------------------------------------------
 * Decodes WhatsApp voice notes (.opus / .ogg) using WASM libopus
 * and standard audio formats using Web Audio API into universal
 * 16-bit PCM WAV Blobs for 100% crystal-clear browser playback.
 */

export function encodeChannelDataToWav(channelData, sampleRate) {
  const numChannels = channelData.length;
  const numSamples = channelData[0].length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples (interleaved, clamped, 16-bit)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function extractPeaksFromChannelData(channelData, count = 64) {
  const raw = channelData[0];
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
 * Transcodes any audio file into standard WAV in the browser.
 */
export async function transcodeAudioInBrowser(file) {
  // Heavy file guard (> 35MB)
  if (file.size > 35 * 1024 * 1024) {
    return { isHeavy: true };
  }

  const nameLower = file.name.toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isOpusOrWhatsApp =
    nameLower.includes('whatsapp') ||
    ext === 'opus' ||
    ext === 'ogg' ||
    file.type?.includes('opus') ||
    file.type?.includes('ogg');

  // Strategy 1: For WhatsApp & Opus files, use WASM OggOpusDecoder
  if (isOpusOrWhatsApp) {
    try {
      const decoder = new OggOpusDecoder();
      await decoder.ready;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Bytes = new Uint8Array(arrayBuffer);
      const { channelData, samplesDecoded, sampleRate } = await decoder.decode(uint8Bytes);
      decoder.free();

      if (channelData && channelData.length > 0 && samplesDecoded > 0) {
        const wavBlob = encodeChannelDataToWav(channelData, sampleRate);
        const peaks = extractPeaksFromChannelData(channelData, 64);
        const duration = samplesDecoded / sampleRate;

        return {
          success: true,
          wavBlob,
          duration,
          peaks,
        };
      }
    } catch (opusErr) {
      console.warn('[AudioTranscoder] WASM Opus decode error, trying Web Audio API:', opusErr);
    }
  }

  // Strategy 2: Web Audio API (for MP3, standard WAV, AAC, M4A)
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) {
    const ctx = new AudioCtx();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await new Promise((resolve, reject) => {
        ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      });

      const channelData = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        channelData.push(audioBuffer.getChannelData(c));
      }

      const wavBlob = encodeChannelDataToWav(channelData, audioBuffer.sampleRate);
      const peaks = extractPeaksFromChannelData(channelData, 64);

      return {
        success: true,
        wavBlob,
        duration: audioBuffer.duration,
        peaks,
      };
    } catch (webAudioErr) {
      console.warn('[AudioTranscoder] Web Audio API fallback:', webAudioErr);
    } finally {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    }
  }

  // Strategy 3: Wrap with proper MIME type if all decoders fail
  let mimeType = 'audio/mpeg';
  if (ext === 'ogg' || ext === 'opus') mimeType = 'audio/ogg; codecs=opus';
  else if (ext === 'wav') mimeType = 'audio/wav';
  else if (ext === 'm4a' || ext === 'aac') mimeType = 'audio/mp4';

  const fixedBlob = new Blob([file], { type: mimeType });
  return {
    success: false,
    fixedBlob,
    isFallback: true
  };
}
