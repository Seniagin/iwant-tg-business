import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, X } from 'lucide-react'
import './ProfilePage.css'
import type { BusinessContactsPayload } from '../../types'
import { apiService } from '../../services/api'
import { useUser } from '../../contexts/UserContext'
import { useAuth } from '../../contexts/AuthContext'
import ProfileLocationSection from '../../components/ProfileLocationSection/ProfileLocationSection'

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return '?'
}

// ── Edit modal (bottom sheet) ─────────────────────────────────────────────
interface EditModalProps {
  title: string
  value: string
  placeholder: string
  multiline?: boolean
  onSave: (value: string) => void
  onClose: () => void
}

const EditModal: React.FC<EditModalProps> = ({ title, value: initial, placeholder, multiline, onSave, onClose }) => {
  const [draft, setDraft] = useState(initial)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    // slight delay so the sheet animation starts before the keyboard appears
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="edit-modal-backdrop" onClick={handleBackdropClick}>
      <div className="edit-modal-sheet">
        <div className="edit-modal-header">
          <span className="edit-modal-title">{title}</span>
          <button className="edit-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="edit-modal-body">
          {multiline ? (
            <textarea
              ref={inputRef as React.Ref<HTMLTextAreaElement>}
              className="edit-modal-input edit-modal-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              rows={6}
            />
          ) : (
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="text"
              className="edit-modal-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
            />
          )}
        </div>

        <div className="edit-modal-footer">
          <button className="edit-modal-save" onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tap row ───────────────────────────────────────────────────────────────
interface TapRowProps {
  label: string
  value: string | null | undefined
  placeholder: string
  onClick: () => void
  isLast?: boolean
}

const TapRow: React.FC<TapRowProps> = ({ label, value, placeholder, onClick, isLast }) => {
  const str = value ?? '';
  return (
  <>
    <button className="settings-row" onClick={onClick}>
      <span className="settings-row-label">{label}</span>
      <span className={`settings-row-value${!str.trim() ? ' settings-row-value--empty' : ''}`}>
        {str.trim() || placeholder}
      </span>
      <ChevronRight size={16} className="settings-row-chevron" />
    </button>
    {!isLast && <div className="settings-divider" />}
  </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English 🇬🇧' },
  { code: 'uk', label: 'Українська 🇺🇦' },
  { code: 'ru', label: 'Русский 🇷🇺' },
]

type ModalField = 'name' | 'description' | 'email' | 'phone' | 'instagram' | 'website' | null

interface ProfilePageProps {
  onClose?: () => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
  const { isAuthenticated, user, isLoading, business, businessLoading, refreshBusiness } = useUser()
  const { logout } = useAuth()

  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [modalField, setModalField] = useState<ModalField>(null)

  const [currency, setCurrency] = useState('')
  const [currencies, setCurrencies] = useState<string[]>([])

  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactWebsite, setContactWebsite] = useState('')
  const [contactInstagram, setContactInstagram] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const list = await apiService.getAvailableCurrenciesList()
        setCurrencies(list)
      } catch (e) {
        console.error('Failed to load currencies', e)
      }
    })()
  }, [])

  useEffect(() => {
    void refreshBusiness({ withLoading: false })
  }, [refreshBusiness])

  useEffect(() => {
    if (business) {
      setBusinessName(business.name)
      setDescription(business.description)
      setCurrency(business.currency)
      setContactPhone(business.contacts?.phone ?? '')
      setContactEmail(business.contacts?.email ?? '')
      setContactWebsite(business.contacts?.website ?? '')
      setContactInstagram(business.contacts?.instagram ?? '')
    }
  }, [business])

  const handleSaveBusinessName = async (value: string) => {
    try {
      await apiService.updateBusinessName(value.trim())
      setBusinessName(value.trim())
      setModalField(null)
      await refreshBusiness()
    } catch (e) {
      console.error('Failed to update business name', e)
    }
  }

  const handleSaveDescription = (value: string) => {
    apiService.updateActivityDescription(value)
    setDescription(value)
    setModalField(null)
  }

  const handleSaveContact = async (field: keyof BusinessContactsPayload, value: string) => {
    const setters: Record<keyof BusinessContactsPayload, (v: string) => void> = {
      phone: setContactPhone,
      email: setContactEmail,
      website: setContactWebsite,
      instagram: setContactInstagram,
    }
    const payload: BusinessContactsPayload = {
      phone: contactPhone,
      email: contactEmail,
      website: contactWebsite,
      instagram: contactInstagram,
      [field]: value.trim(),
    }
    try {
      await apiService.updateBusinessContacts(payload)
      setters[field](value.trim())
      setModalField(null)
      await refreshBusiness()
    } catch (e) {
      console.error('Failed to update contact', e)
    }
  }

  const handleLanguageChange = async (code: string) => {
    try {
      await apiService.updateLanguage(code)
      await refreshBusiness()
    } catch (e) {
      console.error('Failed to update language', e)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await apiService.updateBusinessCurrency(newCurrency)
      setCurrency(newCurrency)
      await refreshBusiness()
    } catch (e) {
      console.error('Failed to update currency', e)
    }
  }

  if (isLoading || businessLoading) {
    return <div className="profile-page"><div className="profile-loading">Loading…</div></div>
  }

  if (!isAuthenticated) {
    return <div className="profile-page"><div className="profile-loading">Please log in to view your profile.</div></div>
  }

  const fullName = user
    ? [user.telegramFirstName, user.telegramLastName].map((s) => s?.trim()).filter(Boolean).join(' ')
    : ''
  const handle = user?.telegramUsername?.trim() ?? ''
  const displayName = fullName || (handle ? `@${handle}` : '—')

  return (
    <div className="profile-page">
      {/* ── Avatar hero ── */}
      <div className="profile-hero">
        {onClose && (
          <button className="profile-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        )}
        <div className="profile-avatar">
          <span className="profile-avatar-initials">{getInitials(fullName || handle)}</span>
        </div>
        <div className="profile-hero-text">
          <p className="profile-hero-name">{displayName}</p>
          {fullName && handle && <p className="profile-hero-handle">@{handle}</p>}
          {business?.name && <p className="profile-hero-business">{business.name}</p>}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="profile-body">

        {business && (
          <div className="settings-section">
            <p className="settings-section-label">Business</p>
            <div className="settings-group">
              <TapRow
                label="Name"
                value={businessName}
                placeholder="Add business name"
                onClick={() => setModalField('name')}
              />
              <TapRow
                label="Description"
                value={description}
                placeholder="Add description"
                onClick={() => setModalField('description')}
                isLast
              />
            </div>
          </div>
        )}

        {business && (
          <div className="settings-section">
            <p className="settings-section-label">Contact &amp; social</p>
            <div className="settings-group">
              <TapRow label="Email"     value={contactEmail}    placeholder="Add email"     onClick={() => setModalField('email')} />
              <TapRow label="Phone"     value={contactPhone}    placeholder="Add phone"     onClick={() => setModalField('phone')} />
              <TapRow label="Instagram" value={contactInstagram} placeholder="Add Instagram" onClick={() => setModalField('instagram')} />
              <TapRow label="Website"   value={contactWebsite}  placeholder="Add website"   onClick={() => setModalField('website')} isLast />
            </div>
          </div>
        )}

        {business && (
          <div className="settings-section">
            <p className="settings-section-label">Preferences</p>
            <div className="settings-group">
              <div className="settings-row settings-row--select">
                <span className="settings-row-label">Currency</span>
                <select className="currency-select" value={currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                  {currencies.length === 0
                    ? <option value="">Loading…</option>
                    : currencies.map((c) => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
              <div className="settings-divider" />
              <div className="settings-row settings-row--select">
                <span className="settings-row-label">Language</span>
                <select
                  className="currency-select"
                  value={user?.telegramLanguageCode ?? 'en'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="settings-section">
          <p className="settings-section-label">Location</p>
          <div className="settings-group settings-group--inset">
            <ProfileLocationSection />
          </div>
        </div>

        <div className="settings-section settings-section--footer">
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>

      </div>

      {/* ── Edit modals ── */}
      {modalField === 'name' && (
        <EditModal title="Business name" value={businessName} placeholder="Your business or brand name"
          onSave={handleSaveBusinessName} onClose={() => setModalField(null)} />
      )}
      {modalField === 'description' && (
        <EditModal title="Description" value={description} placeholder="Describe your services…" multiline
          onSave={handleSaveDescription} onClose={() => setModalField(null)} />
      )}
      {modalField === 'email' && (
        <EditModal title="Email" value={contactEmail} placeholder="you@example.com"
          onSave={(v) => handleSaveContact('email', v)} onClose={() => setModalField(null)} />
      )}
      {modalField === 'phone' && (
        <EditModal title="Phone" value={contactPhone} placeholder="+380 …"
          onSave={(v) => handleSaveContact('phone', v)} onClose={() => setModalField(null)} />
      )}
      {modalField === 'instagram' && (
        <EditModal title="Instagram" value={contactInstagram} placeholder="@handle or full URL"
          onSave={(v) => handleSaveContact('instagram', v)} onClose={() => setModalField(null)} />
      )}
      {modalField === 'website' && (
        <EditModal title="Website" value={contactWebsite} placeholder="https://…"
          onSave={(v) => handleSaveContact('website', v)} onClose={() => setModalField(null)} />
      )}
    </div>
  )
}

export default ProfilePage
