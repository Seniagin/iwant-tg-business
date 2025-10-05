# Deployment Guide

## 🚀 Telegram Mini App with External Backend

This is a frontend Telegram Mini App that connects to your external backend API for data persistence and authentication.

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Edit .env.local with your backend URL
# VITE_API_BASE_URL=http://localhost:3001/api

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

**Required:**
- `VITE_API_BASE_URL` - Your external backend API URL

**Example values:**
- Local development: `http://localhost:3001/api`
- Production: `https://your-backend-domain.com/api`

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

## 🚀 GitHub Pages Deployment

The app automatically deploys to GitHub Pages when you push to the `master` branch.

**Setup:**
1. Go to your repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages`
4. Folder: `/ (root)`

**Required GitHub Secret:**
- `VITE_API_BASE_URL` - Your external backend API URL

## 🔄 CI/CD Pipeline

The GitHub Actions will:
- ✅ Run linting on every push
- ✅ Build frontend with environment variables
- ✅ Deploy to GitHub Pages automatically

## 🔗 Backend Integration

This app connects to your external backend for:
- **Telegram Authentication**: Verifies user data with your backend
- **User Profiles**: Stores and retrieves user information
- **Activity Descriptions**: Saves user business descriptions
- **Customer Requests**: Manages request data
- **JWT Tokens**: Secure API authentication

## 🎯 Features

- ✅ **Telegram Authentication**: Real user data from Telegram WebApp
- ✅ **Backend Integration**: Secure API communication
- ✅ **Profile Management**: Users can describe their activities
- ✅ **Request Management**: Add and view customer requests
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **GitHub Pages**: Easy deployment and hosting

## 🐛 Troubleshooting

### Frontend Issues
- Check browser console for API errors
- Verify `VITE_API_BASE_URL` is set correctly
- Ensure your backend is running and accessible

### Backend Issues
- Verify your backend API is running
- Check CORS settings allow your frontend domain
- Test API endpoints directly

### Telegram Issues
- Ensure Mini App URL is accessible
- Check that the bot is properly configured
- Verify the app works in Telegram's WebView

### API Issues
- Check network requests in browser dev tools
- Verify JWT tokens are being sent correctly
- Ensure backend endpoints match frontend expectations
