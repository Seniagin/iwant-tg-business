import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// @ts-ignore
import WebApp from '@twa-dev/sdk'
import { UserProvider } from './contexts/UserContext'
import { RequestsProvider } from './contexts/RequestsContext'
import LoginPage from './pages/LoginPage/LoginPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import RequestsPage from './pages/RequestsPage/RequestsPage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
      }
    } catch (error) {
      console.log('Not running in Telegram environment, using demo mode', error)
      console.log('Setting authenticated to true (demo mode - catch)')
      // For demo purposes, simulate authentication
      setIsAuthenticated(true)
    }
    
    console.log('Setting loading to false')
    setIsLoading(false)
    console.log('App initialization complete')
  }, [])

  console.log('App render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

  if (isLoading) {
    console.log('Rendering LoadingSpinner')
    return <LoadingSpinner />
  }

  console.log('Rendering main app content')
  return (
    <UserProvider>
      <RequestsProvider>
        <Router>
          <div className="App">
            <div style={{ padding: '20px', background: 'red', color: 'white' }}>
              DEBUG: App is rendering! isAuthenticated: {isAuthenticated.toString()}
            </div>
            <Routes>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/profile" /> : <LoginPage />} 
              />
              <Route 
                path="/profile" 
                element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/requests" 
                element={isAuthenticated ? <RequestsPage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} 
              />
            </Routes>
          </div>
        </Router>
      </RequestsProvider>
    </UserProvider>
  )
}

export default App
