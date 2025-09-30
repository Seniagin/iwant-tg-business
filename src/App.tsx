import { useEffect, useState } from 'react'
// @ts-ignore
import WebApp from '@twa-dev/sdk'
import { UserProvider } from './contexts/UserContext'
import { RequestsProvider } from './contexts/RequestsContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import RequestsPage from './pages/RequestsPage/RequestsPage'
import LoadingSpinner from './components/LoadingSpinner'

type AppPage = 'login' | 'profile' | 'requests'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('login')

  useEffect(() => {
    console.log('App initializing...')
    
    // Initialize Telegram WebApp
    try {
      WebApp.ready()
      WebApp.expand()
      
      // Check if user is authenticated
      const user = WebApp.initDataUnsafe?.user
      console.log('Telegram user:', user)
      if (user) {
        console.log('Setting authenticated to true (Telegram user)')
        setIsAuthenticated(true)
      } else {
        console.log('Setting authenticated to true (demo mode)')
        // For demo purposes, simulate authentication
        setIsAuthenticated(true)
        setCurrentPage('profile')
      }
    } catch (error) {
      console.log('Not running in Telegram environment, using demo mode', error)
      console.log('Setting authenticated to true (demo mode - catch)')
      // For demo purposes, simulate authentication
      setIsAuthenticated(true)
      setCurrentPage('profile')
    }
    
    console.log('Setting loading to false')
    setIsLoading(false)
    console.log('App initialization complete')
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
          <div style={{ padding: '20px', background: 'red', color: 'white' }}>
            DEBUG: App is rendering! isAuthenticated: {isAuthenticated.toString()}, Page: {currentPage}
          </div>
          {renderCurrentPage()}
        </div>
      </RequestsProvider>
    </UserProvider>
  )
}

export default App
