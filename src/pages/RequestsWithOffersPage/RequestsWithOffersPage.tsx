import React, { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import './RequestsWithOffersPage.css'
import { Demand } from '../../types'

interface Request {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

interface RequestsWithOffersPageProps {
  onRequestClick: (requestId: string) => void
}

const RequestsWithOffersPage: React.FC<RequestsWithOffersPageProps> = ({ onRequestClick }) => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch demands with offers from API
      const demands = await apiService.getDemandsWithOffers()
      
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
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

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
      <div className="requests-with-offers-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="requests-with-offers-page">
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
    <div className="requests-with-offers-page">
      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="empty-state">
            <h3>No requests with offers</h3>
            <p>You haven't made any offers yet.</p>
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

export default RequestsWithOffersPage

