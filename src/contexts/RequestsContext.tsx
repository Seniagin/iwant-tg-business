import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/api'
import { useUser } from './UserContext'

export interface CustomerRequest {
  id: string
  title: string
  description: string
  category: string
  budget?: string
  location?: string
  contact_info: string
  created_at: string
  is_matched: boolean
  user_id: number
}

interface RequestsContextType {
  requests: CustomerRequest[]
  matchedRequests: CustomerRequest[]
  addRequest: (request: Omit<CustomerRequest, 'id' | 'created_at' | 'is_matched'>) => void
  markAsMatched: (requestId: string) => void
  isLoading: boolean
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined)

export const useRequests = () => {
  const context = useContext(RequestsContext)
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider')
  }
  return context
}

interface RequestsProviderProps {
  children: ReactNode
}

export const RequestsProvider: React.FC<RequestsProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load requests from localStorage
    const savedRequests = localStorage.getItem('customer_requests')
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests))
      } catch (error) {
        console.error('Error loading requests:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const addRequest = async (requestData: Omit<CustomerRequest, 'id' | 'created_at' | 'is_matched'>) => {
    try {
      // Get auth token from UserContext
      const { authToken } = useUser()
      
      if (authToken) {
        const result = await authService.addRequest(authToken, requestData)
        if (result.success) {
          // Reload requests from backend
          const requestsResult = await authService.getRequests(authToken)
          if (requestsResult.success) {
            setRequests(requestsResult.requests)
          }
        }
      } else {
        console.error('No auth token available')
      }
    } catch (error) {
      console.error('Failed to add request:', error)
    }
  }

  const markAsMatched = (requestId: string) => {
    const updatedRequests = requests.map(request =>
      request.id === requestId ? { ...request, is_matched: true } : request
    )
    setRequests(updatedRequests)
    localStorage.setItem('customer_requests', JSON.stringify(updatedRequests))
  }

  const matchedRequests = requests.filter(request => request.is_matched)

  const value = {
    requests,
    matchedRequests,
    addRequest,
    markAsMatched,
    isLoading
  }

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  )
}
