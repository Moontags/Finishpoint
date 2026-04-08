'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Suggestion {
  place_id: string
  description: string
}

interface AddressAutocompleteFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
  name?: string
  id?: string
}

export function AddressAutocompleteField({
  value,
  onChange,
  placeholder = 'Kirjoita osoite...',
  label,
  required,
  className,
  name,
  id,
}: AddressAutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/places?input=${encodeURIComponent(input)}`)
      const data = await res.json()
      if (data.predictions && data.predictions.length > 0) {
        setSuggestions(data.predictions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (err) {
      console.error('Places fetch error:', err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    setActiveIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  function selectSuggestion(suggestion: Suggestion) {
    onChange(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  return (

    <div ref={containerRef} style={{ position: 'relative' }} className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-zinc-300 mb-1"
        >
          {label}{required && ' *'}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          name={name}
          data-testid={
            name?.toLowerCase().includes('nouto') || name === 'pickupAddress'
              ? 'pickup-address-input'
              : name?.toLowerCase().includes('toimitus') || name === 'deliveryAddress'
              ? 'delivery-address-input'
              : undefined
          }
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {loading && (
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              color: '#71717a',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            ···
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: '4px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
              style={{
                padding: '9px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: '1.4',
                color: activeIndex === i ? '#ffffff' : '#d4d4d8',
                backgroundColor: activeIndex === i ? '#2563eb' : 'transparent',
                transition: 'background-color 0.1s',
              }}
            >
              <span style={{ display: 'block', fontWeight: 500 }}>
                {s.description.split(',')[0]}
              </span>
              {s.description.includes(',') && (
                <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '1px' }}>
                  {s.description.split(',').slice(1).join(',').trim()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
