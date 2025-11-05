import React from 'react'
import './RequestsPage.css'

type TabType = 'all-requests' | 'requests-with-offers'

interface RequestsPageProps {
  activeTab?: TabType
  onNavigateToTab: (tab: TabType) => void
}

const RequestsPage: React.FC<RequestsPageProps> = ({ activeTab = 'all-requests', onNavigateToTab }) => {

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h1>Requests</h1>
        <p>Browse all requests and manage your offers</p>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'all-requests' ? 'active' : ''}`}
          onClick={() => onNavigateToTab('all-requests')}
        >
          Active Requests
        </button>
        <button
          className={`tab-button ${activeTab === 'requests-with-offers' ? 'active' : ''}`}
          onClick={() => onNavigateToTab('requests-with-offers')}
        >
          My Offers
        </button>
      </div>
    </div>
  )
}

export default RequestsPage
