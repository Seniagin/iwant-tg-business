import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService from '../services/auth'
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
        // Try Telegram authentication
        if (authService.isAvailable()) {
          console.log('Attempting Telegram authentication...')
          const authResult = await authService.auth()
          
          if (authResult.success && authResult.token) {
            console.log('Telegram authentication successful:', authResult.user)
          } else {
            console.log('Telegram authentication failed:', authResult.error)
          }
        } else {
          console.log('No Telegram initData, using demo mode')
        }
      } catch (error) {
        console.log('Error in UserProvider, using demo mode:', error)
      }
      
      setIsLoading(false)
    }

    initUser()
  }, [])

  const value = {
    isLoading,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
