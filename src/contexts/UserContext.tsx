import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// @ts-ignore
import WebApp from '@twa-dev/sdk'
import { authService } from '../services/api'

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
  user: User | null
  updateActivityDescription: (description: string) => void
  isLoading: boolean
  authToken: string | null
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
  console.log('UserProvider rendering')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    console.log('UserProvider useEffect running')
    const initUser = async () => {
      try {
        // Check if we have a stored token
        const storedToken = localStorage.getItem('auth_token')
        if (storedToken) {
          setAuthToken(storedToken)
          // Try to get user profile with stored token
          try {
            const profile = await authService.getUserProfile(storedToken)
            setUser(profile.user)
            setIsLoading(false)
            return
          } catch (error) {
            console.log('Stored token invalid, clearing...')
            localStorage.removeItem('auth_token')
          }
        }

        // Try Telegram authentication
        const initData = WebApp.initData
        if (initData) {
          console.log('Attempting Telegram authentication...')
          const authResult = await authService.verifyTelegramAuth(initData)
          
          if (authResult.success && authResult.user && authResult.token) {
            console.log('Telegram authentication successful:', authResult.user)
            setUser(authResult.user)
            setAuthToken(authResult.token)
            localStorage.setItem('auth_token', authResult.token)
          } else {
            console.log('Telegram authentication failed:', authResult.error)
            // Fall back to demo mode
            setDemoUser()
          }
        } else {
          console.log('No Telegram initData, using demo mode')
          setDemoUser()
        }
      } catch (error) {
        console.log('Error in UserProvider, using demo mode:', error)
        setDemoUser()
      }
      
      setIsLoading(false)
    }

    const setDemoUser = () => {
      const demoUser: User = {
        id: 12345,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        is_premium: false,
        activity_description: localStorage.getItem('activity_description') || ''
      }
      console.log('Setting demo user:', demoUser)
      setUser(demoUser)
    }

    initUser()
  }, [])

  const updateActivityDescription = async (description: string) => {
    if (user) {
      const updatedUser = { ...user, activity_description: description }
      setUser(updatedUser)
      localStorage.setItem('activity_description', description)
      
      // Update on backend if we have a token
      if (authToken) {
        try {
          await authService.updateActivityDescription(authToken, description)
        } catch (error) {
          console.error('Failed to update activity description on backend:', error)
        }
      }
    }
  }

  const value = {
    user,
    updateActivityDescription,
    isLoading,
    authToken
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
