'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', digits: 10 },
  { code: '+1', country: 'USA', flag: '🇺🇸', digits: 10 },
  { code: '+44', country: 'UK', flag: '🇬🇧', digits: 10 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', digits: 9 },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', digits: 10 },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', digits: 9 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', digits: 10 },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', digits: 10 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', digits: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', digits: 11 },
  { code: '+33', country: 'France', flag: '🇫🇷', digits: 9 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', digits: 10 },
  { code: '+86', country: 'China', flag: '🇨🇳', digits: 11 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', digits: 8 },
  { code: '93', country: 'Afghanistan', flag: '🇦🇫', digits: 9 },
] as const

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function PhoneInput({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  disabled = false,
  className,
  error = false,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+91')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]
  const maxDigits = selectedCountry.digits

  const filteredCodes = COUNTRY_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  )

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, maxDigits)
    onChange?.(`${countryCode}${val}`)
  }

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setOpen(false)
    setSearch('')
    const country = COUNTRY_CODES.find((c) => c.code === code)
    if (country && onChange) {
      const numberOnly = value.replace(/^\+\d+/, '')
      onChange(`${code}${numberOnly.slice(0, country.digits)}`)
    }
    inputRef.current?.focus()
  }

  const numberOnly = value.replace(/^\+\d+/, '')

  return (
    <div className={cn('relative flex', className)}>
      {/* Country Code Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-l-md border border-r-0 bg-muted px-2 text-sm transition-colors hover:bg-accent',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-muted-foreground">{countryCode}</span>
          <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-background shadow-lg">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredCodes.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c.code)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                      countryCode === c.code && 'bg-accent'
                    )}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1">{c.country}</span>
                    <span className="text-muted-foreground">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        ref={inputRef}
        type="tel"
        value={numberOnly}
        onChange={handleNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxDigits}
        className={cn(
          'h-9 flex-1 rounded-r-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed bg-muted'
        )}
      />
    </div>
  )
}

export { COUNTRY_CODES }
