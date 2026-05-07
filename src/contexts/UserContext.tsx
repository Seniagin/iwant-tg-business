import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import authService from '../services/auth'
import { apiService } from '../services/api'
import { Business, type MeUser } from '../types'

/** Current account from `/me` — provider-specific fields (e.g. `telegram*`) are kept as returned by the API. */
export type User = MeUser

interface UserContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  business: Business | null
  businessLoading: boolean
  refreshUser: () => Promise<void>
  /** Refetch business from API. Pass `{ withLoading: false }` to avoid blocking UI (e.g. when opening profile tab). */
  refreshBusiness: (options?: { withLoading?: boolean }) => Promise<void>
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

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return
    }
    try {
      const me = await apiService.checkAuth()
      setUser(me)
    } catch (error) {
      console.error('Failed to load current user (/me):', error)
      throw error
    }
  }, [])

  const login = async () => {
    try {
      setIsLoading(true)

      if (authService.isAvailable()) {
        console.log('Attempting Telegram authentication...')
        const authResult = await authService.auth()

        if (authResult.success && authService.isAuthenticated()) {
          setIsAuthenticated(true)
          try {
            await refreshUser()
            console.log('Telegram authentication successful, /me loaded')
          } catch {
            setUser(null)
          }
        } else {
          console.log('Telegram authentication failed:', authResult.error)
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        console.log('No Telegram WebApp available')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error during login:', error)
      setIsAuthenticated(false)
      setUser(null)
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

  const refreshBusiness = useCallback(
    async (options?: { withLoading?: boolean }) => {
      if (!isAuthenticated) {
        return
      }

      const withLoading = options?.withLoading !== false

      try {
        if (withLoading) {
          setBusinessLoading(true)
        }
        const businessData = await apiService.getBusiness()
        setBusiness(businessData)
      } catch (error) {
        console.error('Failed to load business data:', error)
      } finally {
        if (withLoading) {
          setBusinessLoading(false)
        }
      }
    },
    [isAuthenticated],
  )

  useEffect(() => {
    console.log('UserProvider useEffect running')

    const bootstrap = async () => {
      if (authService.isAuthenticated()) {
        console.log('User already authenticated, loading /me')
        setIsAuthenticated(true)
        try {
          await refreshUser()
        } catch {
          setUser(null)
        }
        setIsLoading(false)
      } else {
        await login()
      }
    }

    void bootstrap()
  }, [])

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
    refreshUser,
    refreshBusiness,
    login,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
