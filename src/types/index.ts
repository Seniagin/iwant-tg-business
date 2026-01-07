
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
    location?: string; // PostGIS POINT format: "POINT(longitude latitude)"
    address?: string;
}

export interface Demand {
    id: number
    distance?: number
    categoryId: string
    userId: number
    transcription: string
    translation: string
    summarizedTranslation: string
    createdAt: string
    updatedAt: string
    offer?: {
        id: number;
        comment: string;
        price: number;
        time: string;
        isViewed: boolean;
        demandId: number;
        businessId: string;
        createdAt: string;
        updatedAt: string;
        status: string;
    }
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