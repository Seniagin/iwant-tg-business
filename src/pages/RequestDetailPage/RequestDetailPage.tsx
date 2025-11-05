import React, { useEffect, useState, useRef } from 'react'
import { useRequest } from '../../contexts/RequestContext'
import './RequestDetailPage.css'
import OfferForm, { OfferFormHandle } from './OfferForm/OfferForm'

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
            <p>{currentRequest.description}</p>
          </div>
        </div>

        {/* Offer Form Section */}
        <OfferForm
          ref={offerFormRef}
          error={error}
        />
      </div>

      <div className="bottom-actions">
        <button
          className="action-button primary"
          onClick={handleSubmitOffer}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Offer'}
        </button>
      </div>

    </div>
  )
}

export default RequestDetailPage
