export interface GraphNode {
  id: string        // ENS name
  address?: string  // Resolved address
}

export interface GraphData {
  nodes: GraphNode[]
  links: { source: string; target: string }[]
}
