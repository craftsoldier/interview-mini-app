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
        className={`
          flex-1 px-4 py-3 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-base text-gray-900 bg-white
          ${className}
        `.trim()}
        aria-label="ENS name input"
      />
    )
  }
)

ENSInput.displayName = 'ENSInput'
