import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRequest } from '../../contexts/RequestContext'
import { useUser } from '../../contexts/UserContext'
import { getCurrencySymbol } from '../../constants/currency-to-symbol-map'
import './RequestDetailPage.css'
import OfferForm, { OfferFormHandle } from './OfferForm/OfferForm'

interface RequestDetailPageProps {
  requestId?: string
  onBack: () => void
}

function parseUtc(s: string): number {
  const str = /Z$|[+-]\d{2}:?\d{2}$/.test(s) ? s : s + 'Z'
  return new Date(str).getTime()
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - parseUtc(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, onBack }) => {
  const {
    currentRequest,
    requestLoading,
    loadRequest,
    ignoreRequest,
    makeOffer
  } = useRequest()
  const { business } = useUser()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const offerFormRef = useRef<OfferFormHandle>(null)

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
    if (!currentRequest?.id || !offerFormRef.current) return

    const formData = offerFormRef.current.getFormData()
    if (!formData) {
      setError('Please enter a valid price')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const offerData = {
        demandId: parseInt(currentRequest.id),
        ...formData
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

  const handleIgnore = async () => {
    if (!currentRequest?.id) return

    try {
      await ignoreRequest(currentRequest.id)
      // Navigate back after ignoring
      onBack()
    } catch (err) {
      console.error('Error ignoring request:', err)
      setError(err instanceof Error ? err.message : 'Failed to ignore request')
    }
  }


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
        <button className="ignore-button" onClick={handleIgnore} title="Ignore request">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
      <div className="request-detail-content">

        {/* Client request card */}
        <div className="request-card">
          <p className="request-card-text">{currentRequest.description}</p>
          <div className="request-card-meta">
            <span className="request-card-time">{timeAgo(currentRequest.created_at)}</span>
            {currentRequest.distanceKm != null && (
              <span className="request-card-distance">{currentRequest.distanceKm.toFixed(1)} km from you</span>
            )}
          </div>
        </div>

        {/* Already submitted: show offer summary */}
        {currentRequest.offer && (
          <div className="offer-summary">
            <p className="offer-summary-label">Your offer</p>
            {currentRequest.offer.price && business?.currency && (
              <div className="offer-summary-price">
                {getCurrencySymbol(business.currency)}{currentRequest.offer.price}
              </div>
            )}
            {currentRequest.offer.time && (
              <div className="offer-summary-time">
                {currentRequest.offer.time === 'TODAY' && '⚡ Today'}
                {currentRequest.offer.time === 'THIS_WEEK' && '📅 This Week'}
                {currentRequest.offer.time === 'AFTER_THIS_WEEK' && '⏳ After This Week'}
              </div>
            )}
            {currentRequest.offer.comment && (
              <p className="offer-summary-comment">{currentRequest.offer.comment}</p>
            )}
          </div>
        )}

        {/* Offer form + submit */}
        {!currentRequest.offer && (
          <>
            <OfferForm ref={offerFormRef} error={error} />
            <div className="bottom-actions">
              <button
                className="action-button primary"
                onClick={handleSubmitOffer}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default RequestDetailPage
