import { useEffect, useState } from 'react'
import { telegramAuth } from './services/auth'
import { UserProvider } from './contexts/UserContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RequestProvider } from './contexts/RequestContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import RequestsPage from './pages/RequestsPage/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage/RequestDetailPage'
import LoadingSpinner from './components/LoadingSpinner'
import DebugPanel from './components/DebugPanel'

type AppPage = 'login' | 'profile' | 'request' | 'request-detail'

function AppContent() {
  const { isAuthenticated, isLoading, error } = useAuth()
  const [currentPage, setCurrentPage] = useState<AppPage | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  // Utility functions for URL management
  const updateURL = (page: AppPage, requestId?: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page)
    
    if (requestId) {
      url.searchParams.set('request_id', requestId)
    } else {
      url.searchParams.delete('request_id')
    }
    
    // Update URL without causing a page reload
    window.history.pushState({}, '', url.toString())
  }

  const navigateToPage = (page: AppPage, requestId?: string) => {
    setCurrentPage(page)
    if (requestId) {
      setSelectedRequestId(requestId)
    }
    updateURL(page, requestId)
  }


  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const page = urlParams.get('page') as AppPage
      const requestId = urlParams.get('request_id')
      
      if (page) {
        setCurrentPage(page)
        if (requestId) {
          setSelectedRequestId(requestId)
        } else {
          setSelectedRequestId(null)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

        // Check if we're in windowed mode and add appropriate CSS class
        const isWindowed = window.innerHeight < window.screen.height * 0.9
        if (isWindowed) {
          document.body.classList.add('windowed-mode')
          console.log('🪟 Running in windowed mode')
        } else {
          document.body.classList.add('fullscreen-mode')
          console.log('📱 Running in fullscreen mode')
        }

        // Main menu button removed - action buttons are now at bottom of request detail page
      }
    } catch (error) {
      console.log('❌ Error during Telegram initialization:', error)
    }
  }, [])

  // Handle URL parameters and page routing when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      const urlParams = new URLSearchParams(window.location.search)
      const page = urlParams.get('page')
      const requestId = urlParams.get('request_id')
      
      console.log('🔗 URL parameters - page:', page, 'request_id:', requestId)

      if (isAuthenticated) {
        // Set initial page based on URL parameter
        if (page === 'request') {
          navigateToPage('request')
        } else if (page === 'request-detail' && requestId) {
          navigateToPage('request-detail', requestId)
        } else {
          navigateToPage('profile')
        }
      } else {
        // Not authenticated, show login
        setCurrentPage('login')
      }
    }
  }, [isAuthenticated, isLoading])

  console.log('App render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'currentPage:', currentPage)

  if (isLoading || currentPage === null) {
    console.log('Rendering LoadingSpinner')
    return <LoadingSpinner />
  }

  const renderCurrentPage = () => {
    if (!isAuthenticated) {
      return <LoginPage />
    }

    switch (currentPage) {
      case 'profile':
        return <ProfilePage />
      case 'request':
        return <RequestsPage onRequestClick={(requestId) => {
          navigateToPage('request-detail', requestId)
        }} />
      case 'request-detail':
        return <RequestDetailPage 
          requestId={selectedRequestId || undefined} 
          onBack={() => navigateToPage('request')} 
        />
      default:
        return <LoginPage />
    }
  }

  console.log('Rendering main app content')
  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <RequestProvider>
          <AppContent />
        </RequestProvider>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
