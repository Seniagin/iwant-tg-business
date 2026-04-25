export interface Business {
  id: number
  name: string
  description: string
  currency: string  
  location?: { latitude: number; longitude: number }
  address?: string
  contacts?: {
    phone?: string
    email?: string
    website?: string
    instagram?: string
  }
}

/** Body for `PUT /business-client/business/contacts` */
export interface BusinessContactsPayload {
  phone?: string
  email?: string
  website?: string
  instagram?: string
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
    id: number
    comment: string
    price: number
    time: string
    isViewed: boolean
    demandId: number
    businessId: string
    createdAt: string
    updatedAt: string
    status: string
  }
}

/**
 * `user` from `GET /business-client/me`.
 * Provider-specific fields use explicit prefixes (`telegram*`, etc.) so other auth providers can add their own without colliding.
 */
export interface MeUser {
  id: number
  email: string | null
  isActive: boolean
  createdAt: string
  telegramId: number
  telegramFirstName: string
  telegramLastName: string
  telegramUsername: string
  telegramLanguageCode?: string
  telegramPhotoUrl?: string | null
}

export interface MeResponse {
  message: string
  user: MeUser
}

/** Alias for auth / API layers that expect a single `User` type */
export type User = MeUser
