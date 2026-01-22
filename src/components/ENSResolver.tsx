// components/ENSResolver.tsx
'use client'

import { useState, useEffect } from 'react'
import { useENSResolver } from '@/hooks/useENSResolver'

interface ENSResolverProps {
  initialName?: string
}

const QUICK_TRY_NAMES = ['vitalik.eth', 'nick.eth', 'brantly.eth']

// Retro-styled icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

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
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const EthereumIcon = () => (
  <svg className="w-5 h-5 eth-glow" viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 0l-0.21 0.713v21.271l0.21 0.21 9.787-5.786z" fillOpacity="0.6"/>
    <path d="M16 0l-9.787 16.408 9.787 5.786v-10.469z"/>
    <path d="M16 24.018l-0.118 0.144v7.514l0.118 0.324 9.793-13.796z" fillOpacity="0.6"/>
    <path d="M16 32v-7.982l-9.787-5.814z"/>
    <path d="M16 22.194l9.787-5.786-9.787-4.447z" fillOpacity="0.2"/>
    <path d="M6.213 16.408l9.787 5.786v-10.233z" fillOpacity="0.6"/>
  </svg>
)

export function ENSResolver({ initialName }: ENSResolverProps) {
  const [inputValue, setInputValue] = useState(initialName || '')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { result, isLoading, error, resolve } = useENSResolver()

  // Auto-resolve when initialName is provided
  useEffect(() => {
    if (initialName) {
      resolve(initialName)
    }
  }, [initialName, resolve])

  const handleSearch = async () => {
    if (inputValue.trim() && !isLoading) {
      await resolve(inputValue.trim())
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleSearch()
    }
  }

  const handleQuickTry = async (name: string) => {
    setInputValue(name)
    await resolve(name)
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const hasResult = result && result.isValid && result.address

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-12 md:py-20">
      {/* Retro Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 fade-in-up">
        {/* ASCII Art Header */}
        <div className="mb-6 terminal-text text-[var(--eth-blue)] text-xs hidden md:block">
          <pre className="inline-block text-left">
{`╔═══════════════════════════════════════════════════╗
║  ███████╗███╗   ██╗███████╗                       ║
║  ██╔════╝████╗  ██║██╔════╝                       ║
║  █████╗  ██╔██╗ ██║███████╗                       ║
║  ██╔══╝  ██║╚██╗██║╚════██║                       ║
║  ███████╗██║ ╚████║███████║                       ║
║  ╚══════╝╚═╝  ╚═══╝╚══════╝  EXPLORER             ║
╚═══════════════════════════════════════════════════╝`}
          </pre>
        </div>

        {/* Mobile title */}
        <h1 className="md:hidden pixel-title text-2xl text-[var(--eth-blue)] mb-6">
          ENS Explorer
        </h1>

        <p className="terminal-text text-lg text-[var(--retro-white-dim)] leading-relaxed max-w-xl mx-auto">
          <span className="text-[var(--eth-blue)]">&gt;</span> Discover decentralized identities on the Ethereum blockchain
          <span className="blink">_</span>
        </p>
      </div>

      {/* Search Section */}
      <div className="w-full max-w-2xl mx-auto mb-8 fade-in-up delay-100">
        <div className="retro-card p-6">
          <div className="retro-card-header -mx-6 -mt-6 mb-6">
            <span className="retro-card-header-title">Search ENS</span>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter ENS name (e.g. vitalik.eth)"
              disabled={isLoading}
              className="retro-input flex-1"
              aria-label="ENS name search"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !inputValue.trim()}
              className="retro-btn flex items-center gap-2"
              aria-label="Search"
            >
              {isLoading ? (
                <div className="retro-spinner" />
              ) : (
                <>
                  <SearchIcon />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Try */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <span className="terminal-text text-[var(--retro-white-muted)] text-sm">TRY:</span>
            {QUICK_TRY_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => handleQuickTry(name)}
                disabled={isLoading}
                className="quick-try"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-2xl mx-auto mb-8 fade-in-up">
          <div className="retro-card p-6 border-[var(--retro-red)]">
            <div className="retro-card-header -mx-6 -mt-6 mb-4 bg-gradient-to-r from-[var(--retro-red)] to-[#aa2222]">
              <span className="retro-card-header-title">Error</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--retro-red)] terminal-text text-lg">
                <span className="text-[var(--retro-red)]">[!]</span> {error}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasResult && (
        <div className="w-full max-w-5xl mx-auto fade-in-up delay-200">
          {/* Profile Header Card */}
          <div className="retro-card p-6 mb-6">
            <div className="retro-card-header -mx-6 -mt-6 mb-6">
              <span className="retro-card-header-title">Profile</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pixel Avatar */}
              <div className="w-20 h-20 pixel-avatar flex items-center justify-center">
                <span className="pixel-title text-2xl text-[var(--retro-white)]">
                  {result.ensName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="pixel-title text-xl text-[var(--retro-white)] mb-3">{result.ensName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <span className="retro-tag retro-tag-success">
                    <span className="w-2 h-2 bg-[var(--retro-green)]" />
                    Resolved
                  </span>
                  <span className="retro-tag retro-tag-info">
                    <EthereumIcon />
                    Mainnet
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-3">
                <a
                  href={`https://app.ens.domains/${result.ensName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn-secondary inline-flex items-center gap-2"
                >
                  ENS App <ExternalLinkIcon />
                </a>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="metadata-grid">
            {/* General Info Card */}
            <div className="retro-card fade-in-up delay-300">
              <div className="retro-card-header">
                <span className="retro-card-header-title">General Info</span>
              </div>
              <div className="p-5">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">
                    {result.ensName}
                    <button
                      onClick={() => handleCopy(result.ensName, 'name')}
                      className="copy-btn"
                      title="Copy name"
                    >
                      {copiedField === 'name' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">ETH Address</span>
                  <span className="info-value">
                    <span className="text-[var(--eth-blue)] text-glow">{truncateAddress(result.address!)}</span>
                    <button
                      onClick={() => handleCopy(result.address!, 'address')}
                      className="copy-btn"
                      title="Copy address"
                    >
                      {copiedField === 'address' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Full Address</span>
                  <span className="info-value text-xs break-all">
                    <span className="hidden md:inline mono-text">{result.address}</span>
                    <span className="md:hidden mono-text">{truncateAddress(result.address!)}</span>
                    <button
                      onClick={() => handleCopy(result.address!, 'fullAddress')}
                      className="copy-btn"
                      title="Copy full address"
                    >
                      {copiedField === 'fullAddress' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Links Card */}
            <div className="retro-card fade-in-up delay-400">
              <div className="retro-card-header">
                <span className="retro-card-header-title">Quick Links</span>
              </div>
              <div className="p-5 space-y-3">
                <a
                  href={`https://etherscan.io/address/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#21325b] border-2 border-[var(--retro-gray)] flex items-center justify-center">
                      <span className="text-[var(--retro-white)] text-xs font-bold">ES</span>
                    </div>
                    <span className="terminal-text">Etherscan</span>
                  </div>
                  <ExternalLinkIcon />
                </a>

                <a
                  href={`https://rainbow.me/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 border-2 border-[var(--retro-gray)] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <span className="terminal-text">Rainbow</span>
                  </div>
                  <ExternalLinkIcon />
                </a>

                <a
                  href={`https://opensea.io/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2081E2] border-2 border-[var(--retro-gray)] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">OS</span>
                    </div>
                    <span className="terminal-text">OpenSea</span>
                  </div>
                  <ExternalLinkIcon />
                </a>

                <a
                  href={`https://zapper.xyz/account/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#784FFE] border-2 border-[var(--retro-gray)] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="terminal-text">Zapper</span>
                  </div>
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>

            {/* Network Info Card */}
            <div className="retro-card fade-in-up delay-500">
              <div className="retro-card-header">
                <span className="retro-card-header-title">Network</span>
              </div>
              <div className="p-5">
                <div className="info-row">
                  <span className="info-label">Chain</span>
                  <span className="info-value">
                    <EthereumIcon />
                    <span className="terminal-text">Ethereum Mainnet</span>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Chain ID</span>
                  <span className="info-value mono-text">1</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Resolver</span>
                  <span className="info-value">
                    <span className="retro-tag retro-tag-success text-xs">Public Resolver</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no search yet */}
      {!hasResult && !error && !isLoading && (
        <div className="text-center mt-8 fade-in delay-300">
          <div className="w-16 h-16 mx-auto mb-4 pixel-avatar flex items-center justify-center">
            <EthereumIcon />
          </div>
          <p className="terminal-text text-[var(--retro-white-muted)]">
            <span className="text-[var(--eth-blue)]">&gt;</span> Enter an ENS name above to explore
            <span className="blink">_</span>
          </p>
        </div>
      )}
    </div>
  )
}
