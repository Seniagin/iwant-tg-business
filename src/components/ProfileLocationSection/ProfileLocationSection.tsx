import React, { useState, useEffect } from 'react'
import './ProfileLocationSection.css'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import { Location } from '../../utils/location'
import LocationPicker from '../LocationPicker/LocationPicker'
import StaticLocationMap from '../StaticLocationMap/StaticLocationMap'

const ProfileLocationSection: React.FC = () => {
  const { business, refreshBusiness } = useUser()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    if (!business) return
    setLocation(
      business.location
        ? {
            latitude: business.location.latitude,
            longitude: business.location.longitude,
          }
        : null,
    )
  }, [business])

  const persistLocation = async (next: Location | null) => {
    try {
      await apiService.updateBusinessLocation(
        next ? { latitude: next.latitude, longitude: next.longitude } : null,
      )
      setLocation(next)
      await refreshBusiness()
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  if (!business) return null

  return (
    <>
      <div className="activity-section profile-location-section">
        <div className="profile-location-section__display">
          {location ? (
            <div className="profile-location-section__body">
              <StaticLocationMap latitude={location.latitude} longitude={location.longitude} />
              {business.address?.trim() ? (
                <p className="profile-location-section__place">{business.address.trim()}</p>
              ) : null}
              <p
                className="profile-location-section__coords"
                title="Exact coordinates stored for your business"
              >
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
              <button
                type="button"
                className="profile-location-section__change-btn"
                onClick={() => setPickerOpen(true)}
              >
                Change location
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="profile-location-section__change-btn"
              onClick={() => setPickerOpen(true)}
            >
              Set location
            </button>
          )}
        </div>
      </div>

      {pickerOpen && (
        <LocationPicker
          initialLocation={location}
          onLocationSelect={persistLocation}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}

export default ProfileLocationSection
