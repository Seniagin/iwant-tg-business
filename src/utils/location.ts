/** Coordinates for map / API payloads. */
export interface Location {
  latitude: number
  longitude: number
  /** Optional human-readable place when provided by the app or API */
  address?: string
}
