# Deployment Guide

## Production Deployment

**Live Application:** https://stock-broker-dashboard-mn83.onrender.com

This application is deployed on Render.com using a single-server architecture where the Node.js backend serves both API endpoints and static frontend files.

## Deployment Configuration

The application uses a unified deployment model suitable for applications without external database dependencies.

**Benefits:**
- Single URL endpoint for frontend and backend
- No cross-origin resource sharing configuration required
- File-based data persistence
- Simplified deployment and maintenance
- Free tier hosting sufficient for demonstration purposes

## Render.com Deployment Steps

### Prerequisites

- GitHub account with repository access
- Render.com account (free tier available)

### Configuration

1. Access Render dashboard at https://render.com
2. Create new Web Service
3. Connect GitHub repository: `Annson17/Stock_Broker_DashBoard`

### Service Settings

**Environment Configuration:**
- Name: `stock-broker-dashboard`
- Region: Select nearest data center
- Branch: `main`
- Root Directory: (leave empty)
- Runtime: Node

**Build Configuration:**
- Build Command: `npm install`
- Start Command: `npm start`

**Instance Type:**
- Free tier (suitable for demo and testing)

### Deployment Process
2. Build process completes (approximately 2-3 minutes)
3. Application becomes available at assigned URL

## Verification

After deployment completes, verify functionality by accessing:

**Health Check Endpoint:**
```
https://stock-broker-dashboard-mn83.onrender.com/health
```
Expected response: `{"status":"ok","timestamp":"...","uptime":...}`

**API Endpoint:**
```
https://stock-broker-dashboard-mn83.onrender.com/api/supported-stocks
```
Expected response: `{"stocks":["GOOG","TSLA","AMZN","META","NVDA"]}`

**Application:**
```
https://stock-broker-dashboard-mn83.onrender.com
```
Expected: Login page interface

## Testing Multi-User Functionality

1. Access deployed URL in browser
2. Login with test email: `user1@test.com`
3. Subscribe to stocks: GOOG, TSLA
4. Open application in separate browser or incognito window
5. Login with different email: `user2@test.com`
6. Subscribe to different stocks: META, NVDA
7. Verify independent real-time updates in both sessions

## Free Tier Behavior

Render free tier instances sleep after 15 minutes of inactivity. The service automatically restarts when accessed, typically within 30-60 seconds.

To maintain active status during demonstration periods, configure an uptime monitoring service:
1. Create account at https://uptimerobot.com
2. Configure monitor for application URL
3. Set ping interval to 10 minutes

## Troubleshooting

**Application Error:**
- Review Render deployment logs in dashboard
- Verify local build: `npm install && npm start`
- Confirm PORT environment variable configuration

**WebSocket Connection Issues:**
- Verify deployment status in Render dashboard
- Check browser developer console for error messages
- Test health endpoint accessibility

**Data Persistence:**
- Free tier uses ephemeral filesystem
- Data persists during active session
- May reset on application redeployment
- Consider external database for production use

## System Architecture

```
Client Browser
     ↓
https://stock-broker-dashboard-mn83.onrender.com
     ↓
Render Node.js Instance
├── Express.js (static file serving)
├── REST API (/api/*)
├── WebSocket Server
└── File System (users-data.json)
```

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
## Production Scaling Considerations

For applications requiring higher availability and scale:

**Paid Hosting:**
- Render Standard plan ($7/month) provides always-on instances
- Increased resource allocation
- Improved performance metrics

**Database Integration:**
- PostgreSQL on Render
- Supabase
- MongoDB Atlas

**Frontend Separation:**
- Deploy static files to Vercel or Netlify
- Maintain API backend on Render
- Beneficial for mobile application integration

## Deployment Checklist

- GitHub repository accessible and current
- Render account configured with GitHub integration
- Web service created with correct build settings
- Build process completes without errors
- Health endpoint returns HTTP 200
- Application interface loads correctly
- User authentication functional
- Stock subscription operations work
- Real-time price updates active
- Multi-user capability verified
- Theme toggle operational
- Chart visualization working

## Support

For deployment issues:
1. Review Render logs in dashboard
2. Verify local execution: `npm install && npm start`
3. Confirm Node.js version compatibility (>= 18.0.0)
4. Validate package.json configuration
