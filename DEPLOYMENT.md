# Deployment Guide

## 🚀 GitHub Actions Setup

### 1. Frontend Deployment (GitHub Pages)

The frontend automatically deploys to GitHub Pages when you push to the `master` branch.

**Required GitHub Secrets:**
- `VITE_API_BASE_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)

**Setup:**
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-domain.com/api`

### 2. Backend Deployment (Railway)

**Required GitHub Secrets:**
- `RAILWAY_TOKEN` - Your Railway authentication token

**Setup:**
1. Go to [Railway](https://railway.app) and create an account
2. Create a new project
3. Go to your project → Settings → Tokens
4. Generate a new token
5. Add to GitHub Secrets:
   - Name: `RAILWAY_TOKEN`
   - Value: `your_railway_token`

**Backend Environment Variables (set in Railway dashboard):**
- `BOT_TOKEN` - Your Telegram bot token
- `JWT_SECRET` - A strong random string
- `PORT` - Railway will set this automatically

### 3. Alternative Backend Deployments

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create iwant-backend

# Set environment variables
heroku config:set BOT_TOKEN=your_bot_token
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git subtree push --prefix=backend heroku main
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set run command: `cd backend && npm start`
4. Add environment variables in the dashboard

## 🔧 Local Development

### Frontend
```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Edit .env.local with your settings
# VITE_API_BASE_URL=http://localhost:3001/api

# Start development server
npm run dev
```

### Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your settings
# BOT_TOKEN=your_bot_token_from_botfather
# JWT_SECRET=your_super_secret_jwt_key_here

# Start development server
npm run dev
```

## 📱 Telegram Bot Setup

1. **Create Bot:**
   - Message [@BotFather](https://t.me/BotFather)
   - Send `/newbot`
   - Choose name and username
   - Save the bot token

2. **Configure Mini App:**
   ```
   /setmenubutton
   @your_bot_username
   Open IWant App
   https://seniagin.github.io/iwant-tg-business
   ```

3. **Set Environment Variables:**
   - Add `BOT_TOKEN` to your backend environment
   - Update `VITE_API_BASE_URL` to point to your deployed backend

## 🔄 CI/CD Pipeline

The GitHub Actions will:
- ✅ Run tests and linting on every push
- ✅ Build frontend with correct environment variables
- ✅ Deploy frontend to GitHub Pages
- ✅ Deploy backend to Railway (when backend files change)

## 🐛 Troubleshooting

### Frontend Issues
- Check that `VITE_API_BASE_URL` is set correctly
- Verify the backend is running and accessible
- Check browser console for API errors

### Backend Issues
- Verify `BOT_TOKEN` is set correctly
- Check Railway logs for errors
- Test the health endpoint: `https://your-backend.railway.app/api/health`

### Telegram Issues
- Ensure bot token is correct
- Verify Mini App URL is accessible
- Check that backend can verify Telegram signatures
