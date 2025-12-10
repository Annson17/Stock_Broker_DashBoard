// API Configuration - Dynamically detect backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'  // Local development
  : 'https://stock-broker-dashboard.onrender.com'; // Production backend (update after deployment)

const WS_URL = API_BASE_URL.replace('http', 'ws');

// Global state
let currentUser = null;
let ws = null;
let stockPrices = {};
let previousPrices = {};
let initialPrices = {};
let priceHistory = {}; // Store historical prices for charts
let supportedStocks = [];
let currentView = 'grid';
let priceChart = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');
const stockButtonsContainer = document.getElementById('stock-buttons');
const portfolio = document.getElementById('portfolio');
const connectionStatus = document.getElementById('connection-status');
const statsGrid = document.getElementById('stats-grid');
const chartModal = document.getElementById('chart-modal');
const alertContainer = document.getElementById('alert-container');

// Initialize
async function init() {
  await loadSupportedStocks();
  setupEventListeners();
  loadThemePreference();
}

// Load theme preference
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// Update theme icon
function updateThemeIcon(theme) {
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  showAlert('success', 'Theme Changed', `Switched to ${newTheme} mode`);
}

// Load supported stocks
async function loadSupportedStocks() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supported-stocks`);
    const data = await response.json();
    supportedStocks = data.stocks;
    
    // Initialize price history for each stock
    supportedStocks.forEach(ticker => {
      priceHistory[ticker] = [];
    });
  } catch (error) {
    console.error('Error loading supported stocks:', error);
    supportedStocks = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
    supportedStocks.forEach(ticker => {
      priceHistory[ticker] = [];
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  themeToggle.addEventListener('click', toggleTheme);
  
  // View toggle buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      switchView(view);
    });
  });
  
  // Close modal when clicking outside
  chartModal.addEventListener('click', (e) => {
    if (e.target === chartModal) {
      closeChartModal();
    }
  });
}

// Switch view (grid/list)
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  portfolio.className = view === 'grid' ? 'portfolio-grid' : 'portfolio-list';
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  
  if (!email) {
    showAlert('danger', 'Error', 'Please enter a valid email');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentUser = email;
      showDashboard(data.subscriptions);
      connectWebSocket();
      showAlert('success', 'Welcome!', `Logged in as ${email}`);
    } else {
      showAlert('danger', 'Login Failed', data.error || 'Please try again');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('danger', 'Connection Error', 'Failed to login. Please try again.');
  }
}

// Handle logout
function handleLogout() {
  if (ws) {
    ws.close();
  }
  currentUser = null;
  stockPrices = {};
  previousPrices = {};
  initialPrices = {};
  priceHistory = {};
  supportedStocks.forEach(ticker => {
    priceHistory[ticker] = [];
  });
  
  loginSection.style.display = 'block';
  dashboardSection.style.display = 'none';
  statsGrid.style.display = 'none';
  emailInput.value = '';
  showAlert('success', 'Logged Out', 'See you next time!');
}

// Show dashboard
function showDashboard(subscriptions) {
  currentUserSpan.textContent = currentUser;
  loginSection.style.display = 'none';
  dashboardSection.style.display = 'block';
  
  renderStockButtons(subscriptions);
  renderPortfolio(subscriptions);
  updateStatistics(subscriptions);
}

// Render stock buttons
function renderStockButtons(subscriptions) {
  stockButtonsContainer.innerHTML = '';
  
  supportedStocks.forEach(ticker => {
    const button = document.createElement('button');
    button.className = 'stock-btn';
    button.textContent = ticker;
    button.dataset.ticker = ticker;
    
    if (subscriptions.includes(ticker)) {
      button.classList.add('subscribed');
      button.textContent = `${ticker} ✓`;
    }
    
    button.addEventListener('click', () => handleStockToggle(ticker, subscriptions.includes(ticker)));
    stockButtonsContainer.appendChild(button);
  });
}

// Handle stock toggle
async function handleStockToggle(ticker, isSubscribed) {
  const endpoint = isSubscribed ? '/api/unsubscribe' : '/api/subscribe';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, ticker })
    });
    
    const data = await response.json();
    
    if (data.success) {
      renderStockButtons(data.subscriptions);
      renderPortfolio(data.subscriptions);
      updateStatistics(data.subscriptions);
      
      const action = isSubscribed ? 'unsubscribed from' : 'subscribed to';
      showAlert('success', 'Success', `You ${action} ${ticker}`);
    } else {
      showAlert('danger', 'Error', data.error || 'Operation failed');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    showAlert('danger', 'Error', 'Failed to update subscription');
  }
}

// Render portfolio
function renderPortfolio(subscriptions) {
  if (subscriptions.length === 0) {
    portfolio.innerHTML = '<p class="empty-message">No stocks subscribed yet. Subscribe to stocks above to get started.</p>';
    statsGrid.style.display = 'none';
    return;
  }
  
  statsGrid.style.display = 'grid';
  portfolio.innerHTML = '';
  
  subscriptions.forEach(ticker => {
    const stockItem = createStockItem(ticker, stockPrices[ticker] || 0);
    portfolio.appendChild(stockItem);
  });
}

// Create stock item
function createStockItem(ticker, price) {
  const div = document.createElement('div');
  div.className = 'stock-item';
  div.id = `stock-${ticker}`;
  
  const initialPrice = initialPrices[ticker] || price;
  const previousPrice = previousPrices[ticker] || price;
  const change = price - previousPrice;
  const sessionChange = price - initialPrice;
  const changePercent = previousPrice ? (change / previousPrice * 100) : 0;
  const sessionChangePercent = initialPrice ? (sessionChange / initialPrice * 100) : 0;
  
  const changeClass = change >= 0 ? 'positive' : 'negative';
  const changeSymbol = change >= 0 ? '▲' : '▼';
  
  div.innerHTML = `
    <button class="unsubscribe-btn" onclick="unsubscribe('${ticker}')">×</button>
    <div class="stock-ticker">${ticker}</div>
    <div class="stock-price">$${price.toFixed(2)}</div>
    <div class="stock-change ${changeClass}">
      ${changeSymbol} $${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(2)}%)
    </div>
    <div class="last-update">Session: ${sessionChange >= 0 ? '+' : ''}${sessionChangePercent.toFixed(2)}%</div>
    <button class="chart-btn" onclick="showChart('${ticker}')">📊 Chart</button>
  `;
  
  return div;
}

// Show chart modal
function showChart(ticker) {
  const modal = document.getElementById('chart-modal');
  const title = document.getElementById('chart-title');
  title.textContent = `${ticker} - Price History`;
  
  modal.classList.add('active');
  
  // Destroy existing chart
  if (priceChart) {
    priceChart.destroy();
  }
  
  // Create new chart
  const ctx = document.getElementById('price-chart').getContext('2d');
  const history = priceHistory[ticker] || [];
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map((_, i) => `${i}s`),
      datasets: [{
        label: `${ticker} Price`,
        data: history,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `Price: $${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time (seconds)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price ($)'
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(2);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// Close chart modal
function closeChartModal() {
  const modal = document.getElementById('chart-modal');
  modal.classList.remove('active');
  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }
}

