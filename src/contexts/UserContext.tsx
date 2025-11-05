import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import authService from '../services/auth'
import { apiService } from '../services/api'
import { Business } from '../types'

export interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  activity_description?: string
  is_premium?: boolean
}

interface UserContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  business: Business | null
  businessLoading: boolean
  refreshBusiness: () => Promise<void>
  login: () => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessLoading, setBusinessLoading] = useState(false)

  const login = async () => {
    try {
      setIsLoading(true)
      
      if (authService.isAvailable()) {
        console.log('Attempting Telegram authentication...')
        const authResult = await authService.auth()
        
        if (authResult.success && authResult.user) {
          setIsAuthenticated(true)
          setUser(authResult.user)
          console.log('Telegram authentication successful:', authResult.user)
        } else {
          console.log('Telegram authentication failed:', authResult.error)
          // For demo purposes, create a demo user
          const demoUser: User = {
            id: 12345,
            first_name: 'Demo',
            last_name: 'User',
            username: 'demo_user',
            is_premium: false
          }
          setIsAuthenticated(true)
          setUser(demoUser)
        }
      } else {
        console.log('No Telegram WebApp, using demo mode')
        // For demo purposes, create a demo user
        const demoUser: User = {
          id: 12345,
          first_name: 'Demo',
          last_name: 'User',
          username: 'demo_user',
          is_premium: false
        }
        setIsAuthenticated(true)
        setUser(demoUser)
      }
    } catch (error) {
      console.log('Error during login, using demo mode:', error)
      // For demo purposes, create a demo user
      const demoUser: User = {
        id: 12345,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        is_premium: false
      }
      setIsAuthenticated(true)
      setUser(demoUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.setToken('')
    setIsAuthenticated(false)
    setUser(null)
    setBusiness(null)
  }

  const refreshBusiness = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      setBusinessLoading(true)
      const businessData = await apiService.getBusiness()
      setBusiness(businessData)
    } catch (error) {
      console.error('Failed to load business data:', error)
      // Don't throw, just log the error
    } finally {
      setBusinessLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    console.log('UserProvider useEffect running')
    
    // Check if already authenticated
    if (authService.isAuthenticated()) {
      console.log('User already authenticated')
      setIsAuthenticated(true)
      
      // Try to get user from Telegram WebApp
      const telegramUser = authService.getUser()
      if (telegramUser) {
        setUser(telegramUser)
      } else {
        // Create demo user if no Telegram user
        const demoUser: User = {
          id: 12345,
          first_name: 'Demo',
          last_name: 'User',
          username: 'demo_user',
          is_premium: false
        }
        setUser(demoUser)
      }
      setIsLoading(false)
    } else {
      // Not authenticated, try to login
      login()
    }
  }, [])

  // Fetch business data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      refreshBusiness()
    }
  }, [isAuthenticated, isLoading, refreshBusiness])

  const value = {
    isLoading,
    isAuthenticated,
    user,
    business,
    businessLoading,
    refreshBusiness,
    login,
    logout,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
