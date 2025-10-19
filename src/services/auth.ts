// Telegram WebApp Authentication Service
// Using native Telegram WebApp API with proper typing and error handling

import { retrieveRawInitData } from "@telegram-apps/sdk"
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface AuthResponse {
  success: boolean
  user?: TelegramUser
  token?: string
  error?: string
}

// Use the existing Telegram WebApp types from @types/telegram-web-app

class AuthService {
  private webApp: any = null
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  public setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  public isAuthenticated(): boolean {
    return !!this.getToken()
  }

  private initialize(): void {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        this.webApp = window.Telegram.WebApp
        this.webApp.ready()
        this.webApp.expand()
        this.isInitialized = true
        console.log('✅ Telegram WebApp initialized successfully')
      } else {
        console.log('⚠️ Telegram WebApp not available, running in demo mode')
      }
    } catch (error) {
      console.error('❌ Failed to initialize Telegram WebApp:', error)
    }
  }

  public async auth(): Promise<AuthResponse> {
    try {
      const initDataRaw = retrieveRawInitData()

      const response = await fetch(`${API_BASE_URL}/business-client/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `tma ${initDataRaw}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend auth failed:', response.status, errorText)
        return {
          success: false,
          error: `HTTP error! status: ${response.status}, message: ${errorText}`
        }
      }

      const authResult:AuthResponse = await response.json()

      if (authResult.success && authResult?.token) {
        this.setToken(authResult.token)
        return {
          success: true,
          user: authResult.user,
          token: authResult.token
        }
      }

      return {
        success: false,
        error: authResult.error || 'Authentication failed'
      }
    } catch (error) {
      console.error('❌ Auth error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  public async refreshAuth(): Promise<AuthResponse> {
    console.log('🔄 Attempting to refresh authentication...')
    
    // Clear existing token
    this.clearToken()
    
    // Try to authenticate again
    return await this.auth()
  }

  public clearToken(): void {
    localStorage.removeItem('auth_token')
    console.log('🗑️ Token cleared')
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.webApp !== null
  }

  public getInitData(): string | null {
    return this.webApp?.initData || null
  }

  public getInitDataUnsafe(): any {
    return this.webApp?.initDataUnsafe || null
  }

  public getUser(): TelegramUser | null {
    return this.webApp?.initDataUnsafe?.user || null
  }

  public getTheme(): any {
    return this.webApp?.themeParams || null
  }

  public getColorScheme(): 'light' | 'dark' | null {
    return this.webApp?.colorScheme || null
  }

  public isExpanded(): boolean {
    return this.webApp?.isExpanded || false
  }

  public expand(): void {
    this.webApp?.expand()
  }

  public close(): void {
    this.webApp?.close()
  }

  public showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      this.webApp?.showAlert(message, resolve)
    })
  }

  public showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.webApp?.showConfirm(message, resolve)
    })
  }

  public hapticFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void {
    this.webApp?.HapticFeedback?.impactOccurred(style)
  }

  public hapticNotification(type: 'error' | 'success' | 'warning'): void {
    this.webApp?.HapticFeedback?.notificationOccurred(type)
  }

  public setMainButton(text: string, onClick: () => void): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text)
      this.webApp.MainButton.onClick(onClick)
      this.webApp.MainButton.show()
    }
  }

  public hideMainButton(): void {
    this.webApp?.MainButton?.hide()
  }

  public setBackButton(onClick: () => void): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.onClick(onClick)
      this.webApp.BackButton.show()
    }
  }

  public hideBackButton(): void {
    this.webApp?.BackButton?.hide()
  }

  public openLink(url: string, options?: { try_instant_view?: boolean }): void {
    this.webApp?.openLink(url, options)
  }

  public openTelegramLink(url: string): void {
    this.webApp?.openTelegramLink(url)
  }

  public sendData(data: string): void {
    this.webApp?.sendData(data)
  }
}

// Export singleton instance
export const telegramAuth = new AuthService()
export default telegramAuth