// Make functions global
window.unsubscribe = async function(ticker) {
  await handleStockToggle(ticker, true);
};

window.showChart = showChart;
window.closeChartModal = closeChartModal;

// Update statistics
function updateStatistics(subscriptions) {
  if (subscriptions.length === 0) return;
  
  let totalValue = 0;
  let totalInitialValue = 0;
  let bestPerformer = { ticker: '', change: -Infinity };
  let worstPerformer = { ticker: '', change: Infinity };
  
  subscriptions.forEach(ticker => {
    const price = stockPrices[ticker] || 0;
    const initialPrice = initialPrices[ticker] || price;
    const change = ((price - initialPrice) / initialPrice) * 100;
    
    totalValue += price;
    totalInitialValue += initialPrice;
    
    if (change > bestPerformer.change) {
      bestPerformer = { ticker, change };
    }
    if (change < worstPerformer.change) {
      worstPerformer = { ticker, change };
    }
  });
  
  const totalChange = totalValue - totalInitialValue;
  const totalChangePercent = (totalChange / totalInitialValue) * 100;
  
  document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
  
  const changeElement = document.getElementById('total-change');
  const changeClass = totalChange >= 0 ? 'positive' : 'negative';
  const changeSymbol = totalChange >= 0 ? '+' : '';
  changeElement.textContent = `${changeSymbol}$${totalChange.toFixed(2)} (${changeSymbol}${totalChangePercent.toFixed(2)}%)`;
  changeElement.style.color = totalChange >= 0 ? '#4ade80' : '#f87171';
  
  document.getElementById('best-performer').textContent = 
    `${bestPerformer.ticker} +${bestPerformer.change.toFixed(2)}%`;
  document.getElementById('best-performer').style.color = '#4ade80';
  
  document.getElementById('worst-performer').textContent = 
    `${worstPerformer.ticker} ${worstPerformer.change.toFixed(2)}%`;
  document.getElementById('worst-performer').style.color = '#f87171';
}

