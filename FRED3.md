# ENS Social Network Graph - Phase 3: Editable Edges with Database

## Overview

Extend the graph visualization to support editable edges. Users can add and delete connections between ENS identities directly from the browser, with changes persisted to a PostgreSQL database.

**Time Budget**: ~45-60 minutes (within 3-hour total exam)

## Requirements (From Interview Task)

> "Extend your app further to make the edges editable, such that a user can add or delete edges from the browser. Your edits should be stored as friend relationships in a database like PostgreSQL, using a web framework like Django to intermediate between the browser actions and the database state."

## Technical Stack

### Database: Supabase (PostgreSQL)
- Managed PostgreSQL with instant API
- Free tier sufficient for demo
- Easy integration with Next.js
- Real-time subscriptions (optional enhancement)

### Backend: Next.js API Routes
- Already using Next.js, no need for Django
- Server-side API routes handle CRUD operations
- TypeScript type safety end-to-end

## Database Schema

### Relationships Table

```sql
-- Supabase SQL Editor
CREATE TABLE relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_ens VARCHAR(255) NOT NULL,
  target_ens VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate edges (order-independent)
  CONSTRAINT unique_relationship UNIQUE (source_ens, target_ens)
);

-- Index for faster lookups
CREATE INDEX idx_relationships_source ON relationships(source_ens);
CREATE INDEX idx_relationships_target ON relationships(target_ens);

-- Enable Row Level Security (optional for demo)
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Allow all operations for demo (in production, add auth)
CREATE POLICY "Allow all" ON relationships FOR ALL USING (true);
```

