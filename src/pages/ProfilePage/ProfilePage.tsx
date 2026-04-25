import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import type { BusinessContactsPayload } from '../../types'
import { apiService } from '../../services/api'
import { useUser } from '../../contexts/UserContext'
import ProfileLocationSection from '../../components/ProfileLocationSection/ProfileLocationSection'

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user, isLoading, business, businessLoading, refreshBusiness } = useUser()
  const [businessName, setBusinessName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [currency, setCurrency] = useState('')
  const [currencies, setCurrencies] = useState<string[]>([])
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactWebsite, setContactWebsite] = useState('')
  const [contactInstagram, setContactInstagram] = useState('')
  const [contactsSaving, setContactsSaving] = useState(false)
  useEffect(() => {
    (async () => {
      try {
        const currenciesList = await apiService.getAvailableCurrenciesList()
        setCurrencies(currenciesList)
      } catch (error) {
        console.error('Failed to load currencies list:', error)
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

  const handleSaveBusinessName = async () => {
    try {
      await apiService.updateBusinessName(businessName.trim())
      setIsEditingName(false)
      await refreshBusiness()
    } catch (error) {
      console.error('Failed to update business name:', error)
    }
  }

  const handleSaveDescription = () => {
    apiService.updateActivityDescription(description)
    setIsEditing(false)
  }

  const handleSaveContacts = async () => {
    if (!business) return
    const payload: BusinessContactsPayload = {
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
      website: contactWebsite.trim(),
      instagram: contactInstagram.trim(),
    }
    try {
      setContactsSaving(true)
      await apiService.updateBusinessContacts(payload)
      await refreshBusiness()
    } catch (error) {
      console.error('Failed to update business contacts:', error)
    } finally {
      setContactsSaving(false)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await apiService.updateBusinessCurrency(newCurrency)
      setCurrency(newCurrency)
      // Refresh business data to get updated currency
      await refreshBusiness()
    } catch (error) {
      console.error('Failed to update currency:', error)
      // Optionally show error message to user
    }
  }

  if (isLoading || businessLoading) {
    return (
      <div className="profile-container">
        <div className="profile-body">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-body">
          <div className="loading">Please log in to view your profile.</div>
        </div>
      </div>
    )
  }

  const profileNameLine = user
    ? [user.telegramFirstName, user.telegramLastName].map((s) => s?.trim()).filter(Boolean).join(' ')
    : ''
  const profileTelegramHandle = user?.telegramUsername?.trim() ?? ''

  return (
    <div className="profile-container">
      <div className="header profile-header">
        {user && (
          <div className="profile-header-identity">
            <p className="profile-header-name">
              {profileNameLine || (profileTelegramHandle ? `@${profileTelegramHandle}` : '—')}
            </p>
            {profileNameLine && profileTelegramHandle ? (
              <p className="profile-header-username">@{profileTelegramHandle}</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="profile-body">
        {business && (
          <section className="activity-section business-name-section" aria-labelledby="business-name-heading">
            <div className="section-header section-header--with-subtitle">
              <div className="section-header-titles">
                <h3 id="business-name-heading">Business name</h3>
                <p className="section-subtitle">Shown as your public business title across the app.</p>
              </div>
              <button
                type="button"
                className="edit-button"
                onClick={() => {
                  if (isEditingName) {
                    setBusinessName(business.name)
                  }
                  setIsEditingName(!isEditingName)
                }}
              >
                {isEditingName ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingName ? (
              <div className="edit-form business-name-edit">
                <input
                  type="text"
                  className="input business-name-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business or brand name"
                  maxLength={120}
                  aria-label="Business name"
                />
                <div className="business-description-actions">
                  <button type="button" className="btn btn-primary save-button" onClick={handleSaveBusinessName}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="description-display business-name-display">
                {businessName.trim() ? (
                  <p className="business-name-body">{businessName.trim()}</p>
                ) : (
                  <p className="placeholder-text">Tap Edit to set your business name.</p>
                )}
              </div>
            )}
          </section>
        )}

        <section className="activity-section business-description-section" aria-labelledby="business-desc-heading">
          <div className="section-header section-header--with-subtitle">
            <div className="section-header-titles">
              <h3 id="business-desc-heading">Business description</h3>
              <p className="section-subtitle">
                Tell people what you offer. This helps clients understand your services when you engage with requests.
              </p>
            </div>
            <button
              type="button"
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="edit-form business-description-edit">
              <textarea
                className="input textarea business-description-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your activities, skills, or services you provide..."
                rows={8}
                aria-label="Business description"
              />
              <div className="business-description-actions">
                <button
                  type="button"
                  className="btn btn-primary save-button"
                  onClick={handleSaveDescription}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="description-display business-description-display">
              {description ? (
                <p className="business-description-body">{description}</p>
              ) : (
                <div className="business-description-empty">
                  <p className="business-description-empty-title">No description yet</p>
                  <p className="placeholder-text business-description-empty-hint">
                    Tap Edit to add a short summary of what you do and how you help clients.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {business && (
          <section className="activity-section business-contacts-section" aria-labelledby="business-contacts-heading">
            <div className="section-header section-header--with-subtitle">
              <div className="section-header-titles">
                <h3 id="business-contacts-heading">Contact &amp; social</h3>
                <p className="section-subtitle">
                  How clients can reach you. Leave a field empty if you do not want it shown.
                </p>
              </div>
            </div>
            <div className="business-contacts-form">
              <label className="business-contacts-label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                className="input business-contacts-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <label className="business-contacts-label" htmlFor="contact-phone">
                Phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                className="input business-contacts-input"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+380 …"
                autoComplete="tel"
              />

              <label className="business-contacts-label" htmlFor="contact-instagram">
                Instagram
              </label>
              <input
                id="contact-instagram"
                type="text"
                className="input business-contacts-input"
                value={contactInstagram}
                onChange={(e) => setContactInstagram(e.target.value)}
                placeholder="@handle or full URL"
                autoCapitalize="none"
                autoCorrect="off"
              />

              <label className="business-contacts-label" htmlFor="contact-website">
                Website
              </label>
              <input
                id="contact-website"
                type="url"
                className="input business-contacts-input"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
                placeholder="https://…"
                autoComplete="url"
              />

              <div className="business-description-actions business-contacts-actions">
                <button
                  type="button"
                  className="btn btn-primary save-button"
                  onClick={handleSaveContacts}
                  disabled={contactsSaving}
                >
                  {contactsSaving ? 'Saving…' : 'Save contacts'}
                </button>
              </div>
            </div>
          </section>
        )}

      {business && (
        <div className="activity-section">
          <div className="section-header">
            <h3>Default Currency</h3>
          </div>
          <div className="currency-select-container">
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {currencies.length === 0 ? (
                <option value="">Loading currencies...</option>
              ) : (
                currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      <ProfileLocationSection />
      </div>
    </div>
  )
}

export default ProfilePage