// Connect WebSocket
function connectWebSocket() {
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    updateConnectionStatus(true);
    
    ws.send(JSON.stringify({
      type: 'register',
      email: currentUser
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateConnectionStatus(false);
    showAlert('danger', 'Connection Error', 'Lost connection to server');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    updateConnectionStatus(false);
    
    if (currentUser) {
      setTimeout(connectWebSocket, 3000);
    }
  };
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'initial_prices':
      stockPrices = data.prices;
      previousPrices = { ...data.prices };
      initialPrices = { ...data.prices };
      
      // Initialize price history
      Object.keys(data.prices).forEach(ticker => {
        priceHistory[ticker] = [data.prices[ticker]];
      });
      
      renderPortfolio(data.subscriptions);
      updateStatistics(data.subscriptions);
      break;
      
    case 'price_update':
      updateStockPrice(data.ticker, data.price);
      break;
      
    case 'subscription_added':
      stockPrices[data.ticker] = data.price;
      previousPrices[data.ticker] = data.price;
      initialPrices[data.ticker] = data.price;
      priceHistory[data.ticker] = [data.price];
      break;
      
    case 'subscription_removed':
      delete stockPrices[data.ticker];
      delete previousPrices[data.ticker];
      delete initialPrices[data.ticker];
      break;
  }
}

// Update stock price
function updateStockPrice(ticker, newPrice) {
  const stockElement = document.getElementById(`stock-${ticker}`);
  
  if (!stockElement) return;
  
  const oldPrice = stockPrices[ticker] || newPrice;
  previousPrices[ticker] = oldPrice;
  stockPrices[ticker] = newPrice;
  
  // Update price history (keep last 60 data points)
  if (!priceHistory[ticker]) priceHistory[ticker] = [];
  priceHistory[ticker].push(newPrice);
  if (priceHistory[ticker].length > 60) {
    priceHistory[ticker].shift();
  }
  
  // Calculate changes
  const initialPrice = initialPrices[ticker] || newPrice;
  const change = newPrice - oldPrice;
  const sessionChange = newPrice - initialPrice;
  const changePercent = oldPrice ? (change / oldPrice * 100) : 0;
  const sessionChangePercent = initialPrice ? (sessionChange / initialPrice * 100) : 0;
  const changeClass = change >= 0 ? 'positive' : 'negative';
  const changeSymbol = change >= 0 ? '▲' : '▼';
  
  // Update price with animation
  const priceElement = stockElement.querySelector('.stock-price');
  priceElement.textContent = `$${newPrice.toFixed(2)}`;
  priceElement.style.animation = 'none';
  setTimeout(() => {
    priceElement.style.animation = '';
  }, 10);
  
  // Update change
  const changeElement = stockElement.querySelector('.stock-change');
  changeElement.className = `stock-change ${changeClass}`;
  changeElement.textContent = `${changeSymbol} $${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(2)}%)`;
  
  // Update session change
  const updateElement = stockElement.querySelector('.last-update');
  updateElement.textContent = `Session: ${sessionChange >= 0 ? '+' : ''}${sessionChangePercent.toFixed(2)}%`;
  
  // Check for significant changes and show alert
  if (Math.abs(changePercent) > 3) {
    const alertType = changePercent > 0 ? 'success' : 'warning';
    const direction = changePercent > 0 ? 'up' : 'down';
    showAlert(alertType, `${ticker} Alert`, `Price moved ${direction} ${Math.abs(changePercent).toFixed(2)}%!`, 3000);
  }
  
  // Update statistics
  const subscriptions = Array.from(document.querySelectorAll('.stock-item')).map(el => 
    el.id.replace('stock-', '')
  );
  updateStatistics(subscriptions);
  
  // Update chart if it's open and showing this ticker
  if (priceChart && document.getElementById('chart-title').textContent.includes(ticker)) {
    priceChart.data.labels = priceHistory[ticker].map((_, i) => `${i}s`);
    priceChart.data.datasets[0].data = priceHistory[ticker];
    priceChart.update('none'); // Update without animation
  }
}

// Update connection status
function updateConnectionStatus(connected) {
  if (connected) {
    connectionStatus.className = 'connection-status connected';
    connectionStatus.title = 'Connected - Real-time updates active';
  } else {
    connectionStatus.className = 'connection-status disconnected';
    connectionStatus.title = 'Disconnected - Attempting to reconnect...';
  }
}

// Show alert notification
function showAlert(type, title, message, duration = 5000) {
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  
  const icons = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  alert.innerHTML = `
    <div class="alert-icon">${icons[type] || icons.info}</div>
    <div class="alert-content">
      <div class="alert-title">${title}</div>
      <div class="alert-message">${message}</div>
    </div>
  `;
  
  alertContainer.appendChild(alert);
  
  // Auto remove after duration
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 300);
  }, duration);
}

// Initialize app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
