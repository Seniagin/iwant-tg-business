import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import { apiService } from '../../services/api'
import { useUser } from '../../contexts/UserContext'

const ProfilePage: React.FC = () => {
  console.log('ProfilePage rendering')
  const { isAuthenticated, user, isLoading } = useUser()
  // const [business, setBusiness] = useState<Business | null>(null)
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const business = await apiService.getBusiness()
        // setBusiness(business)
        setDescription(business.description)
      } catch (error) {
        console.error('Failed to load business data:', error)
        // Set a default description if API fails
        setDescription(user?.activity_description || '')
      }
    })()
  }, [user])

  const handleSaveDescription = () => {
    apiService.updateActivityDescription(description)
    setIsEditing(false)
  }

  if (isLoading) {
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

    </div>
  )
}

export default ProfilePage
