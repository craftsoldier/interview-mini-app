// components/ENSInput.tsx
'use client'

import { forwardRef } from 'react'

interface ENSInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ENSInput = forwardRef<HTMLInputElement, ENSInputProps>(
  ({ value, onChange, onSubmit, disabled = false, placeholder = 'vitalik.eth', className = '' }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        e.preventDefault()
        onSubmit()
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`retro-input w-full ${className}`.trim()}
        aria-label="ENS name input"
      />
    )
  }
)

ENSInput.displayName = 'ENSInput'
