// components/AddressDisplay.tsx
'use client'

import { useState } from 'react'

interface AddressDisplayProps {
  address: string
  ensName: string
}

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

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

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <>
      {/* Name row */}
      <div className="info-row">
        <span className="info-label">Name</span>
        <span className="info-value mono-text">{ensName}</span>
      </div>

      {/* ETH Address row */}
      <div className="info-row">
        <span className="info-label">ETH</span>
        <div className="flex items-center gap-2">
          <span className="info-value text-[var(--eth-blue)] text-glow mono-text">
            {truncateAddress(address)}
          </span>
          <button
            onClick={handleCopy}
            className="copy-btn"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? (
              <span className="text-[var(--retro-green)]"><CheckIcon /></span>
            ) : (
              <CopyIcon />
            )}
          </button>
        </div>
      </div>

      {/* Etherscan link row */}
      <div className="info-row">
        <span className="info-label">Explorer</span>
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="retro-link inline-flex items-center gap-1 terminal-text"
        >
          Etherscan
          <ExternalLinkIcon />
        </a>
      </div>
    </>
  )
}
