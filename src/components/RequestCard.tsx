import React from 'react'
import { MapPin, DollarSign, Clock, CheckCircle, MessageCircle } from 'lucide-react'
import { CustomerRequest } from '../contexts/RequestsContext'
import './RequestCard.css'

interface RequestCardProps {
  request: CustomerRequest
  onMarkAsMatched: () => void
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onMarkAsMatched }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`request-card ${request.is_matched ? 'matched' : ''}`}>
      <div className="request-header">
        <h3 className="request-title">{request.title}</h3>
        {request.is_matched && (
          <div className="matched-badge">
            <CheckCircle size={16} />
            <span>Matched</span>
          </div>
        )}
      </div>
      
      <p className="request-description">{request.description}</p>
      
      <div className="request-details">
        <div className="detail-item">
          <MessageCircle size={16} />
          <span className="category">{request.category}</span>
        </div>
        
        {request.budget && (
          <div className="detail-item">
            <DollarSign size={16} />
            <span>{request.budget}</span>
          </div>
        )}
        
        {request.location && (
          <div className="detail-item">
            <MapPin size={16} />
            <span>{request.location}</span>
          </div>
        )}
        
        <div className="detail-item">
          <Clock size={16} />
          <span>{formatDate(request.created_at)}</span>
        </div>
      </div>
      
      <div className="request-footer">
        <div className="contact-info">
          <strong>Contact:</strong> {request.contact_info}
        </div>
        
        {!request.is_matched && (
          <button 
            className="match-button"
            onClick={onMarkAsMatched}
          >
            Mark as Matched
          </button>
        )}
      </div>
    </div>
  )
}

export default RequestCard
