import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdatePersonaSchema = z.object({
  name: z.string().min(1).optional(),
  role_description: z.string().min(1).optional(),
  tech_savviness: z.enum(['low', 'medium', 'high']).optional(),
  behaviours: z.string().optional(),
  design_implications: z.string().optional(),
  relevant_features: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  const { id: productId, personaId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify persona is in a product owned by the user
  const { data: persona } = await supabase
    .from('personas')
    .select('id, product_id, products!inner(user_id)')
    .eq('id', personaId)
    .eq('product_id', productId)
    .single()
  if (!persona) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const parsed = UpdatePersonaSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('personas')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', personaId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  const { id: productId, personaId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: persona } = await supabase
    .from('personas')
    .select('id, product_id, products!inner(user_id)')
    .eq('id', personaId)
    .eq('product_id', productId)
    .single()
  if (!persona) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('personas').delete().eq('id', personaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { success: true } })
}
