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
