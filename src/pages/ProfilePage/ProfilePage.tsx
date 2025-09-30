import React, { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'
import { MessageCircle } from 'lucide-react'
import './ProfilePage.css'

interface ProfilePageProps {
  onNavigate: (page: 'login' | 'profile' | 'requests') => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  console.log('ProfilePage rendering')
  const { user, updateActivityDescription } = useUser()
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user?.activity_description) {
      setDescription(user.activity_description)
    }
  }, [user])

  const handleSaveDescription = () => {
    updateActivityDescription(description)
    setIsEditing(false)
  }

  const handleViewRequests = () => {
    // @ts-ignore
    if (window.Telegram?.WebApp?.HapticFeedback) {
      // @ts-ignore
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    }
    onNavigate('requests')
  }

  if (!user) {
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

      <div className="profile-content">
        <div className="user-card">
          <div className="user-avatar">
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt="User Avatar"
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.first_name[0]}
              </div>
            )}
          </div>
          <div className="user-info">
            <h2>{user.first_name} {user.last_name}</h2>
            <p>@{user.username || 'username'}</p>
            {user.is_premium && (
              <span className="premium-badge">Premium</span>
            )}
          </div>
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
    </div>
  )
}

export default ProfilePage
