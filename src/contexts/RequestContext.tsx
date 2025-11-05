import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { apiService, Demand } from '../services/api'

interface Request {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

interface RequestContextType {
  // Current request state
  currentRequest: Request | null
  requestLoading: boolean
  
  // Actions
  loadRequest: (id: string) => Promise<void>
  makeOffer: (data: { demandId: number; price?: number; time?: string; comment?: string }) => Promise<void>
  ignoreRequest: (requestId: string) => Promise<void>
}

const RequestContext = createContext<RequestContextType | undefined>(undefined)

interface RequestProviderProps {
  children: ReactNode
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  // Current request state
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null)
  const [requestLoading, setRequestLoading] = useState(false)

  const transformDemandToRequest = (demand: Demand): Request => ({
    id: demand.id.toString(),
    title: demand.summarizedTranslation || demand.translation || demand.transcription,
    description: demand.translation || demand.transcription,
    status: 'pending' as const, // API doesn't provide status, defaulting to pending
    created_at: demand.createdAt,
    updated_at: demand.updatedAt
  })


  const loadRequest = useCallback(async (id: string): Promise<void> => {
    try {
      setRequestLoading(true)
      
      console.log('📄 Loading request:', id)
      
      if (!id) {
        console.warn('No request ID provided')
        return
      }

      const demand = await apiService.getDemand(parseInt(id))
      const transformedRequest = transformDemandToRequest(demand)
      
      console.log('✅ Loaded request:', transformedRequest)
      setCurrentRequest(transformedRequest)
    } catch (err) {
      console.error('❌ Error loading request:', err)
      // Error handling removed - just log for now
    } finally {
      setRequestLoading(false)
    }
  }, [])

  const makeOffer = useCallback(async (data: { demandId: number; price?: number; time?: string; comment?: string }): Promise<void> => {
    try {
      console.log('💰 Making offer with data:', data)
      
      await apiService.makeOffer(data)
      
      console.log('✅ Offer made successfully')
      
      // You could show a success message or navigate somewhere
      // For now, we'll just log it
    } catch (err) {
      console.error('❌ Error making offer:', err)
      throw err // Re-throw to allow error handling in components
    }
  }, [])

  const ignoreRequest = useCallback(async (requestId: string): Promise<void> => {
    try {
      console.log('🚫 Ignoring request:', requestId)
      
      // TODO: Implement ignore request API call
      // await apiService.ignoreRequest(requestId)
      
      // For now, just log the action
      console.log('✅ Request ignored:', requestId)
      
      // You could show a success message or navigate back to requests list
      // For now, we'll just log it
    } catch (err) {
      console.error('❌ Error ignoring request:', err)
      // Error handling removed - just log for now
    }
  }, [])

  const value: RequestContextType = {
    // Current request state
    currentRequest,
    requestLoading,
    
    // Actions
    loadRequest,
    makeOffer,
    ignoreRequest
  }

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  )
}

export const useRequest = (): RequestContextType => {
  const context = useContext(RequestContext)
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider')
  }
  return context
}

export default RequestContext
