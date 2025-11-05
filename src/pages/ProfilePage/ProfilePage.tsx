import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import { apiService } from '../../services/api'
import { useUser } from '../../contexts/UserContext'

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user, isLoading, business, businessLoading, refreshBusiness } = useUser()
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [currency, setCurrency] = useState('')
  const [currencies, setCurrencies] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      try {
        const currenciesList = await apiService.getAvailableCurrenciesList()
        setCurrencies(currenciesList)
      } catch (error) {
        console.error('Failed to load currencies list:', error)
      }
    })()
  }, [])

  useEffect(() => {
    if (business) {
      setDescription(business.description)
      setCurrency(business.currency)
    }
  }, [business])

  const handleSaveDescription = () => {
    apiService.updateActivityDescription(description)
    setIsEditing(false)
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await apiService.updateBusinessCurrency(newCurrency)
      setCurrency(newCurrency)
      // Refresh business data to get updated currency
      await refreshBusiness()
    } catch (error) {
      console.error('Failed to update currency:', error)
      // Optionally show error message to user
    }
  }

  if (isLoading || businessLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="loading">Please log in to view your profile.</div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="header">
        <h1>My Profile</h1>
        {user && (
          <div className="user-info">
            <p>Welcome, {user.first_name} {user.last_name}</p>
            {user.username && <p>@{user.username}</p>}
          </div>
        )}
      </div>

      <div className="activity-section">
        <div className="section-header">
          <h3>What do you do?</h3>
          <button
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="edit-form">
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your activities, skills, or services you provide..."
              rows={6}
            />
            <button
              className="btn btn-primary save-button"
              onClick={handleSaveDescription}
            >
              Save Description
            </button>
          </div>
        ) : (
          <div className="description-display">
            {description ? (
              <p>{description}</p>
            ) : (
              <p className="placeholder-text">
                Click "Edit" to describe what you do.
              </p>
            )}
          </div>
        )}
      </div>

      {business && (
        <div className="activity-section">
          <div className="section-header">
            <h3>Default Currency</h3>
          </div>
          <div className="currency-select-container">
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {currencies.length === 0 ? (
                <option value="">Loading currencies...</option>
              ) : (
                currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProfilePage
