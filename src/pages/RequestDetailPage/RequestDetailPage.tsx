import React, { useEffect, useState } from 'react'
import { useRequest } from '../../contexts/RequestContext'
import './RequestDetailPage.css'

interface RequestDetailPageProps {
  requestId?: string
  onBack: () => void
}

const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, onBack }) => {
  const {
    currentRequest,
    requestLoading,
    loadRequest,
    ignoreRequest,
    makeOffer
  } = useRequest()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [price, setPrice] = useState('')
  const [selectedTime, setSelectedTime] = useState<'TODAY' | 'THIS_WEEK' | 'AFTER_THIS_WEEK'>('THIS_WEEK')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (requestId) {
      setHasLoaded(false)
      loadRequest(requestId).finally(() => {
        setHasLoaded(true)
      })
    } else {
      setHasLoaded(true)
    }
  }, [requestId, loadRequest])

  const handleSubmitOffer = async () => {
    if (!currentRequest?.id) return

    try {
      setIsSubmitting(true)
      setError(null)

      // Validate price if provided
      if (price.trim() && isNaN(parseFloat(price.trim()))) {
        setError('Please enter a valid price')
        setIsSubmitting(false)
        return
      }

      const offerData = {
        demandId: parseInt(currentRequest.id),
        price: price.trim() ? parseFloat(price.trim()) : undefined,
        time: selectedTime,
        comment: comment.trim() || undefined
      }

      await makeOffer(offerData)

      // Success - navigate back
      onBack()
    } catch (err) {
      console.error('Error making offer:', err)
      setError(err instanceof Error ? err.message : 'Failed to make offer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIgnore = () => {
    if (currentRequest?.id) {
      ignoreRequest(currentRequest.id)
    }
  }

  const timeOptions = [
    { value: 'TODAY' as const, label: 'Today', icon: '⚡' },
    { value: 'THIS_WEEK' as const, label: 'This Week', icon: '📅' },
    { value: 'AFTER_THIS_WEEK' as const, label: 'After This Week', icon: '⏰' }
  ]

  // Always show loading until we have data or have finished loading
  if (!hasLoaded || requestLoading || !currentRequest) {
    return (
      <div className="request-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading request details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="request-detail-page">
      <div className="request-detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to All Requests
        </button>
      </div>
      <div className="request-detail-content">
        <div className="request-info">
          <div className="request-description">
            <h2>Request Description</h2>
            <p>{currentRequest.description}</p>
          </div>
        </div>

        {/* Offer Form Section */}

      </div>

      <div className="bottom-actions">
        <div className="offer-form-section">
          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Price Section */}
          <div className="form-section">
            <label className="form-label">Price (optional)</label>
            <div className="price-input-container">
              <input
                type="text"
                className="price-input"
                placeholder="Enter your price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <div className="price-controls">
                <button
                  className="price-arrow"
                  onClick={() => {
                    const current = parseFloat(price) || 0
                    setPrice((current + 1).toString())
                  }}
                >▲</button>
                <button
                  className="price-arrow"
                  onClick={() => {
                    const current = parseFloat(price) || 0
                    if (current > 0) {
                      setPrice((current - 1).toString())
                    }
                  }}
                >▼</button>
              </div>
            </div>
          </div>
          {/* Comment Section */}
          <div className="form-section">
            <label className="form-label">Comment (optional)</label>
            <textarea
              className="comment-textarea"
              placeholder="Add any additional details..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          {/* Time Selection Section */}
          <div className="form-section">
            <label className="form-label">Time</label>
            <div className="time-options">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`time-option ${selectedTime === option.value ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(option.value)}
                >
                  <span className="time-icon">{option.icon}</span>
                  <span className="time-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            className="action-button primary"
            onClick={handleSubmitOffer}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default RequestDetailPage
