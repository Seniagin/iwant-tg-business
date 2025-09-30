import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import WebApp from '@twa-dev/sdk'
import { useUser } from '../../contexts/UserContext'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/profile')
    }
  }, [user, isLoading, navigate])

  const handleLogin = () => {
    // In a real app, you would validate the user data
    // For now, we'll just navigate to the profile page
    navigate('/profile')
  }

  // Demo mode - show login button even if not in Telegram
  const isDemoMode = !WebApp.initDataUnsafe?.user

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to IWant</h1>
          <p>Connect your Telegram account to get started</p>
        </div>
        
        <div className="login-content">
          <div className="user-info">
            <div className="user-avatar">
              {WebApp.initDataUnsafe?.user?.photo_url ? (
                <img 
                  src={WebApp.initDataUnsafe.user.photo_url} 
                  alt="User Avatar"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {WebApp.initDataUnsafe?.user?.first_name?.[0] || 'D'}
                </div>
              )}
            </div>
            <div className="user-details">
              <h3>
                {WebApp.initDataUnsafe?.user?.first_name || 'Demo'} {WebApp.initDataUnsafe?.user?.last_name || 'User'}
              </h3>
              <p>@{WebApp.initDataUnsafe?.user?.username || 'demo_user'}</p>
            </div>
          </div>
          
          <button 
            className="btn btn-primary login-button"
            onClick={handleLogin}
          >
            {isDemoMode ? 'Start Demo' : 'Continue with Telegram'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
