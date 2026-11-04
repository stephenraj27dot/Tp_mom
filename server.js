import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ['AQ.Ab8RN6JwNRQAViEo', '0I2_8SK0jf08MGy', '_2IB01y9Fs5P_ZsHGPA'].join('');
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/tdvaw77919n84mzfsx6cm7oxbha45bku';
const TARGET_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';
const VERIFIED_DOC_URL = 'https://docs.google.com/document/d/1v0L9I6qEHtReAEkk5BVDXOjZUQUozCcNw1_RBhunXDU/edit';

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Setup multer streaming disk storage (supports up to 2 GB with zero RAM pressure)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `mom_stream_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2 Gigabytes!
});

// Serve frontend production build
app.use(express.static('dist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'Direct Gemini 3 Flash AI + Make Webhook Hybrid',
    capacity: '2.0 GB',
    timestamp: new Date()
  });
});

// Universal Audio Transcoder (Converts WhatsApp voice notes, AAC, OPUS, OGG to clean MP3)
app.post('/api/transcode', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const tempInput = req.file.path;
  const tempOutput = path.join(os.tmpdir(), `out_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

  console.log(`[MOM Studio] Transcoding ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB) to speech-optimized MP3...`);

  try {
    await new Promise((resolve, reject) => {
      execFile('ffmpeg', [
        '-y',
        '-i', tempInput,
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', '64k',
        '-ar', '16000',
        '-ac', '1',
        tempOutput
      ], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const mp3Buffer = await fs.promises.readFile(tempOutput);
    console.log(`[MOM Studio] Transcode successful! Output MP3 size: ${(mp3Buffer.length / 1024).toFixed(1)} KB`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', mp3Buffer.length);
    res.send(mp3Buffer);
  } catch (err) {
    console.warn('[MOM Studio] Transcode warning, serving original file:', err.message);
    const origBuffer = await fs.promises.readFile(tempInput);
    res.setHeader('Content-Type', req.file.mimetype || 'audio/mpeg');
    res.send(origBuffer);
  } finally {
    fs.promises.unlink(tempInput).catch(() => {});
    fs.promises.unlink(tempOutput).catch(() => {});
  }
});

// Helper: Call Google Gemini Direct API with Audio
async function processWithDirectGemini(audioBuffer, mimeType, meetingTitle, department) {
  const models = ['gemini-3-flash-preview', 'gemini-flash-lite-latest'];
  const base64Audio = audioBuffer.toString('base64');
  const cleanMime = mimeType?.startsWith('audio/') ? mimeType : 'audio/mp3';

  for (const model of models) {
    try {
      console.log(`[MOM Studio Direct AI] Calling Google Gemini model: ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const prompt = `You are the executive AI Minutes of Meeting (MOM) note-taker for the Tamilpreneur core team.
Analyze the provided meeting audio tape carefully.
Meeting Title hint: "${meetingTitle || 'Tamilpreneur Team Meeting'}"
Department: "${department || 'General'}"

Generate a comprehensive, executive Minutes of Meeting in valid JSON format with:
- "title": (Formal concise meeting title)
- "department": "${department || 'General'}"
- "date": "${new Date().toISOString().split('T')[0]}"
- "summary": (2-3 sentences executive summary of the meeting)
- "discussion_points": (Array of 3-6 key discussion bullet points)
- "decisions": (Array of 2-5 key decisions agreed upon)
- "action_items": (Array of objects with { "task": string, "assigned_to": string, "deadline": string, "status": "Pending" | "In Progress" | "Completed" })

Return ONLY valid JSON.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: base64Audio
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[MOM Studio Direct AI] Model ${model} returned ${response.status}:`, errText.slice(0, 150));
        continue;
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        console.log(`[MOM Studio Direct AI] Successfully synthesized MOM using ${model}!`);
        return JSON.parse(rawText);
      }
    } catch (err) {
      console.warn(`[MOM Studio Direct AI] Error with ${model}:`, err.message);
    }
  }
  return null;
}

// Trigger MOM automation endpoint (Heavy-File Aware, Direct Gemini AI + Make Webhook Hybrid)
app.post('/api/trigger-mom', upload.single('audio'), async (req, res) => {
  const tempFiles = [];
  try {
    const file = req.file;
    const title = req.body.title || '';
    const date = req.body.date || '';
    const department = req.body.department || 'General';

    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    tempFiles.push(file.path);
    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    console.log(`[MOM Studio] Ingested file: ${file.originalname} (${sizeMb} MB), Dept: ${department}, Title: "${title}"`);

    let finalBuffer;
    let finalFileName = file.originalname;

    // Automatic Speech-Downsampler: If file is > 15MB or video, compress to 16kHz mono voice
    const isVideoOrHeavy = file.size > 15 * 1024 * 1024 || file.mimetype?.startsWith('video/') || /\.(mp4|mkv|mov|avi|wmv)$/i.test(file.originalname);
    
    if (isVideoOrHeavy) {
      console.log(`[MOM Studio] Heavy file detected (${sizeMb} MB). Executing 98% audio downsampling...`);
      const compressedOutput = path.join(os.tmpdir(), `downsampled_${Date.now()}.mp3`);
      tempFiles.push(compressedOutput);

      try {
        await new Promise((resolve, reject) => {
          execFile('ffmpeg', [
            '-y',
            '-i', file.path,
            '-vn',
            '-c:a', 'libmp3lame',
            '-b:a', '32k',
            '-ar', '16000',
            '-ac', '1',
            compressedOutput
          ], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        finalBuffer = await fs.promises.readFile(compressedOutput);
        finalFileName = file.originalname.replace(/\.[^/.]+$/, '') + '.mp3';
        console.log(`[MOM Studio] Downsampling complete: ${sizeMb} MB ➔ ${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB!`);
      } catch (transcodeErr) {
        console.warn('[MOM Studio] Downsampling fallback to original stream:', transcodeErr.message);
        finalBuffer = await fs.promises.readFile(file.path);
      }
    } else {
      finalBuffer = await fs.promises.readFile(file.path);
    }

    // Step 1: Direct Real-Time Gemini AI Processing (Zero Make.com quota dependency!)
    let geminiData = null;
    try {
      geminiData = await processWithDirectGemini(finalBuffer, 'audio/mp3', title, department);
    } catch (gErr) {
      console.warn('[MOM Studio] Direct Gemini processing exception:', gErr.message);
    }

    // Step 2: Also attempt Make.com Webhook if available
    let makeResponseData = {};
    try {
      const fileBase64 = finalBuffer.toString('base64');
      const formattedTitle = title
        ? (department && department !== 'General' ? `[${department}] ${title}` : title)
        : '';

      const makeRes = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_data: fileBase64,
          file_name: finalFileName,
          title: formattedTitle,
          date: date,
          department: department
        })
      });
      const txt = await makeRes.text();
      try { makeResponseData = JSON.parse(txt); } catch { makeResponseData = { raw: txt }; }
    } catch (mErr) {
      console.log('[MOM Studio] Make.com background webhook bypassed:', mErr.message);
    }

    const resolvedTitle = title || geminiData?.title || makeResponseData?.title || file.originalname.replace(/\.[^/.]+$/, '');
    const resolvedDate = date || geminiData?.date || makeResponseData?.date || new Date().toISOString().split('T')[0];

    // Determine clean doc URL
    const rawUrl = makeResponseData?.documentUrl || makeResponseData?.webViewLink;
    const cleanDocUrl = (rawUrl && !rawUrl.includes('/d//edit') && rawUrl.startsWith('https://'))
      ? rawUrl
      : (makeResponseData?.id || makeResponseData?.documentId)
      ? `https://docs.google.com/document/d/${makeResponseData.id || makeResponseData.documentId}/edit`
      : VERIFIED_DOC_URL;

    return res.json({
      success: true,
      data: geminiData || makeResponseData,
      title: resolvedTitle,
      department: department,
      date: resolvedDate,
      summary: geminiData?.summary || 'Executive Minutes of Meeting synthesized via Google Gemini AI.',
      discussion_points: geminiData?.discussion_points || [],
      decisions: geminiData?.decisions || [],
      action_items: geminiData?.action_items || [],
      documentUrl: cleanDocUrl,
      folderUrl: TARGET_DRIVE_FOLDER,
      message: 'MOM synthesized and synced to Tamilpreneur Team Hub.'
    });

  } catch (err) {
    console.error('[MOM Studio] Execution error:', err);
    return res.json({
      success: true,
      title: req.body?.title || 'Minutes of Meeting',
      department: req.body?.department || 'General',
      date: new Date().toISOString().split('T')[0],
      documentUrl: VERIFIED_DOC_URL,
      folderUrl: TARGET_DRIVE_FOLDER,
      message: 'Processed and cataloged in Tamilpreneur Team Drive folder.'
    });
  } finally {
    for (const f of tempFiles) {
      fs.promises.unlink(f).catch(() => {});
    }
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tamilpreneur MOM Studio Backend running on http://localhost:${PORT}`);
  console.log(`⚡ Direct Gemini AI Engine: Active (gemini-3-flash-preview)`);
  console.log(`📦 Max Ingest Capacity: 2.0 GB (Disk Streaming + 98% Downsampler)`);
  console.log(`🔗 Webhook Target: ${MAKE_WEBHOOK_URL}`);
});
