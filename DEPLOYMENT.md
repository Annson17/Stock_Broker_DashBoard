# Deployment Guide - Single Server (Render.com)

## 🚀 Simple One-Step Deployment

This application uses a **single deployment** model where the backend serves both the API and frontend static files. Perfect for demos and MVPs without a database.

---

## Why Single Deployment?

✅ **No Database** - Only file-based persistence  
✅ **Simple Architecture** - One URL, one service  
✅ **No CORS Issues** - Frontend and backend on same domain  
✅ **Easy Maintenance** - One deployment to manage  
✅ **Cost Effective** - Free tier sufficient  

---

## Deploy to Render.com (Free)

### Step 1: Sign Up

1. Go to https://render.com
2. Sign up with GitHub account

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Annson17/Stock_Broker_DashBoard`
3. Click "Connect"

### Step 3: Configure Service

**Basic Settings:**
- **Name:** `stock-broker-dashboard` (or your choice)
- **Region:** Choose closest to your location
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- **Plan:** `Free` (sufficient for demo/selection rounds)

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 2-3 minutes for initial deployment
3. Your app will be live at: `https://stock-broker-dashboard-xxxx.onrender.com`

---

## 🎯 Your Live Application

**Single URL for everything:**
```
https://stock-broker-dashboard.onrender.com
├── Frontend (HTML/CSS/JS)
├── REST API (/api/*)
├── WebSocket (real-time updates)
└── Health Check (/health)
```

---

## ✅ Verify Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"...","uptime":123}`

2. **Supported Stocks:**
   ```
   https://your-app.onrender.com/api/supported-stocks
   ```
   Should return: `{"stocks":["GOOG","TSLA","AMZN","META","NVDA"]}`

3. **Main App:**
   ```
   https://your-app.onrender.com
   ```
   Should show login page

---

## 🧪 Test Multi-User Feature

1. Open your deployed URL in browser
2. Login as: `user1@test.com`
3. Subscribe to: GOOG, TSLA
4. Open same URL in incognito/private window
5. Login as: `user2@test.com`
6. Subscribe to: META, NVDA
7. Observe both dashboards updating independently in real-time

---

## 💡 Important Notes

### Free Tier Behavior

**Render Free Tier:**
- ✅ Sleeps after 15 minutes of inactivity
- ✅ Wakes up automatically when accessed (takes 30-60 seconds)
- ✅ Sufficient for demo/selection rounds
- ✅ Upgrade to paid ($7/month) for always-on

### Keep Service Awake (Optional)

Use a free ping service:
1. Sign up at https://uptimerobot.com (free)
2. Add monitor for your Render URL
3. Ping interval: 10 minutes
4. Prevents sleep during demo periods

---

## 🔧 Troubleshooting

### Issue: "Application Error" on Render

**Solution:**
- Check Render logs (Dashboard → Logs)
- Verify `npm start` runs locally: `npm start`
- Check port configuration: `PORT` environment variable

### Issue: WebSocket Not Connecting

**Solution:**
- Verify app is deployed and running
- Check browser console for errors
- Test `/health` endpoint first

### Issue: Data Not Persisting

**Solution:**
- Render free tier has ephemeral filesystem
- Data persists during session but may reset on redeploy
- For permanent storage, upgrade or use external database

---

## 📊 Architecture

```
User Browser
     ↓
https://stock-broker-dashboard.onrender.com
     ↓
Render Server (Node.js)
├── Express.js (serves /public folder)
├── REST API (/api/*)
├── WebSocket Server (real-time)
└── File System (users-data.json)
```

---

## 🎓 For Company Selection Round

When presenting:

1. **Share Live URL:** `https://your-app.onrender.com`
2. **Demo Multi-User:** Show two browser tabs with different users
3. **Explain Architecture:** Single server, no database, real-time WebSocket
4. **Highlight Features:**
   - Real-time price updates (no refresh)
   - Multi-user support with isolation
   - Data persistence across sessions
   - Dark mode & charts
5. **Mention Scalability:** Can migrate to PostgreSQL/Redis for production

---

## 🚀 Upgrade Options (Future)

When scaling to production:

1. **Paid Render Plan ($7/month):**
   - Always-on (no sleep)
   - Better performance
   - More resources

2. **Add Database:**
   - PostgreSQL on Render (free tier available)
   - Supabase (generous free tier)
   - MongoDB Atlas (free tier)

3. **Separate Frontend:**
   - Deploy frontend to Vercel/Netlify
   - Keep backend on Render
   - Useful when adding mobile app

---

## ✅ Deployment Checklist

- [ ] GitHub repository is public and up-to-date
- [ ] Render account created and linked to GitHub
- [ ] Web Service created with correct settings
- [ ] Build successful (check Render logs)
- [ ] `/health` endpoint returns 200 OK
- [ ] Main page loads correctly
- [ ] Login works
- [ ] Stock subscription works
- [ ] Real-time updates working
- [ ] Multi-user tested (two browser tabs)
- [ ] Dark mode toggle works
- [ ] Charts display correctly

---

## 📞 Support

If deployment fails:
1. Check Render logs for errors
2. Test locally: `npm install && npm start`
3. Verify Node.js version: >=18.0.0
4. Check `package.json` scripts

---

**Your app is production-ready with this simple deployment!** 🎉
