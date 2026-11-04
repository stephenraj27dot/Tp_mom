# 🚀 24/7 Cloud Backend Deployment Guide (Render.com)

This project contains a pre-configured **`render.yaml`** blueprint to run the **Tamilpreneur MOM Studio Backend** 24/7 in the cloud for **100% Free** (zero laptop dependency).

---

## ⚡ 1-Click Setup Instructions

1. **Sign in to Render:**
   * Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with your GitHub account.

2. **Create New Blueprint Instance:**
   * Click the blue **"New +"** button in the top right.
   * Select **"Blueprint"**.
   * Connect your GitHub repository: **`stephenraj27dot/Tp_mom`**.
   * Render will automatically detect **`render.yaml`** and configure:
     * **Service Name:** `tamilpreneur-mom-api`
     * **Environment:** `Node`
     * **Region:** `Singapore` (Fastest latency for India)
     * **Plan:** `Free ($0/month)`
     * **Build Command:** `npm install && npm run build`
     * **Start Command:** `node server.js`

3. **Set Environment Variable:**
   * When prompted for `GEMINI_API_KEY`, enter your Google Gemini API Key.

4. **Click "Apply":**
   * Render will build and deploy the application in ~90 seconds.
   * Once live, your backend will have a permanent 24/7 cloud URL:  
     👉 **`https://tamilpreneur-mom-api.onrender.com`**

---

## 🔗 Connecting to Vercel Frontend (Optional)

If you want the Vercel frontend (`https://tamilpreneurmom.vercel.app/`) to route heavy recordings through your Render backend:
1. Open your Vercel Dashboard for `Tp_mom`.
2. Go to **Settings** &rarr; **Environment Variables**.
3. Add:
   * **Key:** `VITE_BACKEND_URL`
   * **Value:** `https://tamilpreneur-mom-api.onrender.com`
4. Redeploy Vercel.

---
*Tamilpreneur Studio • AI Automation Engine • 24/7 Cloud Ready*
