'use client'

import { useEffect, useState } from 'react'

export function Toast({
  message, type, onClose,
}: {
  message: string; type: 'success' | 'error'; onClose: () => void
}) {
  useEffect(() => {
    if (type === 'success') {
      const t = setTimeout(onClose, 2000)
      return () => clearTimeout(t)
    }
  }, [type, onClose])

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
      background: type === 'success' ? '#16a34a' : '#dc2626', color: '#fff',
      display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px' }}>
        ×
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  return {
    toast,
    showSuccess: (msg: string) => setToast({ message: msg, type: 'success' }),
    showError: (msg: string) => setToast({ message: msg, type: 'error' }),
    hideToast: () => setToast(null),
  }
}
