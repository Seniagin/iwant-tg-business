// Telegram WebApp Authentication Service
// Using native Telegram WebApp API with proper typing and error handling

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

// Use the existing Telegram WebApp types from @types/telegram-web-app

class TelegramAuthService {
  private webApp: any = null
  private isInitialized = false

  constructor() {
    this.initialize()
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
export const telegramAuth = new TelegramAuthService()
export default telegramAuth
