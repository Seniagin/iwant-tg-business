import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { apiService } from '../services/api'
import { Demand } from '../types'

interface Request {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  distanceKm?: number | null
  offer?: Demand['offer']
  clientContacts?: Demand['clientContacts']
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
    created_at: demand.createdAt,
    updated_at: demand.updatedAt,
    distanceKm: demand.distance ?? null,
    offer: demand.offer,
    clientContacts: demand.clientContacts,
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
      
      await apiService.ignoreDemand(parseInt(requestId))
      
      console.log('✅ Request ignored:', requestId)
    } catch (err) {
      console.error('❌ Error ignoring request:', err)
      throw err
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
