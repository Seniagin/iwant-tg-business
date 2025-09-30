import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// @ts-ignore
import WebApp from '@twa-dev/sdk'

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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initUser = () => {
      const tgUser = WebApp.initDataUnsafe?.user
      if (tgUser) {
        const userData: User = {
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          is_premium: tgUser.is_premium,
          activity_description: localStorage.getItem('activity_description') || ''
        }
        setUser(userData)
      }
      setIsLoading(false)
    }

    initUser()
  }, [])

  const updateActivityDescription = (description: string) => {
    if (user) {
      const updatedUser = { ...user, activity_description: description }
      setUser(updatedUser)
      localStorage.setItem('activity_description', description)
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
