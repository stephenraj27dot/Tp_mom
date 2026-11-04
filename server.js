import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3001;
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/tdvaw77919n84mzfsx6cm7oxbha45bku';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup multer memory storage (supports up to 35MB audio)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 }
});

// Serve frontend production build
app.use(express.static('dist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', webhook: MAKE_WEBHOOK_URL, timestamp: new Date() });
});

// Universal Audio Transcoder (Converts WhatsApp voice notes, AAC, OPUS, OGG to clean MP3)
app.post('/api/transcode', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const ext = path.extname(req.file.originalname) || '.audio';
  const tempInput = path.join(os.tmpdir(), `in_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  const tempOutput = path.join(os.tmpdir(), `out_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

  console.log(`[MOM Studio] Transcoding ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB) to standard MP3...`);

  try {
    await fs.promises.writeFile(tempInput, req.file.buffer);

    await new Promise((resolve, reject) => {
      execFile('ffmpeg', [
        '-y',
        '-i', tempInput,
        '-c:a', 'libmp3lame',
        '-b:a', '128k',
        '-ar', '44100',
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
    res.setHeader('Content-Type', req.file.mimetype || 'audio/mpeg');
    res.send(req.file.buffer);
  } finally {
    fs.promises.unlink(tempInput).catch(() => {});
    fs.promises.unlink(tempOutput).catch(() => {});
  }
});

// Trigger MOM automation endpoint
app.post('/api/trigger-mom', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const title = req.body.title || '';
    const date = req.body.date || '';
    const department = req.body.department || 'General';

    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    console.log(`[MOM Studio] Received file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB), Dept: ${department}, Title: "${title}"`);

    // Convert file buffer to Base64
    const fileBase64 = file.buffer.toString('base64');

    const formattedTitle = title
      ? (department && department !== 'General' ? `[${department}] ${title}` : title)
      : '';

    const payload = {
      file_data: fileBase64,
      file_name: file.originalname,
      title: formattedTitle,
      date: date,
      department: department
    };

    console.log('[MOM Studio] Forwarding payload to Make.com Webhook...');
    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await makeResponse.text();
    console.log(`[MOM Studio] Make.com Response Code: ${makeResponse.status}`);
    console.log(`[MOM Studio] Make.com Response Body: ${responseText.slice(0, 300)}`);

    let responseData = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!makeResponse.ok && makeResponse.status !== 200) {
      return res.status(makeResponse.status).json({
        error: 'Make.com webhook returned an error.',
        details: responseData
      });
    }

    const rawUrl = responseData.documentUrl || responseData.webViewLink;
    const cleanDocUrl = (rawUrl && !rawUrl.includes('/d//edit') && rawUrl.startsWith('https://'))
      ? rawUrl
      : (responseData.id || responseData.documentId)
      ? `https://docs.google.com/document/d/${responseData.id || responseData.documentId}/edit`
      : 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP';

    return res.json({
      success: true,
      data: responseData,
      title: title || responseData.title || file.originalname.replace(/\.[^/.]+$/, ''),
      date: date || responseData.date,
      documentUrl: cleanDocUrl,
      folderUrl: 'https://drive.google.com/drive/folders/1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP'
    });

  } catch (err) {
    console.error('[MOM Studio] Execution error:', err);
    res.status(500).json({
      error: err.message || 'Internal server error while processing audio.'
    });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tamilpreneur MOM Studio Backend running on http://localhost:${PORT}`);
  console.log(`🔗 Webhook Target: ${MAKE_WEBHOOK_URL}`);
});
