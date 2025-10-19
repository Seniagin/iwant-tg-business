# IWant - Telegram Mini App

A Telegram Mini App that allows users to login through their Telegram account, describe their activities, and receive relevant customer requests.

## Features

- **Telegram Authentication**: Seamless login using Telegram WebApp API
- **User Profile Management**: Users can describe their activities and skills
- **Customer Requests System**: View and manage customer requests
- **Request Matching**: Mark requests as matched when you can fulfill them
- **Modern UI**: Beautiful, responsive design that adapts to Telegram's theme

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Telegram WebApp SDK
- Lucide React for icons
- CSS with CSS variables for theming

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iwant-tg-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddRequestModal.tsx
│   ├── LoadingSpinner.tsx
│   └── RequestCard.tsx
├── contexts/           # React contexts for state management
│   ├── UserContext.tsx
│   └── RequestsContext.tsx
├── pages/             # Page components
│   ├── LoginPage/
│   ├── ProfilePage/
│   └── RequestsPage/
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Usage

### For Users

1. **Login**: Open the app and authenticate with your Telegram account
2. **Set Profile**: Describe your activities, skills, or services you provide
3. **View Requests**: Browse available customer requests
4. **Match Requests**: Mark requests as matched when you can fulfill them

### For Developers

The app uses Telegram's WebApp API for authentication and theming. The UI automatically adapts to the user's Telegram theme (light/dark mode).

## Telegram WebApp Integration

This app is designed to run as a Telegram Mini App. To deploy:

1. Build the production version
2. Host the files on a web server
3. Configure the bot with the web app URL in BotFather
4. Set up the webhook to point to your hosted app

## Customization

The app uses CSS variables that automatically adapt to Telegram's theme:
- `--tg-theme-bg-color`: Background color
- `--tg-theme-text-color`: Text color
- `--tg-theme-button-color`: Button color
- `--tg-theme-secondary-bg-color`: Secondary background
- `--tg-theme-hint-color`: Hint/secondary text color

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

ngrok http 3300