# Deployment Guide

## 🚀 Frontend-Only Telegram Mini App

This is a pure frontend Telegram Mini App that uses localStorage for data persistence. No backend required!

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
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

## 🚀 GitHub Pages Deployment

The app automatically deploys to GitHub Pages when you push to the `master` branch.

**Setup:**
1. Go to your repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages`
4. Folder: `/ (root)`

## 🔄 CI/CD Pipeline

The GitHub Actions will:
- ✅ Run linting on every push
- ✅ Build frontend
- ✅ Deploy to GitHub Pages automatically

## 💾 Data Storage

This app uses localStorage for data persistence:
- **User data**: Stored in `user_data` key
- **Activity description**: Stored in `activity_description` key  
- **Customer requests**: Stored in `customer_requests` key

## 🎯 Features

- ✅ **Telegram Authentication**: Extracts user data from Telegram WebApp
- ✅ **Profile Management**: Users can describe their activities
- ✅ **Request Management**: Add and view customer requests
- ✅ **Local Storage**: All data persists in browser
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **GitHub Pages**: Easy deployment and hosting

## 🐛 Troubleshooting

### Frontend Issues
- Check browser console for errors
- Clear localStorage if data seems corrupted
- Verify the app is accessible at the GitHub Pages URL

### Telegram Issues
- Ensure Mini App URL is accessible
- Check that the bot is properly configured
- Verify the app works in Telegram's WebView

### Data Issues
- Data is stored locally in browser
- Clearing browser data will reset the app
- Each user's data is isolated to their browser
