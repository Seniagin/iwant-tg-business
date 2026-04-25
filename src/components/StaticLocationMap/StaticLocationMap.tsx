import React from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import '../../setupLeafletDefaultIcons'
import './StaticLocationMap.css'

interface StaticLocationMapProps {
  latitude: number
  longitude: number
  className?: string
}

const StaticLocationMap: React.FC<StaticLocationMapProps> = ({
  latitude,
  longitude,
  className = '',
}) => {
  const position: [number, number] = [latitude, longitude]

  return (
    <div className={`static-location-map ${className}`.trim()}>
      <MapContainer
        center={position}
        zoom={14}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={true}
        key={`${latitude.toFixed(5)}-${longitude.toFixed(5)}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  )
}

export default StaticLocationMap
