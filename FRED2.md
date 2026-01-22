# ENS Social Network Graph - Phase 2: Graph Visualization

## Overview

Extend the ENS Profile Viewer to visualize social connections between ENS identities as an interactive graph. Users input ENS name pairs, and the app renders a clickable network diagram.

**Time Budget**: ~45-60 minutes (within 2-hour total interview)

## Requirements (From Interview Task)

> "Take in a list of ENS name pairs like (vitalik.eth, balajis.eth) to create an in-browser graph-based visualization. Make each node clickable such that it routes to the corresponding profile page."

## Minimal Implementation

### Library Choice: react-force-graph-2d

Simple, React-native, works out of the box.

```bash
npm install react-force-graph-2d
```

### Data Structure

```typescript
// types/graph.ts
export interface GraphNode {
  id: string        // ENS name
  address?: string  // Resolved address
}

export interface GraphData {
  nodes: GraphNode[]
  links: { source: string; target: string }[]
}
```

### Simple Graph Component

```typescript
// components/ENSGraph.tsx
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

  const handleNodeClick = (node: { id: string }) => {
    router.push(`/profile/${encodeURIComponent(node.id)}`)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 p-4 border-r bg-gray-50">
        <h2 className="font-bold mb-2">ENS Pairs</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="vitalik.eth, balajis.eth&#10;nick.eth, brantly.eth"
            className="w-full h-40 p-2 border rounded text-sm font-mono"
          />
          <button
            type="submit"
            className="mt-2 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Build Graph
          </button>
        </form>

        {graphData.nodes.length > 0 && (
          <p className="mt-4 text-sm text-gray-600">
            {graphData.nodes.length} nodes, {graphData.links.length} edges
          </p>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="id"
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id as string
              const fontSize = 12 / globalScale
              ctx.beginPath()
              ctx.arc(node.x!, node.y!, 5, 0, 2 * Math.PI)
              ctx.fillStyle = '#3b82f6'
              ctx.fill()
              ctx.font = `${fontSize}px sans-serif`
              ctx.textAlign = 'center'
              ctx.fillStyle = '#1f2937'
              ctx.fillText(label, node.x!, node.y! + 10)
            }}
            linkColor={() => '#d1d5db'}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Enter ENS pairs to visualize
          </div>
        )}
      </div>
    </div>
  )
}
```

### Profile Page Route

```typescript
// app/profile/[ensName]/page.tsx
import { ENSResolver } from '@/components/ENSResolver'

export default function ProfilePage({ params }: { params: { ensName: string } }) {
  const ensName = decodeURIComponent(params.ensName)

  return (
    <div className="min-h-screen p-6">
      <a href="/graph" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Graph
      </a>
      <ENSResolver initialName={ensName} />
    </div>
  )
}
```

### Graph Page

```typescript
// app/graph/page.tsx
import { ENSGraph } from '@/components/ENSGraph'

export default function GraphPage() {
  return <ENSGraph />
}
```

## File Structure

```
src/
├── app/
│   ├── page.tsx           # Home (ENS resolver)
│   ├── graph/
│   │   └── page.tsx       # Graph visualization
│   └── profile/
│       └── [ensName]/
│           └── page.tsx   # Profile page
├── components/
│   ├── ENSResolver.tsx    # From Phase 1
│   └── ENSGraph.tsx       # New: graph component
└── types/
    └── graph.ts           # Graph types
```

## Implementation Steps

1. **Install dependency** (~2 min)
   ```bash
   npm install react-force-graph-2d
   ```

2. **Create graph types** (~2 min)
   - Simple node/link interfaces

3. **Build ENSGraph component** (~20 min)
   - Text input for pairs
   - Parse input into nodes/links
   - Render with react-force-graph-2d
   - Handle node clicks → navigate to profile

4. **Create routes** (~10 min)
   - `/graph` page
   - `/profile/[ensName]` page

5. **Test with real ENS names** (~10 min)
   - vitalik.eth, balajis.eth
   - Verify navigation works

## Example Input

```
vitalik.eth, balajis.eth
vitalik.eth, nick.eth
balajis.eth, naval.eth
nick.eth, brantly.eth
```

## What to Skip (Time Constraints)

- ENS resolution in the graph (just show names, resolve on profile page)
- Fancy node styling (avatars, colors by status)
- Graph controls (zoom buttons - built-in mouse controls work)
- Validation with Zod (basic string checks are fine)
- Batch resolution hooks
- Loading states for graph
- Error boundaries

## Optional Enhancements (If Time Permits)

1. **Pre-resolve addresses**: Show address on hover
2. **Node sizing**: Bigger nodes for more connections
3. **Example data button**: Load sample ENS pairs

---

**Phase**: 2 - Graph Visualization
**Estimated Time**: 45-60 minutes
**Prerequisites**: Phase 1 working
