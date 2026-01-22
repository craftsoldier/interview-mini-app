'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useRelationships } from '@/hooks/useRelationships'
import { resolveENSName } from '@/lib/ens'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

export function ENSGraphEditable() {
  const router = useRouter()
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Track container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Database-backed relationships
  const {
    isLoading,
    error,
    addRelationship,
    deleteRelationship,
    toGraphData
  } = useRelationships()

  // Form state for adding edges
  const [sourceInput, setSourceInput] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Selected edge for deletion
  const [selectedEdge, setSelectedEdge] = useState<{ id: string; source: string; target: string } | null>(null)

  const graphData = toGraphData()

  // Handle adding a new edge
  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const source = sourceInput.trim().toLowerCase()
    const target = targetInput.trim().toLowerCase()

    // Basic format validation
    if (!source.includes('.') || !target.includes('.')) {
      setFormError('Both must be valid ENS names (e.g., vitalik.eth)')
      return
    }

    setIsAdding(true)

    // Validate both ENS names resolve on Ethereum
    const [sourceResult, targetResult] = await Promise.all([
      resolveENSName(source),
      resolveENSName(target)
    ])

    if (!sourceResult.isValid) {
      setFormError(`"${source}" is not a registered ENS name`)
      setIsAdding(false)
      return
    }

    if (!targetResult.isValid) {
      setFormError(`"${target}" is not a registered ENS name`)
      setIsAdding(false)
      return
    }

    const result = await addRelationship(source, target)
    setIsAdding(false)

    if (result.success) {
      setSourceInput('')
      setTargetInput('')
    } else {
      setFormError(result.error || 'Failed to add edge')
    }
  }

  // Handle deleting selected edge
  const handleDeleteEdge = async () => {
    if (!selectedEdge) return

    const result = await deleteRelationship(selectedEdge.id)
    if (result.success) {
      setSelectedEdge(null)
    }
  }

  // Node click -> navigate to profile
  const handleNodeClick = (node: { id?: string | number }) => {
    if (node.id) {
      router.push(`/profile/${encodeURIComponent(String(node.id))}`)
    }
  }

  // Link click -> select for deletion
  const handleLinkClick = (link: any) => {
    setSelectedEdge({
      id: link.id,
      source: typeof link.source === 'object' ? link.source.id : link.source,
      target: typeof link.target === 'object' ? link.target.id : link.target
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="terminal-text text-[var(--eth-blue)] text-lg">LOADING<span className="blink">_</span></span>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 shrink-0 p-4 border-r-2 border-[var(--retro-gray)] bg-[var(--retro-dark)] overflow-y-auto">
        <h2 className="pixel-title text-lg text-[var(--eth-blue)] mb-4">&gt; SOCIAL GRAPH</h2>

        {/* Add Edge Form */}
        <div className="mb-6">
          <h3 className="terminal-text text-[var(--retro-green)] mb-2 text-sm">ADD CONNECTION</h3>
          <form onSubmit={handleAddEdge} className="space-y-2">
            <input
              type="text"
              value={sourceInput}
              onChange={e => setSourceInput(e.target.value)}
              placeholder="vitalik.eth"
              className="w-full px-3 py-2 bg-[var(--retro-darker)] border-2 border-[var(--retro-gray)] text-[var(--retro-white)] text-sm font-mono focus:border-[var(--eth-blue)] focus:outline-none"
              disabled={isAdding}
            />
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              placeholder="balajis.eth"
              className="w-full px-3 py-2 bg-[var(--retro-darker)] border-2 border-[var(--retro-gray)] text-[var(--retro-white)] text-sm font-mono focus:border-[var(--eth-blue)] focus:outline-none"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !sourceInput || !targetInput}
              className="w-full py-2 bg-[var(--retro-green)] text-[var(--retro-darker)] font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isAdding ? 'ADDING...' : '+ ADD EDGE'}
            </button>
          </form>
          {formError && (
            <p className="mt-2 text-sm text-[var(--retro-pink)]">{formError}</p>
          )}
        </div>

        {/* Delete Edge */}
        {selectedEdge && (
          <div className="mb-6 p-3 border-2 border-[var(--retro-pink)] bg-[var(--retro-darker)]">
            <h3 className="terminal-text text-[var(--retro-pink)] mb-2 text-sm">DELETE CONNECTION</h3>
            <p className="text-sm mb-2 text-[var(--retro-white)] font-mono">
              {selectedEdge.source} ↔ {selectedEdge.target}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteEdge}
                className="flex-1 py-2 bg-[var(--retro-pink)] text-[var(--retro-darker)] font-bold text-sm hover:brightness-110"
              >
                DELETE
              </button>
              <button
                onClick={() => setSelectedEdge(null)}
                className="flex-1 py-2 border-2 border-[var(--retro-gray)] text-[var(--retro-white-dim)] text-sm hover:border-[var(--retro-white)]"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-[var(--retro-white-dim)] font-mono">
          <p>{graphData.nodes.length} nodes</p>
          <p>{graphData.links.length} edges</p>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-[var(--retro-white-muted)] font-mono">
          <p className="mb-1"><span className="text-[var(--eth-blue)]">CLICK NODE</span>: View profile</p>
          <p><span className="text-[var(--eth-blue)]">CLICK EDGE</span>: Select to delete</p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-[var(--retro-pink)]">{error}</p>
        )}
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel="id"
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id as string
              const fontSize = 12 / globalScale
              ctx.beginPath()
              ctx.arc(node.x!, node.y!, 6, 0, 2 * Math.PI)
              ctx.fillStyle = '#3b82f6'
              ctx.fill()
              ctx.font = `${fontSize}px monospace`
              ctx.textAlign = 'center'
              ctx.fillStyle = '#00ffff'
              ctx.fillText(label, node.x!, node.y! + 14)
            }}
            linkColor={(link: any) => {
              // Highlight selected edge
              if (selectedEdge && link.id === selectedEdge.id) {
                return '#ff6b9d'
              }
              return '#4a5568'
            }}
            linkWidth={(link: any) => {
              return selectedEdge && link.id === selectedEdge.id ? 3 : 1
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="terminal-text text-[var(--retro-white-muted)]">&gt; Add connections to build the graph</span>
          </div>
        )}
      </div>
    </div>
  )
}
