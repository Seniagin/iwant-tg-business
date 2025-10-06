// API service for external backend communication
import { telegramAuth, TelegramUser } from './telegramAuth'
import { retrieveRawInitData } from '@telegram-apps/sdk'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Debug environment variables
console.log('🔧 Environment Debug:')
console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('  - Final API_BASE_URL:', API_BASE_URL)

// TelegramUser interface is now imported from telegramAuth.ts

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

export interface AuthResponse {
  success: boolean
  user?: TelegramUser
  token?: string
  error?: string
}

export const authService = {
  // Send Telegram user data to backend for authentication
  async verifyTelegramAuth(): Promise<AuthResponse> {
    try {
      // Check if Telegram WebApp is available
      if (!telegramAuth.isAvailable()) {
        console.log('⚠️ Telegram WebApp not available, using demo mode')
        return {
          success: false,
          error: 'Telegram WebApp not available'
        }
      }

      // Get initData from Telegram WebApp
      const initData = telegramAuth.getInitData()
      if (!initData) {
        return {
          success: false,
          error: 'No initData available from Telegram'
        }
      }

      // Extract user data from initData
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      
      if (!userParam || !authDate || !hash) {
        return {
          success: false,
          error: 'Missing required Telegram data'
        };
      }

      const user = JSON.parse(decodeURIComponent(userParam));
      
      // Prepare data according to your DTO
      const telegramAuthData: TelegramAuthDto = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        photo_url: user.photo_url,
        auth_date: authDate,
        hash: hash
      };

      console.log('🔐 Sending auth data to backend:', telegramAuthData)
      const initDataRaw = retrieveRawInitData()

      const response = await fetch(`${API_BASE_URL}/business-client/telegram-auth-sdk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `tma ${initDataRaw}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend auth failed:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Backend auth successful:', result)
      
      // Transform backend response to match frontend expectations
      return {
        success: true,
        user: {
          id: result.user?.id || user.id,
          first_name: result.user?.first_name || user.first_name,
          last_name: result.user?.last_name || user.last_name,
          username: result.user?.username || user.username,
          photo_url: result.user?.photo_url || user.photo_url,
          is_premium: result.user?.is_premium || user.is_premium
        },
        token: result.token
      }
    } catch (error) {
      console.error('❌ Telegram auth verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Get user profile
  async getUserProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get user profile:', error)
      throw error
    }
  },

  // Update user activity description
  async updateActivityDescription(token: string, description: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update activity description:', error)
      throw error
    }
  },

  // Get customer requests
  async getRequests(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get requests:', error)
      throw error
    }
  },

  // Add new request
  async addRequest(token: string, requestData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to add request:', error)
      throw error
    }
  }
}
