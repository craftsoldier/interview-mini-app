import { ENSResolver } from '@/components/ENSResolver'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <ENSResolver />
    </main>
  )
}
