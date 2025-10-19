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
    makeOffer, 
    ignoreRequest 
  } = useRequest()
  
  const [hasLoaded, setHasLoaded] = useState(false)

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

  const handleMakeOffer = () => {
    if (currentRequest?.id) {
      makeOffer(currentRequest.id)
    }
  }

  const handleIgnore = () => {
    if (currentRequest?.id) {
      ignoreRequest(currentRequest.id)
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
      <div className="request-detail-content">
        <div className="request-info">
          <div className="request-description">
            <h2>Request Description</h2>
            <p>{currentRequest.description}</p>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <button className="action-button primary" onClick={handleMakeOffer}>
          Make Offer
        </button>
        <button className="action-button secondary" onClick={handleIgnore}>
          Ignore
        </button>
      </div>
    </div>
  )
}

export default RequestDetailPage
