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

  useEffect(() => {
    console.log('UserProvider useEffect running')
    const initUser = async () => {
      try {
        // Check if we have stored user data
        const storedUserData = localStorage.getItem('user_data')
        if (storedUserData) {
          const user = JSON.parse(storedUserData)
          console.log('Loading stored user:', user)
          setUser(user)
          setIsLoading(false)
          return
        }

        // Try Telegram authentication
        const initData = WebApp.initData
        if (initData) {
          console.log('Attempting Telegram authentication...')
          const authResult = await authService.verifyTelegramAuth(initData)
          
          if (authResult.success && authResult.user) {
            console.log('Telegram authentication successful:', authResult.user)
            const userWithDescription = {
              ...authResult.user,
              activity_description: localStorage.getItem('activity_description') || ''
            }
            setUser(userWithDescription)
            localStorage.setItem('user_data', JSON.stringify(userWithDescription))
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
      localStorage.setItem('user_data', JSON.stringify(demoUser))
    }

    initUser()
  }, [])

  const updateActivityDescription = async (description: string) => {
    if (user) {
      const updatedUser = { ...user, activity_description: description }
      setUser(updatedUser)
      localStorage.setItem('activity_description', description)
      localStorage.setItem('user_data', JSON.stringify(updatedUser))
      
      // Update in localStorage
      try {
        await authService.updateActivityDescription(description)
      } catch (error) {
        console.error('Failed to update activity description:', error)
      }
    }
  }

  const value = {
    user,
    updateActivityDescription,
    isLoading
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
