/**
 * Utility functions for handling PostGIS POINT format
 * Format: "POINT(longitude latitude)"
 */

export interface Location {
  latitude: number
  longitude: number
  address?: string
}

/**
 * Parses a PostGIS POINT string to latitude and longitude
 * @param pointString - Format: "POINT(longitude latitude)"
 * @returns Location object with latitude and longitude, or null if invalid
 */
export function parsePointString(pointString: string | null | undefined): Location | null {
  if (!pointString || typeof pointString !== 'string') {
    return null
  }

  // Remove "POINT(" and ")" and split by space
  const match = pointString.match(/POINT\(([^)]+)\)/)
  if (!match) {
    return null
  }

  const coords = match[1].trim().split(/\s+/)
  if (coords.length !== 2) {
    return null
  }

  const longitude = parseFloat(coords[1])
  const latitude = parseFloat(coords[0])

  if (isNaN(latitude) || isNaN(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

/**
 * Formats latitude and longitude to PostGIS POINT string
 * @param location - Location object with latitude and longitude
 * @returns POINT string in format "POINT(longitude latitude)"
 */
export function formatPointString(location: Location | null): string | null {
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return null
  }

  // Note: PostGIS POINT format is POINT(longitude latitude) - longitude first!
  return `POINT(${location.longitude} ${location.latitude})`
}

