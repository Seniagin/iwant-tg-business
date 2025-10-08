import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import { apiService } from '../../services/api'
import { useUser } from '../../contexts/UserContext'

const ProfilePage: React.FC = () => {
  console.log('ProfilePage rendering')
  const { isAuthenticated } = useUser()
  // const [business, setBusiness] = useState<Business | null>(null)
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    (async () => {
      const business = await apiService.getBusiness()
      // setBusiness(business)
      setDescription(business.description)
    })()
  }, [])

  const handleSaveDescription = () => {
    apiService.updateActivityDescription(description)
    setIsEditing(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="header">
        <h1>My Profile</h1>
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
