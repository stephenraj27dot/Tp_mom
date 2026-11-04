# Tamilpreneur Studio — AI Minutes of Meeting (MOM) Automation

An enterprise-grade, beautifully crafted Web Application that transcribes meeting audio recordings (`.mp3`, `.wav`, `.m4a`, `WhatsApp Audio`, `.opus`) using Google Gemini 3.5 Speech-to-Text, extracts actionable insights, and automatically generates formatted executive Google Docs directly into your Google Drive folder via Make.com instant Webhooks.

Built specifically for the **Tamilpreneur Internal Team** to streamline meeting documentation, decision tracking, and team-wide synchronization.

---

## 🌟 Key Features

- **⚡ Instant 0-Second Execution:** Triggered immediately via custom Make.com webhook — no 15-minute polling delay.
- **🎙️ Universal Audio Support:** Native audio pipeline powered by FFmpeg auto-transcodes WhatsApp voice notes, AAC, OPUS, OGG, M4A, and MP3 with loud, crystal-clear playback.
- **🏷️ Team Department Selector:** Categorize meetings with fast-select pills (`General`, `Tech & Product`, `Marketing & Growth`, `Community & Events`, `Leadership`).
- **✏️ Inline Title Customization:** Click to rename meeting files directly from raw WhatsApp filenames into crisp executive titles (e.g., *"Weekly Sprint Sync"*).
- **📁 Team Meeting Archive Hub:** Built-in dashboard tracking all past synthesized documents with 1-click access and Slack/WhatsApp formatted summary copy.
- **📱 Slack & WhatsApp Ready:** One-click copy formats decisions, action items, assignees, deadlines, and the Google Doc link ready to drop into team groups.
- **🎨 Dark Minimalist Executive UI:** High-contrast dark `#070B12` theme inspired by Tamilpreneur design language with coral red (`#ff4d5a`) accents, interactive waveform visualizer, and refined micro-interactions.

---

## 🏗️ Architecture

```
[ User drops Audio (.mp3, .wav, WhatsApp) ]
              │
              ▼
[ Local Express Backend (:3001) ]
       │ (Auto FFmpeg Transcode for preview)
       │ (Base64 Binary Packaging)
              ▼
[ Make.com Instant Webhook ]
       │
       ├─► 1. Gemini AI File API (Upload)
       ├─► 2. Gemini 3.5 Transcribe (Full Speech-to-Text)
       ├─► 3. Gemini 2.5 Flash (Executive MOM JSON Extraction)
       ├─► 4. JSON Schema Parser
       ├─► 5. Google Docs API (Create & Format in /meeting-audio)
       └─► 6. Webhook Response (Synchronous Return)
              │
              ▼
[ Web UI: Direct Google Doc Link + Slack/WhatsApp Share + Archive Hub ]
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- FFmpeg (installed and available in system PATH)

### 2. Install & Run
```bash
# Clone the repository
git clone https://github.com/stephenraj27dot/Tp_mom.git
cd Tp_mom

# Install dependencies
npm install

# Build frontend & start server
npm run build
npm start
```

Open **[http://localhost:3001](http://localhost:3001)** in your browser!

### 3. Development Mode (Hot-Reload)
```bash
# Terminal 1: Backend proxy server
npm run server

# Terminal 2: Vite dev server with hot module replacement
npm run dev
```

---

## ⚙️ Make.com Automation Setup

The complete Make.com scenario blueprint is included in this repository:
📁 **[`make-scenario/mom-gemini-stt-webhook-blueprint.json`](./make-scenario/mom-gemini-stt-webhook-blueprint.json)**

- **Target Scenario ID:** `7611268` ("MOM - Gemini STT Studio Webhook")
- **Webhook Endpoint:** `https://hook.eu1.make.com/tdvaw77919n84mzfsx6cm7oxbha45bku`
- **Output Google Drive Folder:** `/meeting-audio` (`1SuttqetuJUjymmr9YI2Jw1AN3kvt5DsP`)
- **Google Connection:** Stephen's Google Connection (`astephenraj72@gmail.com`)

### Team Access Tip:
To allow all Tamilpreneur team members to open and edit generated documents without permission prompts, set the `/meeting-audio` Google Drive folder permission to:
> **General Access: "Anyone with the link" -> "Viewer" or "Editor"**

---

## 📂 Repository Structure

```
Tp_mom/
├── make-scenario/
│   ├── mom-gemini-stt-webhook-blueprint.json  # Complete Make.com Scenario Blueprint
│   └── README.md                             # Scenario import instructions
├── public/
│   ├── tamilpreneur-logo.png                 # Official Tamilpreneur Brand Asset
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AudioConsole.jsx                  # Waveform deck, title editor, team pills
│   │   ├── ExecutiveDocCard.jsx              # Doc link, Drive link, Slack/WhatsApp copy
│   │   ├── MeetingArchive.jsx                # Team MOM document history & hub
│   │   ├── ProcessingConsole.jsx             # Real-time telemetry log feed
│   │   ├── Header.jsx                        # Brand bar & Make.com status
│   │   ├── Hero.jsx                          # Executive headline
│   │   └── Footer.jsx                        # Copyright & model badge
│   ├── App.jsx                               # Master state & workflow orchestrator
│   ├── index.css                             # Executive styles & micro-interactions
│   └── main.jsx
├── server.js                                 # Express proxy, multer & FFmpeg transcoder
├── vite.config.js                            # Vite config & API reverse proxy
├── package.json
└── README.md
```

---

## 🔒 License & Confidentiality
Designed and maintained for the **Tamilpreneur Internal Team**.
Confidential & Proprietary.
