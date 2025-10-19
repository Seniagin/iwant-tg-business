import React, { useState, useEffect } from 'react'
import { telegramAuth } from '../../services/auth'
import { apiService, Demand } from '../../services/api'
import './RequestsPage.css'

interface Request {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

interface RequestsPageProps {
  onRequestClick: (requestId: string) => void
}

const RequestsPage: React.FC<RequestsPageProps> = ({ onRequestClick }) => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for URL parameters to see if we should show a specific request
    const urlParams = new URLSearchParams(window.location.search)
    const requestId = urlParams.get('request_id')
    
    if (requestId) {
      // If a specific request ID is provided, we could fetch just that request
      console.log('Request ID from URL:', requestId)
    }

    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch demands from API
      const demands = await apiService.getDemands()
      
      // Transform API data to match our Request interface
      const transformedRequests: Request[] = demands.map((demand: Demand) => ({
        id: demand.id.toString(),
        title: demand.summarizedTranslation || demand.translation || demand.transcription,
        description: demand.translation || demand.transcription,
        status: 'pending' as const, // API doesn't provide status, defaulting to pending
        created_at: demand.createdAt,
        updated_at: demand.updatedAt
      }))
      
      setRequests(transformedRequests)
    } catch (err) {
      console.error('Error loading requests:', err)
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('Authentication required')) {
          setError('Authentication required. Please log in again.')
        } else if (err.message.includes('401')) {
          setError('Authentication failed. Please check your login.')
        } else if (err.message.includes('403')) {
          setError('Access denied. You don\'t have permission to view requests.')
        } else if (err.message.includes('404')) {
          setError('Requests not found.')
        } else if (err.message.includes('500')) {
          setError('Server error. Please try again later.')
        } else {
          setError(`Failed to load requests: ${err.message}`)
        }
      } else {
        setError('Failed to load requests. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return '#ffa500'
      case 'in_progress':
        return '#007bff'
      case 'completed':
        return '#28a745'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getStatusText = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRequestClick = (request: Request) => {
    onRequestClick(request.id)
  }

  if (loading) {
    return (
      <div className="requests-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="requests-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadRequests} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h1>My Requests</h1>
        <p>Manage your help requests and track their status</p>
      </div>

      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="empty-state">
            <h3>No requests yet</h3>
            <p>You haven't created any help requests yet.</p>
            <button className="create-request-button">
              Create First Request
            </button>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="request-card"
              onClick={() => handleRequestClick(request)}
            >
              <div className="request-header">
                <h3 className="request-title">{request.title}</h3>
                <span
                  className="request-status"
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {getStatusText(request.status)}
                </span>
              </div>
              <p className="request-description">{request.description}</p>
              <div className="request-meta">
                <span className="request-date">
                  Created: {formatDate(request.created_at)}
                </span>
                {request.updated_at !== request.created_at && (
                  <span className="request-updated">
                    Updated: {formatDate(request.updated_at)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default RequestsPage
