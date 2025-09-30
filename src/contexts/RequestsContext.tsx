import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  const addRequest = (requestData: Omit<CustomerRequest, 'id' | 'created_at' | 'is_matched'>) => {
    const newRequest: CustomerRequest = {
      ...requestData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      is_matched: false
    }
    
    const updatedRequests = [...requests, newRequest]
    setRequests(updatedRequests)
    localStorage.setItem('customer_requests', JSON.stringify(updatedRequests))
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
