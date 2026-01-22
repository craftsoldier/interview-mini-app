import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'ENS Explorer | Retro Edition',
  description: 'Search any ENS name to view their profile, records, and collectibles on the Ethereum blockchain.',
}

// Retro navigation icons
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const GraphIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const EthereumLogo = () => (
  <svg className="w-6 h-6 eth-glow" viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 0l-0.21 0.713v21.271l0.21 0.21 9.787-5.786z" fillOpacity="0.6"/>
    <path d="M16 0l-9.787 16.408 9.787 5.786v-10.469z"/>
    <path d="M16 24.018l-0.118 0.144v7.514l0.118 0.324 9.793-13.796z" fillOpacity="0.6"/>
    <path d="M16 32v-7.982l-9.787-5.814z"/>
    <path d="M16 22.194l9.787-5.786-9.787-4.447z" fillOpacity="0.2"/>
    <path d="M6.213 16.408l9.787 5.786v-10.233z" fillOpacity="0.6"/>
  </svg>
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Retro grid background */}
        <div className="retro-bg" />

        {/* CRT scanlines overlay */}
        <div className="scanlines" />

        {/* Main content wrapper */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Retro Navigation Bar */}
          <nav className="retro-nav">
            <div className="flex items-center">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-3 px-5 py-3 border-r-2 border-[var(--retro-gray)] hover:bg-[var(--retro-gray)] transition-colors"
              >
                <EthereumLogo />
                <span className="pixel-title text-sm text-[var(--eth-blue)]">ENS</span>
              </Link>

              {/* Nav Items */}
              <Link href="/" className="nav-item">
                <SearchIcon />
                <span>Search</span>
              </Link>

              <Link href="/graph" className="nav-item">
                <GraphIcon />
                <span>Graph</span>
              </Link>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Status indicator */}
              <div className="flex items-center gap-2 px-4 py-3 border-l-2 border-[var(--retro-gray)]">
                <span className="w-2 h-2 bg-[var(--retro-green)] animate-pulse" />
                <span className="terminal-text text-[var(--retro-white-dim)] text-sm">MAINNET</span>
              </div>
            </div>
          </nav>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Retro Footer */}
          <footer className="border-t-2 border-[var(--retro-gray)] bg-[var(--retro-dark)] py-4 px-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="terminal-text text-[var(--retro-white-muted)] text-sm">
                <span className="text-[var(--eth-blue)]">&gt;</span> ENS EXPLORER v1.0
              </div>
              <div className="terminal-text text-[var(--retro-white-muted)] text-sm flex items-center gap-4">
                <span>ETHEREUM MAINNET</span>
                <span className="text-[var(--eth-blue)]">|</span>
                <span>CHAIN ID: 1</span>
                <span className="blink">_</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
