import { useEffect, useState } from 'react'
// @ts-ignore
import WebApp from '@twa-dev/sdk'
import { UserProvider } from './contexts/UserContext'
import { RequestsProvider } from './contexts/RequestsContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import RequestsPage from './pages/RequestsPage/RequestsPage'
import LoadingSpinner from './components/LoadingSpinner'
import DebugPanel from './components/DebugPanel'

type AppPage = 'login' | 'profile' | 'requests'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('login')
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    console.log('🚀 App initializing...')
    console.log('🌐 User Agent:', navigator.userAgent)
    console.log('📱 Is Telegram WebApp:', !!window.Telegram?.WebApp)

    // Initialize Telegram WebApp
    try {
      WebApp.ready()
      WebApp.expand()

      // Set Telegram theme
      // @ts-ignore
      document.body.style.backgroundColor = WebApp.backgroundColor
      // @ts-ignore
      document.body.style.color = WebApp.textColor || '#000000'

      // Configure main menu button
      WebApp.MainButton.setText('View Requests')
      WebApp.MainButton.show()
      WebApp.MainButton.onClick(() => {
        console.log('📱 Main button clicked')
        setCurrentPage('requests')
      })

      // Debug Telegram data
      console.log('📊 Telegram initData:', WebApp.initData)
      console.log('👤 Telegram initDataUnsafe:', WebApp.initDataUnsafe)
      console.log('🎨 Telegram theme:', {
        backgroundColor: WebApp.backgroundColor,
        // @ts-ignore
        textColor: WebApp.textColor,
        themeParams: WebApp.themeParams
      })

      // Check if user is authenticated
      const user = WebApp.initDataUnsafe?.user
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
    } catch (error) {
      console.log('❌ Not running in Telegram environment, using demo mode', error)
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
        return <ProfilePage onNavigate={setCurrentPage} />
      case 'requests':
        return <RequestsPage onNavigate={setCurrentPage} />
      default:
        return <LoginPage onLogin={() => setCurrentPage('profile')} />
    }
  }

  console.log('Rendering main app content')
  return (
    <UserProvider>
      <RequestsProvider>
        <div className="App">
          {renderCurrentPage()}
          
          {/* Debug Panel Toggle - Only show in development */}
          {import.meta.env.DEV && (
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
      </RequestsProvider>
    </UserProvider>
  )
}

export default App
