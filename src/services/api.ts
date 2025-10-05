// Local storage service for frontend-only Telegram Mini App
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  is_premium?: boolean
}

export interface AuthResponse {
  success: boolean
  user?: TelegramUser
  error?: string
}

export const authService = {
  // Simulate Telegram auth verification (frontend-only)
  async verifyTelegramAuth(initData: string): Promise<AuthResponse> {
    try {
      // In a real app, you would verify the initData signature
      // For frontend-only, we'll extract user data directly
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      
      if (userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        return {
          success: true,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            is_premium: user.is_premium
          }
        };
      }
      
      return {
        success: false,
        error: 'No user data found in initData'
      };
    } catch (error) {
      console.error('Telegram auth verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Get user profile from localStorage
  async getUserProfile(): Promise<any> {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        return { success: true, user: JSON.parse(userData) };
      }
      return { success: false, error: 'No user data found' };
    } catch (error) {
      console.error('Failed to get user profile:', error)
      throw error
    }
  },

  // Update user activity description in localStorage
  async updateActivityDescription(description: string): Promise<any> {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        user.activity_description = description;
        localStorage.setItem('user_data', JSON.stringify(user));
        return { success: true, message: 'Activity description updated' };
      }
      return { success: false, error: 'No user data found' };
    } catch (error) {
      console.error('Failed to update activity description:', error)
      throw error
    }
  },

  // Get customer requests from localStorage
  async getRequests(): Promise<any> {
    try {
      const requests = localStorage.getItem('customer_requests');
      if (requests) {
        return { success: true, requests: JSON.parse(requests) };
      }
      return { success: true, requests: [] };
    } catch (error) {
      console.error('Failed to get requests:', error)
      throw error
    }
  },

  // Add new request to localStorage
  async addRequest(requestData: any): Promise<any> {
    try {
      const requests = JSON.parse(localStorage.getItem('customer_requests') || '[]');
      const newRequest = {
        ...requestData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        is_matched: false
      };
      requests.push(newRequest);
      localStorage.setItem('customer_requests', JSON.stringify(requests));
      return { success: true, requestId: newRequest.id, message: 'Request added successfully' };
    } catch (error) {
      console.error('Failed to add request:', error)
      throw error
    }
  }
}
