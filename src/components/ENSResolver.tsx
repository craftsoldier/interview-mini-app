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

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
)

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
)

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
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
              {/* Avatar - show actual image if available, otherwise fallback to letter */}
              {result.textRecords?.avatar ? (
                <div className="w-20 h-20 pixel-avatar overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.textRecords.avatar.startsWith('ipfs://')
                      ? `https://ipfs.io/ipfs/${result.textRecords.avatar.replace('ipfs://', '')}`
                      : result.textRecords.avatar}
                    alt={`${result.ensName} avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to letter on error
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        const fallback = document.createElement('span')
                        fallback.className = 'pixel-title text-2xl text-[var(--retro-white)]'
                        fallback.textContent = result.ensName.charAt(0).toUpperCase()
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 pixel-avatar flex items-center justify-center">
                  <span className="pixel-title text-2xl text-[var(--retro-white)]">
                    {result.ensName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h2 className="pixel-title text-xl text-[var(--retro-white)] mb-2">{result.ensName}</h2>
                {result.textRecords?.description && (
                  <p className="terminal-text text-[var(--retro-white-dim)] mb-3 text-sm max-w-md">
                    {result.textRecords.description}
                  </p>
                )}
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

            {/* Social & Contact Card - only show if any records exist */}
            {(result.textRecords?.twitter || result.textRecords?.github || result.textRecords?.email || result.textRecords?.url) && (
              <div className="retro-card fade-in-up delay-500">
                <div className="retro-card-header">
                  <span className="retro-card-header-title">Social & Links</span>
                </div>
                <div className="p-5 space-y-3">
                  {result.textRecords?.twitter && (
                    <a
                      href={`https://twitter.com/${result.textRecords.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#000000] border-2 border-[var(--retro-gray)] flex items-center justify-center text-white">
                          <TwitterIcon />
                        </div>
                        <span className="terminal-text">@{result.textRecords.twitter.replace('@', '')}</span>
                      </div>
                      <ExternalLinkIcon />
                    </a>
                  )}

                  {result.textRecords?.github && (
                    <a
                      href={`https://github.com/${result.textRecords.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#24292e] border-2 border-[var(--retro-gray)] flex items-center justify-center text-white">
                          <GitHubIcon />
                        </div>
                        <span className="terminal-text">{result.textRecords.github}</span>
                      </div>
                      <ExternalLinkIcon />
                    </a>
                  )}

                  {result.textRecords?.url && (
                    <a
                      href={result.textRecords.url.startsWith('http') ? result.textRecords.url : `https://${result.textRecords.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--eth-blue)] border-2 border-[var(--retro-gray)] flex items-center justify-center text-white">
                          <LinkIcon />
                        </div>
                        <span className="terminal-text truncate max-w-[200px]">{result.textRecords.url.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <ExternalLinkIcon />
                    </a>
                  )}

                  {result.textRecords?.email && (
                    <a
                      href={`mailto:${result.textRecords.email}`}
                      className="link-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ea4335] border-2 border-[var(--retro-gray)] flex items-center justify-center text-white">
                          <EmailIcon />
                        </div>
                        <span className="terminal-text">{result.textRecords.email}</span>
                      </div>
                      <ExternalLinkIcon />
                    </a>
                  )}
                </div>
              </div>
            )}
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
