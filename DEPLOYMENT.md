# Deployment Guide

## 🚀 Two-Step Deployment Process

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard:**
   - Visit: https://render.com
   - Sign in with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect repository: `Annson17/Stock_Broker_DashBoard`
   - Click "Connect"

3. **Configure Backend:**
   - **Name:** `stock-broker-dashboard` (or any name you prefer)
   - **Region:** Choose closest to your location
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - **Copy the URL** (e.g., `https://stock-broker-dashboard-xxxx.onrender.com`)

### Step 2: Update Frontend Configuration

5. **Update API URL:**
   - Open `public/app.js`
   - Find line 2-3 where `API_BASE_URL` is defined
   - Replace the production URL with your Render backend URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:3000'
     : 'https://your-backend-url.onrender.com'; // Replace with your actual Render URL
   ```

6. **Commit and Push:**
   ```bash
   git add public/app.js
   git commit -m "Update backend URL for production"
   git push origin main
   ```

### Step 3: Deploy Frontend to Vercel

7. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Sign in with GitHub

8. **Create New Project:**
   - Click "Add New..." → "Project"
   - Import repository: `Annson17/Stock_Broker_DashBoard`
   - Click "Import"

9. **Configure Frontend:**
   - **Framework Preset:** Other
   - **Root Directory:** `public`
   - **Build Command:** Leave empty
   - **Output Directory:** `.` (dot)
   - **Install Command:** `npm install` (or leave empty)

10. **Deploy:**
    - Click "Deploy"
    - Wait 1-2 minutes
    - Your app will be live at: `https://stock-broker-dashboard.vercel.app`

---

## ✅ Verification Steps

After deployment, test your application:

1. **Open Vercel URL** in browser
2. **Login** with any email
3. **Subscribe** to stocks (GOOG, TSLA, etc.)
4. **Verify real-time updates** are working
5. **Test multi-user:** Open in another browser/incognito tab

---

## 🔧 Troubleshooting

### Issue: "WebSocket connection failed"
- Check that backend URL in `app.js` matches your Render URL
- Verify Render backend is running (visit `/health` endpoint)

### Issue: "CORS error"
- Backend `server.js` already configured for CORS
- If issue persists, add your Vercel domain to CORS origins in `server.js`

### Issue: "Cannot fetch stocks"
- Check browser console for errors
- Verify API_BASE_URL is correct
- Test backend directly: `https://your-backend.onrender.com/health`

---

## 📝 Final URLs

After deployment, update your README.md with:
- **Frontend:** `https://stock-broker-dashboard.vercel.app`
- **Backend API:** `https://stock-broker-dashboard.onrender.com`

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - Render: Backend sleeps after 15 min inactivity (wakes on request)
   - Vercel: Unlimited bandwidth on free tier

2. **Keep Backend Awake:**
   - Use a ping service like UptimeRobot (free)
   - Ping `/health` endpoint every 10 minutes

3. **Custom Domain:**
   - Both Render and Vercel support custom domains
   - Configure in respective dashboards

---

## 🎯 Architecture

```
User Browser
     ↓
Vercel Frontend (CDN) 
https://stock-broker-dashboard.vercel.app
├── HTML/CSS/JS
├── Chart.js
└── Optimized static hosting
     ↓
Render Backend (Node.js)
https://stock-broker-dashboard.onrender.com
├── Express REST API
├── WebSocket server
└── Data persistence (JSON file)
```
