# Stock Broker Client Dashboard

A real-time stock broker dashboard application that enables users to manage stock portfolios with live price updates and multi-user capabilities.

## Demo

- **Local Development**: `http://localhost:3000`
- **Production**: [Add deployment URL]

## Overview

This application provides a web-based stock trading dashboard where users can monitor and manage their stock portfolios in real-time. The system supports multiple concurrent users, each with their own independent subscription lists and portfolio views.

## Key Features

**User Management**
- Email-based authentication system
- Persistent user sessions across browser restarts
- Support for multiple concurrent users with isolated portfolios

**Stock Operations**
- Subscribe/unsubscribe to stocks using ticker symbols
- Supported stocks: GOOG, TSLA, AMZN, META, NVDA
- Real-time price updates delivered via WebSocket connections
- Price changes reflected automatically without page refresh

**Portfolio Management**
- View subscribed stocks with current prices
- Track portfolio value and session performance
- Interactive price history charts
- Price change alerts for significant movements
- Toggle between grid and list view layouts

**User Interface**
- Responsive design for desktop and mobile devices
- Dark/light theme toggle with saved preferences
- Real-time connection status indicator
- Portfolio statistics dashboard

## Technical Stack

**Backend**
- Node.js with Express.js framework
- WebSocket server (ws library) for real-time communication
- File system-based data persistence

**Frontend**
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- WebSocket client for live updates
- LocalStorage for client-side persistence

**Data Layer**
- In-memory data structures for active sessions
- JSON file storage for persistent data
- Browser LocalStorage for session management

## Installation

**Requirements**
- Node.js v18 or higher
- npm package manager

**Setup Steps**

1. Clone the repository:
```bash
git clone <repository-url>
cd Escrow_Stack_Stock_Broker_Client
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Access the application at `http://localhost:3000`

## Usage

**Getting Started**
1. Enter your email address on the login screen
2. Browse available stocks (GOOG, TSLA, AMZN, META, NVDA)
3. Subscribe to stocks you want to track
4. Monitor real-time price updates on your dashboard

**Testing Multi-User Functionality**
1. Open the application in two different browser tabs
2. Log in with different email addresses in each tab
3. Subscribe to different stocks in each session
4. Observe that price updates are independent per user
5. Verify that subscriptions persist after browser restart

## Project Structure

```
Escrow_Stack_Stock_Broker_Client/
├── server.js              # Express server with WebSocket implementation
├── package.json           # Project dependencies and scripts
├── README.md             # Project documentation
├── .gitignore            # Git ignore configuration
├── users-data.json       # User data storage (auto-generated)
└── public/               # Static client files
    ├── index.html        # Main application interface
    ├── styles.css        # Application styles and themes
    └── app.js            # Client-side JavaScript and WebSocket handler
```

## Architecture

The application follows a client-server architecture with real-time communication:

**Client Layer**
- Handles user interface rendering and interactions
- Manages WebSocket connection for real-time updates
- Stores session data in browser LocalStorage
- Implements responsive design patterns

**Server Layer**
- Processes REST API requests for user operations
- Manages WebSocket connections and broadcasts
- Maintains in-memory data structures for active sessions
- Implements file-based persistence for data recovery

**Data Flow**
1. User authentication via REST API
2. WebSocket connection establishment
3. Stock subscription management
4. Real-time price updates via WebSocket broadcast
5. Persistent storage to file system

## API Reference

**REST Endpoints**

| Method | Endpoint | Request Body | Description |
|--------|----------|--------------|-------------|
| POST | `/api/login` | `{ email }` | Authenticate user and return profile |
| POST | `/api/subscribe` | `{ email, ticker }` | Add stock to user's subscriptions |
| POST | `/api/unsubscribe` | `{ email, ticker }` | Remove stock from subscriptions |
| GET | `/api/supported-stocks` | - | Retrieve list of available stocks |

**WebSocket Protocol**

Messages are exchanged in JSON format with the following structure:

Client to Server:
```json
{ "type": "register", "email": "user@example.com" }
```

Server to Client:
```json
{ "type": "price_update", "ticker": "GOOG", "price": 2847.35, "change": 1.24 }
```

## Deployment

**Local Development**
```bash
npm start
```

**Production Deployment**

The application can be deployed on any Node.js hosting platform:

1. Render.com / Railway.app (recommended for free tier)
2. Heroku (requires paid plan)
3. AWS EC2 / DigitalOcean Droplet
4. Google Cloud Platform / Azure

Configuration requirements:
- Node.js runtime environment
- Port configuration (default: 3000)
- File system write permissions for data persistence

## Implementation Notes

**Price Generation**
Stock prices are simulated using a random number generator that produces realistic price fluctuations (±5% per update). In production, this would be replaced with actual market data APIs.

**Authentication**
The current implementation uses email-based authentication without password verification, suitable for demonstration purposes. Production deployment should implement proper authentication mechanisms (OAuth, JWT, etc.).

**Scalability Considerations**
- Current architecture supports 100-200 concurrent WebSocket connections
- For larger scale deployment, consider implementing Redis for session management
- Database migration recommended for persistent storage at scale
- Load balancing and horizontal scaling possible with connection state management

## License

MIT License

## Contact

For questions or feedback regarding this project, please refer to the repository issues section.
