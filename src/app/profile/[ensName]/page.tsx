import { ENSResolver } from '@/components/ENSResolver'
import Link from 'next/link'

export default function ProfilePage({ params }: { params: { ensName: string } }) {
  const ensName = decodeURIComponent(params.ensName)

  return (
    <div className="min-h-screen p-6">
      {/* Retro back navigation */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link
          href="/graph"
          className="inline-flex items-center gap-2 retro-btn-secondary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Graph</span>
        </Link>
      </div>

      <ENSResolver initialName={ensName} />
    </div>
  )
}
