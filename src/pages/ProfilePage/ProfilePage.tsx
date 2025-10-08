import React, { useState, useEffect } from 'react'
import { telegramAuth } from '../../services/auth'
import { MessageCircle } from 'lucide-react'
import './ProfilePage.css'
import { apiService } from '../../services/api'

interface ProfilePageProps {
  onNavigate: (page: 'login' | 'profile' | 'requests') => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  console.log('ProfilePage rendering')
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    (async () => {
      const activityDescription = await apiService.getActivityDescription()
      setDescription(activityDescription)
    })()
  }, [])

  const handleSaveDescription = () => {
    apiService.updateActivityDescription(description)
    setIsEditing(false)
  }

  const handleViewRequests = () => {
    telegramAuth.hapticFeedback('medium')
    onNavigate('requests')
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
                Click "Edit" to describe what you do and start receiving relevant customer requests.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="actions-section">
        <button
          className="action-button"
          onClick={handleViewRequests}
        >
          <MessageCircle size={24} />
          <span>View Customer Requests</span>
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
