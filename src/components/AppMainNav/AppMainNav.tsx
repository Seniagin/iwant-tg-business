import React from 'react'
import './AppMainNav.css'

type TabType = 'all-requests' | 'requests-with-offers'

export interface AppMainNavProps {
  activeTab?: TabType
  showTabs?: boolean
  onNavigateToTab: (tab: TabType) => void
  onOpenProfile: () => void
  userInitials: string
}

const AppMainNav: React.FC<AppMainNavProps> = ({
  activeTab = 'all-requests',
  showTabs = true,
  onNavigateToTab,
  onOpenProfile,
  userInitials,
}) => {
  return (
    <header className="app-main-nav" role="banner">
      <div className="app-main-nav__top-row">
        <span className="app-main-nav__title">I can</span>
        <button
          className="app-main-nav__avatar-btn"
          onClick={onOpenProfile}
          aria-label="Open profile settings"
        >
          {userInitials}
        </button>
      </div>

      {showTabs && (
        <div className="app-main-nav__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'all-requests'}
            className={`app-main-nav__tab${activeTab === 'all-requests' ? ' app-main-nav__tab--active' : ''}`}
            onClick={() => onNavigateToTab('all-requests')}
          >
            Active Requests
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'requests-with-offers'}
            className={`app-main-nav__tab${activeTab === 'requests-with-offers' ? ' app-main-nav__tab--active' : ''}`}
            onClick={() => onNavigateToTab('requests-with-offers')}
          >
            My Offers
          </button>
        </div>
      )}
    </header>
  )
}

export default AppMainNav
