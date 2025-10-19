// API service for external backend communication
import authService from './auth'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'

// Debug environment variables
console.log('🔧 Environment Debug:')
console.log('  - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL)
console.log('  - Final API_BASE_URL:', API_BASE_URL)

export interface TelegramAuthDto {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  auth_date: string
  hash: string
}

export interface ServerAuthResponse {
  message: string,
  token: string,
  user: {
      id: number,
      telegramId: number,
      telegramUsername: string,
      telegramFirstName: string,
      telegramLastName: string,
      authProvider: string,
      isActive: boolean,
      createdAt: string
  }
}

export interface Business {
  id: number
  name: string
  description: string
}

export interface Demand {
  id: number
  categoryId: string
  userId: number
  transcription: string
  translation: string
  summarizedTranslation: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  telegramId: number
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  authProvider: string
  isActive: boolean
  createdAt: string
}

export const apiService = {
  async checkAuth(): Promise<User> {
    const token = authService.getToken()
    console.log('🔑 Checking authorization with token:', token)
    
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

      console.log('📡 Auth check response status:', response.status)
      console.log('📡 Auth check response type:', response.type)

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
      console.log('✅ Authorization check successful:', user)
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
      const response = await fetch(`${API_BASE_URL}/business-client/business/demands`, {
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
}