## Implementation

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the relationships table
export interface Relationship {
  id: string
  source_ens: string
  target_ens: string
  created_at: string
}
```

### 4. API Routes

```typescript
// app/api/relationships/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all relationships
export async function GET() {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST - Add a new relationship
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { source_ens, target_ens } = body

  // Validate input
  if (!source_ens || !target_ens) {
    return NextResponse.json(
      { error: 'source_ens and target_ens are required' },
      { status: 400 }
    )
  }

  // Normalize ENS names
  const source = source_ens.toLowerCase().trim()
  const target = target_ens.toLowerCase().trim()

  // Prevent self-loops
  if (source === target) {
    return NextResponse.json(
      { error: 'Cannot create relationship with self' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('relationships')
    .insert({ source_ens: source, target_ens: target })
    .select()
    .single()

  if (error) {
    // Handle duplicate constraint
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Relationship already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// DELETE - Remove a relationship
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const source = searchParams.get('source')
  const target = searchParams.get('target')

  let query = supabase.from('relationships').delete()

  if (id) {
    // Delete by ID
    query = query.eq('id', id)
  } else if (source && target) {
    // Delete by source/target pair
    query = query
      .eq('source_ens', source.toLowerCase())
      .eq('target_ens', target.toLowerCase())
  } else {
    return NextResponse.json(
      { error: 'Provide id OR (source and target)' },
      { status: 400 }
    )
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### 5. React Hook for Relationships

```typescript
// hooks/useRelationships.ts
import { useState, useEffect, useCallback } from 'react'
import { Relationship } from '@/lib/supabase'

interface GraphData {
  nodes: { id: string }[]
  links: { source: string; target: string; id?: string }[]
}

export function useRelationships() {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch relationships from database
  const fetchRelationships = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/relationships')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRelationships(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add a new relationship
  const addRelationship = useCallback(async (source: string, target: string) => {
    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_ens: source, target_ens: target })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add')
      }

      const newRelationship = await res.json()
      setRelationships(prev => [newRelationship, ...prev])
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed' }
    }
  }, [])

  // Delete a relationship
  const deleteRelationship = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/relationships?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete')

      setRelationships(prev => prev.filter(r => r.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed' }
    }
  }, [])

  // Convert relationships to graph data
  const toGraphData = useCallback((): GraphData => {
    const nodeSet = new Set<string>()
    const links: { source: string; target: string; id: string }[] = []

    for (const rel of relationships) {
      nodeSet.add(rel.source_ens)
      nodeSet.add(rel.target_ens)
      links.push({
        source: rel.source_ens,
        target: rel.target_ens,
        id: rel.id
      })
    }

    return {
      nodes: Array.from(nodeSet).map(id => ({ id })),
      links
    }
  }, [relationships])

  // Load on mount
  useEffect(() => {
    fetchRelationships()
  }, [fetchRelationships])

  return {
    relationships,
    isLoading,
    error,
    addRelationship,
    deleteRelationship,
    refresh: fetchRelationships,
    toGraphData
  }
}
```

### 6. Updated Graph Component with Edit Controls

```typescript
// components/ENSGraphEditable.tsx
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
  const handleNodeClick = (node: { id: string }) => {
    router.push(`/profile/${encodeURIComponent(node.id)}`)
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
              {selectedEdge.source} ↔ {selectedEdge.target}
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
```

### 7. Graph Page Update

```typescript
// app/graph/page.tsx
import { ENSGraphEditable } from '@/components/ENSGraphEditable'

export default function GraphPage() {
  return <ENSGraphEditable />
}
```

## File Structure (Phase 3 Additions)

```
src/
├── app/
│   ├── api/
│   │   └── relationships/
│   │       └── route.ts        # NEW: CRUD API
│   └── graph/
│       └── page.tsx            # Updated to use ENSGraphEditable
├── components/
│   └── ENSGraphEditable.tsx    # NEW: Graph with edit controls
├── hooks/
│   └── useRelationships.ts     # NEW: Database hook
└── lib/
    └── supabase.ts             # NEW: Supabase client
```

## Implementation Steps

1. **Set up Supabase** (~10 min)
   - Create project at supabase.com
   - Run SQL to create `relationships` table
   - Copy URL and anon key to `.env.local`

2. **Install dependency** (~2 min)
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Create Supabase client** (~2 min)
   - `lib/supabase.ts`

4. **Build API routes** (~15 min)
   - GET, POST, DELETE handlers
   - Input validation
   - Error handling

5. **Create useRelationships hook** (~10 min)
   - CRUD operations
   - State management
   - Graph data conversion

6. **Build ENSGraphEditable component** (~15 min)
   - Add edge form
   - Delete edge UI
   - Integrate with graph visualization

7. **Test CRUD operations** (~10 min)
   - Add edges
   - Delete edges
   - Verify persistence after refresh

## API Reference

### GET /api/relationships
Returns all relationships.

**Response:**
```json
[
  {
    "id": "uuid",
    "source_ens": "vitalik.eth",
    "target_ens": "balajis.eth",
    "created_at": "2026-01-22T12:00:00Z"
  }
]
```

### POST /api/relationships
Create a new relationship.

**Request:**
```json
{
  "source_ens": "vitalik.eth",
  "target_ens": "balajis.eth"
}
```

**Response:** `201 Created` with the new relationship object.

### DELETE /api/relationships?id={uuid}
Delete a relationship by ID.

**Response:** `200 OK` with `{ "success": true }`

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing required fields | 400 | `{ "error": "source_ens and target_ens are required" }` |
| Self-loop attempt | 400 | `{ "error": "Cannot create relationship with self" }` |
| Duplicate relationship | 409 | `{ "error": "Relationship already exists" }` |
| Database error | 500 | `{ "error": "..." }` |

## Testing Checklist

- [ ] Add new edge via form
- [ ] See edge appear in graph immediately
- [ ] Click edge to select it
- [ ] Delete selected edge
- [ ] Refresh page - changes persist
- [ ] Try adding duplicate edge (should show error)
- [ ] Try adding self-loop (should show error)
- [ ] Click node navigates to profile page

## Optional Enhancements (If Time Permits)

1. **Bulk Import**: Parse textarea of pairs (like Phase 2) and bulk insert
2. **Real-time Updates**: Use Supabase real-time subscriptions
3. **Edge Labels**: Add relationship type (friend, colleague, etc.)
4. **Undo Delete**: Soft delete with restore option

## Supabase Setup Quick Reference

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to SQL Editor
3. Paste and run the schema SQL from above
4. Go to Settings > API to find your URL and anon key
5. Add to `.env.local`

---

**Phase**: 3 - Editable Edges with Database
**Estimated Time**: 45-60 minutes
**Prerequisites**: Phase 1 and Phase 2 working, Supabase account
