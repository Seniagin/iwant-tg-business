import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import './DebugPanel.css'

interface DebugPanelProps {
  isVisible: boolean
  onClose: () => void
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!isVisible) return null

  const debugInfo = {
    userAgent: navigator.userAgent,
    isTelegram: !!window.Telegram?.WebApp,
    initData: (window as any).Telegram?.WebApp?.initData || 'Not available',
    initDataUnsafe: (window as any).Telegram?.WebApp?.initDataUnsafe || 'Not available',
    theme: {
      backgroundColor: (window as any).Telegram?.WebApp?.backgroundColor || 'Not available',
      textColor: (window as any).Telegram?.WebApp?.textColor || 'Not available'
    },
    localStorage: {
      user_data: localStorage.getItem('user_data'),
      auth_token: localStorage.getItem('auth_token'),
      activity_description: localStorage.getItem('activity_description')
    },
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'Not set'
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🐛 Debug Panel</h3>
        <button onClick={onClose} className="debug-close">
          <X size={20} />
        </button>
      </div>
      
      <div className="debug-content">
        <div className="debug-section">
          <h4>🌐 Environment</h4>
          <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
          <p><strong>Is Telegram:</strong> {debugInfo.isTelegram ? 'Yes' : 'No'}</p>
          <p><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</p>
        </div>

        <div className="debug-section">
          <h4>📊 Telegram Data</h4>
          <p><strong>Init Data:</strong> {debugInfo.initData}</p>
          <p><strong>User Data:</strong> {JSON.stringify(debugInfo.initDataUnsafe, null, 2)}</p>
        </div>

        <div className="debug-section">
          <h4>🎨 Theme</h4>
          <p><strong>Background:</strong> {debugInfo.theme.backgroundColor}</p>
          <p><strong>Text Color:</strong> {debugInfo.theme.textColor}</p>
        </div>

        <div className="debug-section">
          <h4>💾 Local Storage</h4>
          <p><strong>User Data:</strong> {debugInfo.localStorage.user_data || 'Empty'}</p>
          <p><strong>Auth Token:</strong> {debugInfo.localStorage.auth_token ? 'Present' : 'Empty'}</p>
          <p><strong>Activity:</strong> {debugInfo.localStorage.activity_description || 'Empty'}</p>
        </div>

        <div className="debug-actions">
          <button onClick={copyToClipboard} className="debug-copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Debug Info'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel
