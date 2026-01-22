'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphData {
  nodes: { id: string }[]
  links: { source: string; target: string }[]
}

export function ENSGraph() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse pairs from input (format: "ens1.eth, ens2.eth" per line)
    const lines = input.trim().split('\n')
    const nodeSet = new Set<string>()
    const links: { source: string; target: string }[] = []

    for (const line of lines) {
      const [ens1, ens2] = line.split(/[,\s]+/).map(s => s.trim().toLowerCase())
      if (ens1 && ens2 && ens1.includes('.') && ens2.includes('.')) {
        nodeSet.add(ens1)
        nodeSet.add(ens2)
        links.push({ source: ens1, target: ens2 })
      }
    }

    setGraphData({
      nodes: Array.from(nodeSet).map(id => ({ id })),
      links
    })
  }

  const handleNodeClick = (node: { id?: string | number }) => {
    if (node.id) {
      router.push(`/profile/${encodeURIComponent(String(node.id))}`)
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Retro Sidebar */}
      <div className="w-80 border-r-3 border-[var(--eth-blue)] bg-[var(--retro-dark)]">
        <div className="retro-card-header">
          <span className="retro-card-header-title">ENS Pairs Input</span>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Terminal-style label */}
            <div className="terminal-text text-[var(--retro-white-muted)] text-sm mb-2">
              <span className="text-[var(--eth-blue)]">&gt;</span> Enter pairs (one per line):
            </div>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`vitalik.eth, balajis.eth\nnick.eth, brantly.eth`}
              className="retro-input w-full h-40 resize-none mono-text text-sm"
            />

            <button
              type="submit"
              className="retro-btn w-full mt-4"
            >
              Build Graph
            </button>
          </form>

          {/* Stats display */}
          {graphData.nodes.length > 0 && (
            <div className="mt-6 retro-card">
              <div className="retro-card-header">
                <span className="retro-card-header-title">Stats</span>
              </div>
              <div className="p-4">
                <div className="info-row">
                  <span className="info-label">Nodes</span>
                  <span className="info-value text-[var(--retro-green)]">
                    {graphData.nodes.length}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Edges</span>
                  <span className="info-value text-[var(--eth-blue)]">
                    {graphData.links.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 terminal-text text-[var(--retro-white-muted)] text-sm">
            <div className="text-[var(--eth-blue)] mb-2">[INFO]</div>
            <p className="mb-2">Click on any node to view the ENS profile.</p>
            <p>Format: one pair per line, separated by comma.</p>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 bg-[var(--retro-black)] relative">
        {/* Grid overlay for retro feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--retro-gray) 1px, transparent 1px),
              linear-gradient(90deg, var(--retro-gray) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="id"
            onNodeClick={handleNodeClick}
            backgroundColor="#0a0a0a"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id as string
              const fontSize = 14 / globalScale

              // Draw pixel-style node (square instead of circle)
              const size = 8
              ctx.fillStyle = '#627EEA'
              ctx.shadowColor = '#627EEA'
              ctx.shadowBlur = 10
              ctx.fillRect(node.x! - size/2, node.y! - size/2, size, size)

              // Draw border
              ctx.strokeStyle = '#8299FF'
              ctx.lineWidth = 2 / globalScale
              ctx.strokeRect(node.x! - size/2, node.y! - size/2, size, size)

              // Reset shadow for text
              ctx.shadowBlur = 0

              // Draw label with retro font style
              ctx.font = `${fontSize}px "Share Tech Mono", monospace`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              ctx.fillStyle = '#f0f0f0'
              ctx.fillText(label, node.x!, node.y! + size/2 + 4)
            }}
            linkColor={() => '#3a3a3a'}
            linkWidth={2}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {/* ASCII art placeholder */}
              <pre className="terminal-text text-[var(--eth-blue)] text-xs mb-6">
{`
    ╔══════════════════════════════╗
    ║                              ║
    ║    ┌───┐     ┌───┐          ║
    ║    │ A ├─────┤ B │          ║
    ║    └───┘     └─┬─┘          ║
    ║                │            ║
    ║             ┌──┴──┐         ║
    ║             │  C  │         ║
    ║             └─────┘         ║
    ║                              ║
    ╚══════════════════════════════╝
`}
              </pre>
              <p className="terminal-text text-[var(--retro-white-muted)] text-lg">
                <span className="text-[var(--eth-blue)]">&gt;</span> Enter ENS pairs to visualize the network
                <span className="blink">_</span>
              </p>
            </div>
          </div>
        )}

        {/* Scanline overlay on graph */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
      </div>
    </div>
  )
}
