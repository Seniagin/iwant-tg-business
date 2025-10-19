import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { telegramAuth } from '../services/auth'
import { apiService, User } from '../services/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  checkAuth: () => Promise<boolean>
  login: () => Promise<boolean>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => {
    setError(null)
  }

  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('🔐 Checking authorization...')
      const userData = await apiService.checkAuth()
      console.log('✅ Authorization successful:', userData)
      setIsAuthenticated(true)
      setUser(userData)
      setError(null)
      return true
    } catch (error) {
      console.error('❌ Authorization failed:', error)
      
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        console.log('🔄 Token expired, attempting to refresh...')
        try {
          const refreshResult = await telegramAuth.refreshAuth()
          if (refreshResult.success) {
            console.log('✅ Token refreshed successfully')
            // Try to get user data again after refresh
            const userData = await apiService.checkAuth()
            setIsAuthenticated(true)
            setUser(userData)
            setError(null)
            return true
          } else {
            console.error('❌ Token refresh failed:', refreshResult.error)
            setError('Authentication failed. Please try again.')
            setIsAuthenticated(false)
            setUser(null)
            return false
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError)
          setError('Authentication failed. Please try again.')
          setIsAuthenticated(false)
          setUser(null)
          return false
        }
      } else {
        setError('Authentication failed. Please try again.')
        setIsAuthenticated(false)
        setUser(null)
        return false
      }
    }
  }

  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if we already have a token
      const token = telegramAuth.getToken()
      if (token) {
        // Try to authenticate with existing token
        return await checkAuth()
      } else {
        // No token, need to authenticate
        const authResult = await telegramAuth.auth()
        if (authResult.success) {
          // Try to get user data after successful auth
          return await checkAuth()
        } else {
          setError(authResult.error || 'Authentication failed')
          return false
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Logging out...')
    telegramAuth.clearToken()
    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing authentication...')
      setIsLoading(true)
      
      try {
        // Check if we have a token
        const token = telegramAuth.getToken()
        console.log('👤 Token available:', !!token)
        
        if (token) {
          // Try to authenticate with existing token
          await checkAuth()
        } else {
          // No token, not authenticated
          console.log('⚠️ No token available')
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setError('Authentication initialization failed')
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    error,
    checkAuth,
    login,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
