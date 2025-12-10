const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Supported stocks
const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// In-memory data store
const users = new Map(); // email -> { email, subscriptions: Set }
const stockPrices = new Map(); // ticker -> price
const clients = new Map(); // ws -> { email, subscriptions: Set }

// Data persistence file
const DATA_FILE = path.join(__dirname, 'users-data.json');

// Load existing user data on server start
function loadUserData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      Object.entries(data).forEach(([email, userData]) => {
        users.set(email, {
          email,
          subscriptions: new Set(userData.subscriptions || [])
        });
      });
      console.log(`✅ Loaded ${users.size} users from disk`);
    }
  } catch (error) {
    console.error('⚠️ Error loading user data:', error.message);
  }
}

// Save user data to disk (debounced to avoid excessive writes)
let saveTimeout;
function saveUserData() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = {};
      users.forEach((user, email) => {
        data[email] = {
          email: user.email,
          subscriptions: Array.from(user.subscriptions)
        };
      });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('💾 User data saved to disk');
    } catch (error) {
      console.error('⚠️ Error saving user data:', error.message);
    }
  }, 1000); // Save after 1 second of inactivity
}

// Initialize stock prices
SUPPORTED_STOCKS.forEach(ticker => {
  stockPrices.set(ticker, Math.random() * 1000 + 100); // Random price between 100-1100
});

// Load user data on startup
loadUserData();

// REST API Endpoints

// Health check endpoint (for monitoring)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Login user (simple email-based for demo)
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  // Auto-create user if doesn't exist (no password needed for demo)
  if (!users.has(email)) {
    users.set(email, { email, subscriptions: new Set() });
    saveUserData(); // Persist to disk
  }
  
  const user = users.get(email);
  res.json({ 
    success: true, 
    email: user.email,
    subscriptions: Array.from(user.subscriptions)
  });
});

app.post('/api/subscribe', (req, res) => {
  const { email, ticker } = req.body;
  
  if (!email || !ticker) {
    return res.status(400).json({ error: 'Email and ticker are required' });
  }
  
  if (!SUPPORTED_STOCKS.includes(ticker)) {
    return res.status(400).json({ error: 'Stock not supported', supported: SUPPORTED_STOCKS });
  }
  
  const user = users.get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found. Please login first.' });
  }
  
  user.subscriptions.add(ticker);
  saveUserData(); // Persist to disk
  
  // Notify all clients of this user about the subscription
  notifyUserClients(email, {
    type: 'subscription_added',
    ticker,
    price: stockPrices.get(ticker)
  });
  
  res.json({ 
    success: true, 
    subscriptions: Array.from(user.subscriptions)
  });
});

app.post('/api/unsubscribe', (req, res) => {
  const { email, ticker } = req.body;
  
  const user = users.get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.subscriptions.delete(ticker);
  saveUserData(); // Persist to disk
  
  // Notify all clients of this user
  notifyUserClients(email, {
    type: 'subscription_removed',
    ticker
  });
  
  res.json({ 
    success: true, 
    subscriptions: Array.from(user.subscriptions)
  });
});

app.get('/api/supported-stocks', (req, res) => {
  res.json({ stocks: SUPPORTED_STOCKS });
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'register') {
        const { email } = data;
        const user = users.get(email);
        
        if (user) {
          clients.set(ws, { email, subscriptions: user.subscriptions });
          
          // Send current prices for subscribed stocks
          const prices = {};
          user.subscriptions.forEach(ticker => {
            prices[ticker] = stockPrices.get(ticker);
          });
          
          ws.send(JSON.stringify({
            type: 'initial_prices',
            prices,
            subscriptions: Array.from(user.subscriptions)
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Helper function to notify all clients of a specific user
function notifyUserClients(email, message) {
  clients.forEach((clientData, ws) => {
    if (clientData.email === email && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Broadcast price updates to all connected clients
function broadcastPriceUpdate(ticker, price) {
  clients.forEach((clientData, ws) => {
    if (clientData.subscriptions.has(ticker) && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'price_update',
        ticker,
        price,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Update stock prices every second using random number generator
setInterval(() => {
  SUPPORTED_STOCKS.forEach(ticker => {
    const currentPrice = stockPrices.get(ticker);
    // Random fluctuation between -5% to +5%
    const change = (Math.random() - 0.5) * 0.1 * currentPrice;
    const newPrice = Math.max(10, currentPrice + change); // Minimum price of 10
    
    stockPrices.set(ticker, newPrice);
    broadcastPriceUpdate(ticker, newPrice);
  });
}, 1000); // Update every second

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Supported stocks: ${SUPPORTED_STOCKS.join(', ')}`);
  console.log(`💾 Data persistence: ${DATA_FILE}`);
});
