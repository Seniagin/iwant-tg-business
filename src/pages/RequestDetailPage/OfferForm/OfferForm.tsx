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

const TIME_OPTIONS = [
  { value: 'TODAY'           as const, label: 'Today',     icon: '⚡' },
  { value: 'THIS_WEEK'       as const, label: 'This week',  icon: '📅' },
  { value: 'AFTER_THIS_WEEK' as const, label: 'Later',      icon: '🗓' },
]

// Nudge a focused field into view after the keyboard has fully opened
function scrollFieldIntoView(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const el = e.currentTarget
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 320)
}

const OfferForm = forwardRef<OfferFormHandle, OfferFormProps>(({ error }, ref) => {
  const { business } = useUser()
  const [price, setPrice]           = useState('')
  const [selectedTime, setSelectedTime] = useState<'TODAY' | 'THIS_WEEK' | 'AFTER_THIS_WEEK'>('THIS_WEEK')
  const [comment, setComment]       = useState('')

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      if (price.trim() && isNaN(parseFloat(price.trim()))) return null
      return {
        price:   price.trim() ? parseFloat(price.trim()) : undefined,
        time:    selectedTime,
        comment: comment.trim() || undefined,
      }
    },
  }))

  const currencySymbol = business?.currency ? getCurrencySymbol(business.currency) : ''

  return (
    <div className="offer-form">
      {error && <div className="offer-form__error">{error}</div>}

      {/* ── Price ── */}
      <div className="offer-form__field">
        <div className="offer-form__label">
          Price
          <span className="offer-form__optional">optional</span>
        </div>
        <div className="offer-form__price-wrap">
          <input
            type="text"
            inputMode="decimal"
            className="offer-form__price-input"
            placeholder="e.g. 25"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onFocus={scrollFieldIntoView}
          />
          {currencySymbol && (
            <span className="offer-form__currency">{currencySymbol}</span>
          )}
        </div>
      </div>

      {/* ── Timing ── */}
      <div className="offer-form__field">
        <div className="offer-form__label">When can you do it?</div>
        <div className="offer-form__segment">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`offer-form__seg-btn${selectedTime === opt.value ? ' offer-form__seg-btn--active' : ''}`}
              onClick={() => setSelectedTime(opt.value)}
              type="button"
            >
              <span className="offer-form__seg-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Comment ── */}
      <div className="offer-form__field">
        <div className="offer-form__label">
          Comment
          <span className="offer-form__optional">optional</span>
        </div>
        <textarea
          className="offer-form__textarea"
          placeholder="e.g. Available Mon–Fri after 3 pm, price may vary depending on hair length"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={scrollFieldIntoView}
          rows={2}
        />
      </div>
    </div>
  )
})

OfferForm.displayName = 'OfferForm'
export default OfferForm
