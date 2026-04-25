import React from 'react'
import { User, ClipboardList } from 'lucide-react'
import './AppMainNav.css'

export interface AppMainNavProps {
  profileActive: boolean
  requestsActive: boolean
  onProfile: () => void
  onRequests: () => void
}

const AppMainNav: React.FC<AppMainNavProps> = ({
  profileActive,
  requestsActive,
  onProfile,
  onRequests,
}) => {
  return (
    <header className="app-main-nav" role="navigation" aria-label="Main">
      <button
        type="button"
        className={`app-main-nav__btn${profileActive ? ' app-main-nav__btn--active' : ''}`}
        onClick={onProfile}
        aria-current={profileActive ? 'page' : undefined}
      >
        <User className="app-main-nav__icon" size={24} strokeWidth={2} aria-hidden />
        <span>Profile</span>
      </button>
      <button
        type="button"
        className={`app-main-nav__btn${requestsActive ? ' app-main-nav__btn--active' : ''}`}
        onClick={onRequests}
        aria-current={requestsActive ? 'page' : undefined}
      >
        <ClipboardList className="app-main-nav__icon" size={24} strokeWidth={2} aria-hidden />
        <span>Requests</span>
      </button>
    </header>
  )
}

export default AppMainNav
