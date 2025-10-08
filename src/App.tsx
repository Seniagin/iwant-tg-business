import { useEffect, useState } from 'react'
import { telegramAuth } from './services/auth'
import { UserProvider } from './contexts/UserContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import LoadingSpinner from './components/LoadingSpinner'
import DebugPanel from './components/DebugPanel'

type AppPage = 'login' | 'profile'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('login')
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    console.log('🚀 App initializing...')
    console.log('🌐 User Agent:', navigator.userAgent)
    console.log('📱 Is Telegram WebApp available:', telegramAuth.isAvailable())

    // Initialize Telegram WebApp
    try {
      if (telegramAuth.isAvailable()) {
        // Set Telegram theme
        const theme = telegramAuth.getTheme()
        if (theme) {
          document.body.style.backgroundColor = theme.background_color
          document.body.style.color = theme.text_color
        }

        // Configure main menu button
        telegramAuth.setMainButton('View Profile', () => {
          console.log('📱 Main button clicked')
          setCurrentPage('profile')
        })

        // Check if user is authenticated
        const user = telegramAuth.getToken()
        console.log('👤 Telegram user:', user)
        if (user) {
          console.log('✅ Setting authenticated to true (Telegram user)')
          setIsAuthenticated(true)
          setCurrentPage('profile')
        } else {
          console.log('⚠️ Setting authenticated to true (demo mode)')
          // For demo purposes, simulate authentication
          setIsAuthenticated(true)
          setCurrentPage('profile')
        }
      } else {
        console.log('❌ Not running in Telegram environment, using demo mode')
        console.log('⚠️ Setting authenticated to true (demo mode - catch)')
        // For demo purposes, simulate authentication
        setIsAuthenticated(true)
        setCurrentPage('profile')
      }
    } catch (error) {
      console.log('❌ Error during initialization, using demo mode', error)
      console.log('⚠️ Setting authenticated to true (demo mode - catch)')
      // For demo purposes, simulate authentication
      setIsAuthenticated(true)
      setCurrentPage('profile')
    }

    console.log('✅ Setting loading to false')
    setIsLoading(false)
    console.log('🎉 App initialization complete')
  }, [])

  console.log('App render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'currentPage:', currentPage)

  if (isLoading) {
    console.log('Rendering LoadingSpinner')
    return <LoadingSpinner />
  }

  const renderCurrentPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLogin={() => setCurrentPage('profile')} />
    }

    switch (currentPage) {
      case 'profile':
        return <ProfilePage />
      default:
        return <LoginPage onLogin={() => setCurrentPage('profile')} />
    }
  }

  console.log('Rendering main app content')
  return (
    <UserProvider>
      <div className="App">
        {renderCurrentPage()}
        
        {/* Debug Panel Toggle - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              zIndex: 1000,
              fontSize: '20px'
            }}
          >
            🐛
          </button>
        )}
        
        <DebugPanel isVisible={showDebug} onClose={() => setShowDebug(false)} />
      </div>
    </UserProvider>
  )
}

export default App
