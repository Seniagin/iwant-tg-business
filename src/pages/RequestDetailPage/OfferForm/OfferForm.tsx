import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { useUser } from '../../../contexts/UserContext'
import { getCurrencySymbol } from '../../../constants/currency-to-symbol-map'
import './OfferForm.css'

export interface OfferFormData {
  price?: number
  time: 'TODAY' | 'THIS_WEEK' | 'AFTER_THIS_WEEK'
  comment?: string
}

export interface OfferFormHandle {
  getFormData: () => OfferFormData | null
}

interface OfferFormProps {
  error?: string | null
}

const OfferForm = forwardRef<OfferFormHandle, OfferFormProps>(({ error }, ref) => {
  const { business } = useUser()
  const [price, setPrice] = useState('')
  const [selectedTime, setSelectedTime] = useState<'TODAY' | 'THIS_WEEK' | 'AFTER_THIS_WEEK'>('THIS_WEEK')
  const [comment, setComment] = useState('')

  const timeOptions = [
    { value: 'TODAY' as const, label: 'Today', icon: '⚡' },
    { value: 'THIS_WEEK' as const, label: 'This Week', icon: '📅' },
    { value: 'AFTER_THIS_WEEK' as const, label: 'After This Week', icon: '⏰' }
  ]

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      // Validate price if provided
      if (price.trim() && isNaN(parseFloat(price.trim()))) {
        return null
      }

      return {
        price: price.trim() ? parseFloat(price.trim()) : undefined,
        time: selectedTime,
        comment: comment.trim() || undefined
      }
    }
  }))

  return (
    <div className="offer-form-section">
      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Price Section */}
      <div className="form-section">
        <div className="price-input-container">
          <input
            type="text"
            inputMode="decimal"
            className="price-input"
            placeholder="Suggest your price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {business?.currency && (
            <span className="price-currency">
              {getCurrencySymbol(business.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Comment Section */}
      <div className="form-section">
        <textarea
          className="comment-textarea"
          placeholder="Leave a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      {/* Time Selection Section */}
      <div className="form-section">
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
    </div>
  )
})

OfferForm.displayName = 'OfferForm'

export default OfferForm

