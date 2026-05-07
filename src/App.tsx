import { useEffect, useState } from 'react'
import { telegramAuth } from './services/auth'
import { UserProvider, useUser } from './contexts/UserContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RequestProvider } from './contexts/RequestContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import AllRequestsPage from './pages/AllRequestsPage/AllRequestsPage'
import RequestsWithOffersPage from './pages/RequestsWithOffersPage/RequestsWithOffersPage'
import RequestDetailPage from './pages/RequestDetailPage/RequestDetailPage'
import LoadingSpinner from './components/LoadingSpinner'
import AppMainNav from './components/AppMainNav/AppMainNav'
import './components/AppShell/AppShell.css'
import './App.css'

type AppPage = 'login' | 'all-requests' | 'requests-with-offers' | 'request-detail'
type TabType = 'all-requests' | 'requests-with-offers'

function getInitials(firstName?: string | null, lastName?: string | null, username?: string | null): string {
  const first = firstName?.trim() ?? ''
  const last = lastName?.trim() ?? ''
  if (first && last) return (first[0] + last[0]).toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  if (username) return username.slice(0, 2).toUpperCase()
  return '?'
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const { user } = useUser()
  const [currentPage, setCurrentPage] = useState<AppPage | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const updateURL = (page: AppPage, requestId?: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page)
    if (requestId) {
      url.searchParams.set('request_id', requestId)
    } else {
      url.searchParams.delete('request_id')
    }
    window.history.pushState({}, '', url.toString())
  }

  const navigateToPage = (page: AppPage, requestId?: string) => {
    setCurrentPage(page)
    setSelectedRequestId(requestId ?? null)
    updateURL(page, requestId)
  }

  const navigateToTab = (tab: TabType) => {
    navigateToPage(tab)
  }

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const page = params.get('page') as AppPage | null
      const requestId = params.get('request_id')
      if (page) {
        setCurrentPage(page)
        setSelectedRequestId(requestId || null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    try {
      if (telegramAuth.isAvailable()) {
        const theme = telegramAuth.getTheme()
        if (theme) {
          document.body.style.backgroundColor = theme.background_color
          document.body.style.color = theme.text_color
        }
        const isWindowed = window.innerHeight < window.screen.height * 0.9
        document.body.classList.add(isWindowed ? 'windowed-mode' : 'fullscreen-mode')
      }
    } catch (error) {
      console.log('❌ Error during Telegram initialization:', error)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const params = new URLSearchParams(window.location.search)
      const page = params.get('page')
      const requestId = params.get('request_id')

      if (isAuthenticated) {
        if (page === 'requests-with-offers') {
          navigateToPage('requests-with-offers')
        } else if (page === 'request-detail' && requestId) {
          navigateToPage('request-detail', requestId)
        } else {
          // Requests is the default landing page
          navigateToPage('all-requests')
        }
      } else {
        setCurrentPage('login')
      }
    }
  }, [isAuthenticated, isLoading])

  if (isLoading || currentPage === null) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <LoginPage />
      </div>
    )
  }

  const isRequestDetail = currentPage === 'request-detail'
  const activeTab: TabType = currentPage === 'requests-with-offers' ? 'requests-with-offers' : 'all-requests'
  const userInitials = getInitials(user?.telegramFirstName, user?.telegramLastName, user?.telegramUsername)

  const renderContent = () => {
    switch (currentPage) {
      case 'all-requests':
        return (
          <AllRequestsPage
            onRequestClick={(requestId) => navigateToPage('request-detail', requestId)}
          />
        )
      case 'requests-with-offers':
        return (
          <RequestsWithOffersPage
            onRequestClick={(requestId) => navigateToPage('request-detail', requestId)}
          />
        )
      case 'request-detail':
        return (
          <RequestDetailPage
            requestId={selectedRequestId || undefined}
            onBack={() => navigateToPage('all-requests')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="App">
      <div className="app-shell">
        <AppMainNav
          activeTab={activeTab}
          showTabs={!isRequestDetail}
          onNavigateToTab={navigateToTab}
          onOpenProfile={() => setProfileOpen(true)}
          userInitials={userInitials}
        />
        <main className="app-shell__main">
          {renderContent()}
        </main>
      </div>

      {/* Profile settings — full-screen slide-up sheet */}
      {profileOpen && (
        <div className="profile-sheet-overlay">
          <ProfilePage onClose={() => setProfileOpen(false)} />
        </div>
      )}
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
