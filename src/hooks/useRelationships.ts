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
