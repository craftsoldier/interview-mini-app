'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useRelationships } from '@/hooks/useRelationships'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

export function ENSGraphEditable() {
  const router = useRouter()
  const graphRef = useRef<any>(null)

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

    // Basic validation
    if (!source.includes('.') || !target.includes('.')) {
      setFormError('Both must be valid ENS names (e.g., vitalik.eth)')
      return
    }

    setIsAdding(true)
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 p-4 border-r bg-gray-50 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">ENS Social Graph</h2>

        {/* Add Edge Form */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Add Connection</h3>
          <form onSubmit={handleAddEdge} className="space-y-2">
            <input
              type="text"
              value={sourceInput}
              onChange={e => setSourceInput(e.target.value)}
              placeholder="vitalik.eth"
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={isAdding}
            />
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              placeholder="balajis.eth"
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !sourceInput || !targetInput}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Edge'}
            </button>
          </form>
          {formError && (
            <p className="mt-2 text-sm text-red-600">{formError}</p>
          )}
        </div>

        {/* Delete Edge */}
        {selectedEdge && (
          <div className="mb-6 p-3 bg-red-50 rounded">
            <h3 className="font-semibold mb-2">Delete Connection</h3>
            <p className="text-sm mb-2">
              {selectedEdge.source} - {selectedEdge.target}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteEdge}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedEdge(null)}
                className="flex-1 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-gray-600">
          <p>{graphData.nodes.length} nodes</p>
          <p>{graphData.links.length} edges</p>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-1"><strong>Click node</strong>: View profile</p>
          <p><strong>Click edge</strong>: Select to delete</p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
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
              ctx.font = `${fontSize}px sans-serif`
              ctx.textAlign = 'center'
              ctx.fillStyle = '#1f2937'
              ctx.fillText(label, node.x!, node.y! + 12)
            }}
            linkColor={(link: any) => {
              // Highlight selected edge
              if (selectedEdge && link.id === selectedEdge.id) {
                return '#ef4444'
              }
              return '#9ca3af'
            }}
            linkWidth={(link: any) => {
              return selectedEdge && link.id === selectedEdge.id ? 3 : 1
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Add connections to build the graph
          </div>
        )}
      </div>
    </div>
  )
}
