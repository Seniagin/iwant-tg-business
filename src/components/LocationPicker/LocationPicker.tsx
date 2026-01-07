import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LocationPicker.css'

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  latitude: number
  longitude: number
  address?: string
}

interface LocationPickerProps {
  initialLocation?: Location | null
  onLocationSelect: (location: Location | null) => void
  onClose: () => void
}

// Component to handle map clicks and get map instance
function MapClickHandler({ 
  onLocationSelect, 
  onMapReady 
}: { 
  onLocationSelect: (location: Location) => void
  onMapReady: (map: L.Map) => void
}) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect({
        latitude: lat,
        longitude: lng,
      })
    },
  })

  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])

  return null
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([50.4501, 30.5234]) // Default to Kyiv, Ukraine
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [map, setMap] = useState<L.Map | null>(null)

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          if (!initialLocation) {
            setSelectedLocation({
              latitude,
              longitude,
            })
          }
        },
        () => {
          // If geolocation fails, use default center
          if (initialLocation) {
            setMapCenter([initialLocation.latitude, initialLocation.longitude])
          }
        }
      )
    } else if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude])
    }
  }, [initialLocation])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    onLocationSelect(location)
  }

  const handleClear = () => {
    setSelectedLocation(null)
    onLocationSelect(null)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'IWant-TG-Business-App'
          }
        }
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSearchResult = (result: any) => {
    const location: Location = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    }
    setSelectedLocation(location)
    setMapCenter([location.latitude, location.longitude])
    setSearchQuery('')
    setSearchResults([])
    if (map) {
      map.setView([location.latitude, location.longitude], 15)
    }
  }

  const handleSet = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="location-picker-overlay">
      <div className="location-picker-modal">
        <div className="location-picker-header">
          <h3>Select Location</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="location-picker-search">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <p className="search-result-name">{result.display_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="location-picker-map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
              />
            )}
            <MapClickHandler 
              onLocationSelect={handleLocationSelect}
              onMapReady={setMap}
            />
          </MapContainer>
        </div>

        <div className="location-picker-info">
          {selectedLocation ? (
            <div className="location-info">
              <p>
                <strong>Latitude:</strong> {selectedLocation.latitude.toFixed(6)}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedLocation.longitude.toFixed(6)}
              </p>
              {selectedLocation.address && (
                <p>
                  <strong>Address:</strong> {selectedLocation.address}
                </p>
              )}
            </div>
          ) : (
            <p className="location-hint">Click on the map or search to select a location</p>
          )}
        </div>

        <div className="location-picker-actions">
          <button className="btn btn-secondary" onClick={handleClear} disabled={!selectedLocation}>
            Clear
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSet} 
            disabled={!selectedLocation}
            style={{ 
              opacity: selectedLocation ? 1 : 0.5,
              cursor: selectedLocation ? 'pointer' : 'not-allowed'
            }}
          >
            Set Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker

