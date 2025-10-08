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

export const apiService = {
  async getActivityDescription(): Promise<any> {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/user/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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
      const response = await fetch(`${API_BASE_URL}/user/activity`, {
        method: 'PUT',
        headers: {
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
}
