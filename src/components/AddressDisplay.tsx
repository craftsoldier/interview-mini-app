// components/AddressDisplay.tsx
'use client'

import { useState } from 'react'

interface AddressDisplayProps {
  address: string
  ensName: string
}

export function AddressDisplay({ address, ensName }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-green-900 mb-1">ENS Name</h2>
        <p className="font-mono text-lg text-green-800">{ensName}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-green-900 mb-1">Resolved Address</h2>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm break-all text-green-800 flex-1">{address}</p>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <a
        href={`https://etherscan.io/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium inline-flex items-center gap-1"
      >
        View on Etherscan
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}
