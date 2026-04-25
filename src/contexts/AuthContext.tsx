import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { telegramAuth } from '../services/auth'
import { apiService } from '../services/api'
import { MeUser } from '../types'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: MeUser | null
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
  const [user, setUser] = useState<MeUser | null>(null)
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
      
      // Don't try to refresh - user must click the button to authenticate
      setIsAuthenticated(false)
      setUser(null)
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        setError(null) // Clear error for expired tokens, user needs to login again
      } else {
        setError('Authentication failed. Please try again.')
      }
      return false
    }
  }

  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔑 Login attempt started')
      
      // Always clear any existing token first to force fresh authentication
      // This ensures we don't use stale/invalid tokens
      const existingToken = telegramAuth.getToken()
      if (existingToken) {
        console.log('🗑️ Clearing existing token to force fresh auth')
        telegramAuth.clearToken()
      }
      
      // Always authenticate with Telegram first
      console.log('📞 Calling telegramAuth.auth()...')
      const authResult = await telegramAuth.auth()
      
      if (authResult.success) {
        console.log('✅ Telegram auth successful, fetching user data...')
        // After successful auth, directly fetch user data using the token
        // Don't use checkAuth() here as it might try to refresh if there's an issue
        try {
          const userData = await apiService.checkAuth()
          setIsAuthenticated(true)
          setUser(userData)
          setError(null)
          return true
        } catch (checkError) {
          console.error('❌ Failed to fetch user data after auth:', checkError)
          // Even if checkAuth fails, we have a valid token, so mark as authenticated
          // The user data will be fetched on next check
          setIsAuthenticated(true)
          setError('Authentication successful but failed to load user data. Please refresh.')
          return true
        }
      } else {
        console.error('❌ Telegram auth failed:', authResult.error)
        setError(authResult.error || 'Authentication failed')
        return false
      }
    } catch (error) {
      console.error('❌ Login error:', error)
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
