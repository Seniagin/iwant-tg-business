import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner: React.FC = () => {
  console.log('LoadingSpinner rendered')
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

export default LoadingSpinner
