// API service for external backend communication
import { Business, BusinessContactsPayload, Demand, MeResponse, MeUser } from '../types'
import authService from './auth'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'

console.log('🔧 Environment Debug:')
console.log('  - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL)
console.log('  - Final API_BASE_URL:', API_BASE_URL)

type ApiRequestOptions = {
  method?: string
  body?: unknown
  /** Defaults to current auth token */
  token?: string | null
  /** Log tag for errors (e.g. "Business API") */
  errorLabel: string
  /** Map 401 → UNAUTHORIZED, 403 → FORBIDDEN (for /me-style checks) */
  mapAuthStatuses?: boolean
  /** Throw if token is missing (before fetch) */
  requireToken?: boolean
  /** Message when `requireToken` and token is missing */
  noTokenMessage?: string
}

function bearerHeaders(token: string | null): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function ensureResponseOk(
  response: Response,
  errorLabel: string,
  mapAuthStatuses?: boolean,
): Promise<void> {
  if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 304) {
    console.error('🚫 Redirect detected - likely authentication issue')
    throw new Error('Authentication required - redirect detected')
  }

  if (response.ok) return

  const errorText = await response.text()
  console.error(`❌ ${errorLabel}:`, response.status, errorText)

  if (mapAuthStatuses) {
    if (response.status === 401) throw new Error('UNAUTHORIZED')
    if (response.status === 403) throw new Error('FORBIDDEN')
  }

  throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
}

async function apiRequest(path: string, options: ApiRequestOptions): Promise<Response> {
  const token = options.token !== undefined ? options.token : authService.getToken()

  if (options.requireToken && !token) {
    throw new Error(options.errorLabel.includes('offer') ? 'Authentication required. Please log in.' : 'No token available')
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: bearerHeaders(token),
    redirect: 'manual',
  }

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }

  return fetch(`${API_BASE_URL}${path}`, init)
}

async function apiJson<T>(path: string, options: ApiRequestOptions): Promise<T> {
  const response = await apiRequest(path, options)
  await ensureResponseOk(response, options.errorLabel, options.mapAuthStatuses)
  return (await response.json()) as T
}

/** For endpoints that may return an empty body on success */
async function apiJsonOrEmpty<T>(path: string, options: ApiRequestOptions): Promise<T | undefined> {
  const response = await apiRequest(path, options)
  await ensureResponseOk(response, options.errorLabel, options.mapAuthStatuses)
  const text = await response.text()
  if (!text.trim()) return undefined
  return JSON.parse(text) as T
}

export const apiService = {
  async checkAuth(): Promise<MeUser> {
    const response = await apiRequest('/business-client/me', {
      errorLabel: 'Auth check (/me)',
      mapAuthStatuses: true,
      requireToken: true,
    })
    await ensureResponseOk(response, 'Auth check (/me)', true)
    const data: MeResponse | MeUser = await response.json()
    return 'user' in data && data.user ? data.user : (data as MeUser)
  },

  async getBusiness(): Promise<Business> {
    return apiJson<Business>('/business-client/business', { errorLabel: 'Business API' })
  },

  async getActivityDescription(): Promise<any> {
    return apiJson('/user/activity', { errorLabel: 'Activity API' })
  },

  async updateActivityDescription(description: string): Promise<any> {
    return apiJson('/business-client/business', {
      method: 'PUT',
      body: { description },
      errorLabel: 'Update activity description',
    })
  },

  async updateBusinessName(name: string): Promise<any> {
    return apiJson('/business-client/business', {
      method: 'PUT',
      body: { name },
      errorLabel: 'Update business name',
    })
  },

  async updateBusinessContacts(payload: BusinessContactsPayload): Promise<unknown> {
    return apiJson('/business-client/business/contacts', {
      method: 'PUT',
      body: payload,
      errorLabel: 'Update business contacts',
    })
  },

  async getDemands(): Promise<Demand[]> {
    return apiJson<Demand[]>('/business-client/business/demands/without-my-offers', {
      errorLabel: 'Demands API',
    })
  },

  async getDemandsWithOffers(): Promise<Demand[]> {
    return apiJson<Demand[]>('/business-client/business/demands/with-my-offers', {
      errorLabel: 'Demands with offers API',
    })
  },

  async getDemand(id: number): Promise<Demand> {
    return apiJson<Demand>(`/business-client/business/demand/${id}`, {
      errorLabel: 'Demand API',
    })
  },

  async makeOffer(data: { demandId: number; price?: number; time?: string; comment?: string }): Promise<any> {
    return apiJson('/business-client/business/offer', {
      method: 'POST',
      body: data,
      errorLabel: 'Make offer API',
      requireToken: true,
      noTokenMessage: 'Authentication required. Please log in.',
    })
  },

  async getAvailableCurrenciesList(): Promise<string[]> {
    return apiJson<string[]>('/business-client/manage/currencies/list', {
      errorLabel: 'Currencies list API',
    })
  },

  async updateBusinessCurrency(currency: string): Promise<any> {
    return apiJson('/business-client/manage/currency/set-default', {
      method: 'POST',
      body: { currency },
      errorLabel: 'Update business currency API',
    })
  },

  async ignoreDemand(id: number, reason?: string | null): Promise<any> {
    return apiJsonOrEmpty('/business-client/business/demand/ignore', {
      method: 'POST',
      body: { demandId: id, reason: reason ?? null },
      errorLabel: 'Ignore demand API',
    })
  },

  async updateBusinessLocation(
    location: { latitude: number; longitude: number } | null,
    address?: string,
  ): Promise<any> {
    return apiJson('/business-client/business/location', {
      method: 'PUT',
      body: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address,
          }
        : null,
      errorLabel: 'Update business location API',
    })
  },

  async updateLanguage(languageCode: string): Promise<void> {
    const response = await apiRequest('/business-client/language', {
      method: 'PATCH',
      body: { languageCode },
      errorLabel: 'Update language API',
    })
    await ensureResponseOk(response, 'Update language API')
  },
}
