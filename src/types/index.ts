
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
    description: string;
    currency: string;
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