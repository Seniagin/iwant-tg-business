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

const TIMING_LABELS: Record<string, { label: string; icon: string }> = {
  TODAY:          { label: 'Today',     icon: '⚡' },
  THIS_WEEK:      { label: 'This week', icon: '🗓️' },
  AFTER_THIS_WEEK:{ label: 'Later',     icon: '⏳' },
}

const RequestDetailPage: React.FC<RequestDetailPageProps> = ({ requestId, onBack }) => {
  const { currentRequest, requestLoading, loadRequest, ignoreRequest, makeOffer } = useRequest()
  const { business } = useUser()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const offerFormRef = useRef<OfferFormHandle>(null)

  useEffect(() => {
    if (requestId) {
      setHasLoaded(false)
      setIsEditing(false)
      loadRequest(requestId).finally(() => setHasLoaded(true))
    } else {
      setHasLoaded(true)
    }
  }, [requestId, loadRequest])

  const handleSubmitOffer = async () => {
    if (!currentRequest?.id || !offerFormRef.current) return
    const formData = offerFormRef.current.getFormData()
    if (!formData) { setError('Please enter a valid price'); return }

    try {
      setIsSubmitting(true)
      setError(null)
      await makeOffer({ demandId: parseInt(currentRequest.id), ...formData })
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make offer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIgnore = async () => {
    if (!currentRequest?.id) return
    try {
      await ignoreRequest(currentRequest.id)
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ignore request')
    }
  }

  if (!hasLoaded || requestLoading || !currentRequest) {
    return (
      <div className="rdp">
        <div className="rdp__loading">
          <div className="rdp__spinner" />
        </div>
      </div>
    )
  }

  const offer = currentRequest.offer
  const status = offer?.status
  const isAccepted = status === 'accepted'
  const isRejected = status === 'rejected'
  const isPending = status === 'pending'
  const hasOffer = !!offer
  const showForm = !hasOffer || isEditing
  const currencySymbol = business?.currency ? getCurrencySymbol(business.currency) : ''
  const timing = offer?.time ? TIMING_LABELS[offer.time] : null
  const contacts = isAccepted ? currentRequest.clientContacts : null
  const rawPhone = contacts?.phone?.replace(/\D/g, '') ?? null
  const tgUsername = contacts?.telegramUsername?.replace(/^@/, '') ?? null

  return (
    <div className="rdp">
      {/* ── Header ── */}
      <header className="rdp__header">
        <button className="rdp__back" onClick={onBack}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className="rdp__header-title" title={currentRequest.title}>
          {currentRequest.title}
        </span>
        <button className="rdp__ignore" onClick={handleIgnore} title="Ignore request">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </header>

      {/* ── Scrollable content ── */}
      <div className="rdp__content">

        {/* Client request card */}
        <div className="rdp__section-label">Client request</div>
        <div className="rdp__request-card">
          <p className="rdp__request-text">{currentRequest.description}</p>
          <div className="rdp__request-meta">
            <span className="rdp__meta-time">{timeAgo(currentRequest.created_at)}</span>
            {currentRequest.distanceKm != null && (
              <>
                <span className="rdp__meta-dot">·</span>
                <span className="rdp__meta-distance">📍 {currentRequest.distanceKm.toFixed(1)} km away</span>
              </>
            )}
          </div>
        </div>

        {/* Offer summary (when offer exists and not editing) */}
        {hasOffer && !isEditing && (
          <>
            <div className="rdp__offer-header">
              <span className="rdp__section-label rdp__section-label--inline">Your offer</span>
              {isPending && <span className="rdp__status rdp__status--pending">● Pending</span>}
              {isAccepted && <span className="rdp__status rdp__status--accepted">✓ Accepted</span>}
              {isRejected && <span className="rdp__status rdp__status--rejected">✗ Declined</span>}
            </div>

            <div className={`rdp__offer-card${isAccepted ? ' rdp__offer-card--accepted' : ''}${isRejected ? ' rdp__offer-card--rejected' : ''}`}>
              <div className="rdp__offer-row">
                {offer!.price != null && (
                  <span className="rdp__offer-price">{currencySymbol}{offer!.price}</span>
                )}
                {timing && (
                  <span className="rdp__offer-timing">
                    {timing.icon} {timing.label}
                  </span>
                )}
              </div>

              {offer!.comment && (
                <p className="rdp__offer-comment">"{offer!.comment}"</p>
              )}

              {isAccepted && (
                <>
                  <p className="rdp__offer-accepted-note">Reach out to the client to discuss the details.</p>
                  {(rawPhone || tgUsername) && (
                    <div className="rdp__contact-buttons">
                      {rawPhone && (
                        <a className="rdp__contact-btn rdp__contact-btn--call" href={`tel:+${rawPhone}`}>
                          <span className="rdp__contact-btn-icon">📞</span> Call
                        </a>
                      )}
                      {rawPhone && (
                        <a className="rdp__contact-btn rdp__contact-btn--whatsapp" href={`https://wa.me/${rawPhone}`} target="_blank" rel="noreferrer">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                      )}
                      {rawPhone && (
                        <a className="rdp__contact-btn rdp__contact-btn--viber" href={`viber://chat?number=%2B${rawPhone}`}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.02 4.458.344 7.375.27 10.009c-.074 2.634-.148 7.57 4.635 8.95h.005l-.005 2.05s-.03.828.514 1 .65-.25 1.044-.673c.216-.233.513-.572.74-.832 2.043.172 3.61-.22 3.79-.277.414-.133 2.75-.433 3.136-3.538 0 0 .41-2.741-.265-4.745l.009.022-.007-.022c-.163-.481-.496-1.013-.936-1.366l.02.017c-.021-.018-.042-.035-.063-.051-.183-.147-.365-.284-.545-.406 0 0-1.004-.65-2.084-.903-.424-.1-.847-.154-1.268-.161l-.003-.001C8.8 9.225 8.248 9.57 7.69 9.944l-.005.003c-.249.164-.494.333-.733.508-.148.107-.297.22-.449.343-.39.32-.556.488-.573.507-.196.215-.178.547.04.741.217.194.543.176.737-.036 0 0 .077-.083.28-.244.112-.09.228-.177.348-.264.239-.176.484-.344.734-.508.554-.372 1.077-.709 1.602-.738.318-.018.641.02.96.094.852.201 1.696.73 1.696.73.136.09.267.186.395.291.274.225.496.528.617.877v.003c.604 1.849.263 4.33.228 4.534-.301 2.336-2.018 2.535-2.372 2.648-.15.048-1.524.404-3.336.267l-.007-.001-.002.001.004.005c0 0-1.325 1.599-1.738 2.017-.133.137-.28.189-.383.164-.144-.035-.184-.205-.182-.404L3.74 18.3C-.574 17.117-.494 12.798-.43 10.058c.064-2.74.64-5.327 2.382-7.08 2.066-1.9 5.81-2.167 7.452-2.187 1.621-.02 5.4.197 7.546 2.187 1.743 1.753 2.318 4.34 2.382 7.08.06 2.592.13 6.654-3.753 8.009l.03.008-.001.034c-.018.19-.063.376-.127.555.59-.154 1.159-.376 1.697-.67 2.576-1.407 3.77-4.006 3.826-6.973.058-2.74-.5-5.327-2.242-7.08C20.754.197 17.044.02 15.403 0h-.104C15.095.002 12.91-.023 11.398.002z"/></svg>
                          Viber
                        </a>
                      )}
                      {tgUsername && (
                        <a className="rdp__contact-btn rdp__contact-btn--telegram" href={`https://t.me/${tgUsername}`} target="_blank" rel="noreferrer">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          Telegram
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Offer form */}
        {showForm && (
          <div className="rdp__section-label">{isEditing ? 'Edit your offer' : 'Make an offer'}</div>
        )}
        {showForm && (
          <OfferForm ref={offerFormRef} error={error} />
        )}
      </div>

      {/* ── Sticky bottom action ── */}
      <div className="rdp__footer">
        {showForm ? (
          <div className="rdp__footer-row">
            {isEditing && (
              <button className="rdp__btn rdp__btn--secondary" onClick={() => { setIsEditing(false); setError(null) }}>
                Cancel
              </button>
            )}
            <button
              className="rdp__btn rdp__btn--primary"
              onClick={handleSubmitOffer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : isEditing ? 'Update offer' : 'Submit offer'}
            </button>
          </div>
        ) : isPending ? (
          <button className="rdp__btn rdp__btn--secondary" onClick={() => setIsEditing(true)}>
            ✏️ Edit offer
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default RequestDetailPage
