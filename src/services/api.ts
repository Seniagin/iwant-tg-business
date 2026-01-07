// API service for external backend communication
import { Business, Demand, User } from '../types'
import authService from './auth'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'

// Debug environment variables
console.log('🔧 Environment Debug:')
console.log('  - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL)
console.log('  - Final API_BASE_URL:', API_BASE_URL)


export const apiService = {
  async checkAuth(): Promise<User> {
    const token = authService.getToken()
    
    if (!token) {
      throw new Error('No token available')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/business-client/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected during auth check - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Auth check failed:', response.status, errorText)
        
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED')
        } else if (response.status === 403) {
          throw new Error('FORBIDDEN')
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
      }

      const user = await response.json()
      return user
    } catch (error) {
      console.error('Failed to check authorization:', error)
      throw error
    }
  },

  async getBusiness(): Promise<Business> {
    const token = authService.getToken();
    console.log('🔑 Token for business request:', token)
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      console.log('📡 Business API response status:', response.status)
      console.log('📡 Business API response type:', response.type)

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Business API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get business:', error)
      throw error
    }
  },

  async getActivityDescription(): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/user/activity`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Activity API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get activity description:', error)
      throw error
    }
  },

  async updateActivityDescription(description: string): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
        redirect: 'manual', // Prevent automatic redirects
      })

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Update API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update activity description:', error)
      throw error
    }
  },

  async getDemands(): Promise<Demand[]> {
    const token = authService.getToken()
    console.log('🔑 Token for demands request:', token)
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/demands/without-my-offers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      console.log('📡 Demands API response status:', response.status)
      console.log('📡 Demands API response type:', response.type)

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Demands API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get demands:', error)
      throw error
    }
  },

  async getDemandsWithOffers(): Promise<Demand[]> {
    const token = authService.getToken()
    console.log('🔑 Token for demands with offers request:', token)
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/demands/with-my-offers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      console.log('📡 Demands with offers API response status:', response.status)
      console.log('📡 Demands with offers API response type:', response.type)

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Demands with offers API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get demands with offers:', error)
      throw error
    }
  },

  async getDemand(id: number): Promise<Demand> {
    const token = authService.getToken()
    console.log('🔑 Token for demand request:', token, 'ID:', id)
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/demand/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      console.log('📡 Demand API response status:', response.status)
      console.log('📡 Demand API response type:', response.type)

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Demand API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get demand:', error)
      throw error
    }
  },

  async makeOffer(data: { demandId: number; price?: number; time?: string; comment?: string }): Promise<any> {
    const token = authService.getToken()
    console.log('🔑 Token for make offer request:', token)
    console.log('💰 Making offer with data:', data)
    
    if (!token) {
      throw new Error('Authentication required. Please log in.')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/offer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        redirect: 'manual', // Prevent automatic redirects
      })

      console.log('📡 Make offer API response status:', response.status)
      console.log('📡 Make offer API response type:', response.type)

      // Handle redirects manually
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
        console.error('🚫 Redirect detected - likely authentication issue')
        throw new Error('Authentication required - redirect detected')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Make offer API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Offer made successfully:', result)
      return result
    } catch (error) {
      console.error('Failed to make offer:', error)
      throw error
    }
  },

  async getAvailableCurrenciesList(): Promise<string[]> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/manage/currencies/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Prevent automatic redirects
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to get available currencies list:', error)
      throw error
    }
  },

  async updateBusinessCurrency(currency: string): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/manage/currency/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency }),
        redirect: 'manual', // Prevent automatic redirects
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Update business currency API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update business currency:', error)
      throw error
    }
  },

  async ignoreDemand(id: number): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/demand/ignore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demandId: id }),
        redirect: 'manual', // Prevent automatic redirects
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Ignore demand API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

    } catch (error) {
      console.error('Failed to ignore demand:', error)
      throw error
    }
  },

  async updateBusinessLocation(location: string | null, address?: string): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/business-client/business/location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location ? {
          location: location, // PostGIS POINT format: "POINT(longitude latitude)"
          address: address,
        } : null),
        redirect: 'manual', // Prevent automatic redirects
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Update business location API error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update business location:', error)
      throw error
    }
  }
}
