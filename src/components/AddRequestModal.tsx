import React, { useState } from 'react'
import { X, MessageCircle, DollarSign, MapPin } from 'lucide-react'
import './AddRequestModal.css'

interface AddRequestModalProps {
  onSubmit: (requestData: {
    title: string
    description: string
    category: string
    budget?: string
    location?: string
    contact_info: string
  }) => void
  onClose: () => void
}

const AddRequestModal: React.FC<AddRequestModalProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: '',
    contact_info: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    'Web Development',
    'Mobile App Development',
    'Design',
    'Writing',
    'Marketing',
    'Consulting',
    'Photography',
    'Video Production',
    'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.contact_info.trim()) {
      newErrors.contact_info = 'Contact information is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: formData.budget.trim() || undefined,
        location: formData.location.trim() || undefined,
        contact_info: formData.contact_info.trim()
      })
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Request</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief title for your request"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              className={`input textarea ${errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of what you need"
              rows={4}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              className={`input ${errors.category ? 'error' : ''}`}
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget</label>
              <div className="input-with-icon">
                <DollarSign size={16} className="input-icon" />
                <input
                  id="budget"
                  type="text"
                  className="input"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., $500-1000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  id="location"
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contact_info">Contact Information *</label>
            <div className="input-with-icon">
              <MessageCircle size={16} className="input-icon" />
              <input
                id="contact_info"
                type="text"
                className={`input ${errors.contact_info ? 'error' : ''}`}
                value={formData.contact_info}
                onChange={(e) => handleInputChange('contact_info', e.target.value)}
                placeholder="Telegram username, email, or phone"
              />
            </div>
            {errors.contact_info && <span className="error-message">{errors.contact_info}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddRequestModal
