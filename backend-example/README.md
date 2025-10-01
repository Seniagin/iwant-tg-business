# IWant Backend API

Backend server for the IWant Telegram Mini App with Telegram WebApp authentication.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp env.example .env
```

3. **Edit `.env` file:**
```
BOT_TOKEN=your_bot_token_from_botfather
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/telegram` - Verify Telegram WebApp authentication
- `GET /api/user/profile` - Get user profile (requires auth token)

### User Management
- `PUT /api/user/activity` - Update user activity description (requires auth token)

### Requests
- `GET /api/requests` - Get all requests (requires auth token)
- `POST /api/requests` - Add new request (requires auth token)
- `PUT /api/requests/:id/match` - Mark request as matched (requires auth token)

### Health
- `GET /api/health` - Health check

## Telegram Authentication Flow

1. Frontend sends `initData` from Telegram WebApp
2. Backend verifies the signature using bot token
3. Backend extracts user data from verified initData
4. Backend creates/updates user in database
5. Backend returns JWT token for future requests

## Database

Uses SQLite with two tables:
- `users` - User profiles and Telegram data
- `requests` - Customer requests

## Security

- Telegram WebApp data signature verification
- JWT token authentication for API endpoints
- CORS enabled for frontend communication
