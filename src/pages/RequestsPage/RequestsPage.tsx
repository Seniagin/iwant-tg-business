import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useRequests } from '../../contexts/RequestsContext'
import { ArrowLeft, MessageCircle, Plus } from 'lucide-react'
import RequestCard from '../../components/RequestCard'
import AddRequestModal from '../../components/AddRequestModal'
import './RequestsPage.css'

const RequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { requests, matchedRequests, addRequest, markAsMatched, isLoading } = useRequests()
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'matched'>('all')

  const handleBackToProfile = () => {
    navigate('/profile')
  }

  const handleAddRequest = () => {
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
  }

  const handleSubmitRequest = (requestData: any) => {
    addRequest({
      ...requestData,
      user_id: user?.id || 0
    })
    setShowAddModal(false)
  }

  const displayRequests = activeTab === 'all' ? requests : matchedRequests

  if (isLoading) {
    return (
      <div className="requests-container">
        <div className="loading">Loading requests...</div>
      </div>
    )
  }

  return (
    <div className="requests-container">
      <div className="header">
        <button className="back-button" onClick={handleBackToProfile}>
          <ArrowLeft size={20} />
        </button>
        <h1>Customer Requests</h1>
        <button className="add-button" onClick={handleAddRequest}>
          <Plus size={20} />
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Requests ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'matched' ? 'active' : ''}`}
          onClick={() => setActiveTab('matched')}
        >
          Matched ({matchedRequests.length})
        </button>
      </div>

      <div className="requests-content">
        {displayRequests.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} className="empty-icon" />
            <h3>No requests yet</h3>
            <p>
              {activeTab === 'all' 
                ? "No customer requests available at the moment."
                : "You haven't matched with any requests yet."
              }
            </p>
            {activeTab === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={handleAddRequest}
              >
                Add First Request
              </button>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {displayRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onMarkAsMatched={() => markAsMatched(request.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddRequestModal
          onSubmit={handleSubmitRequest}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default RequestsPage
