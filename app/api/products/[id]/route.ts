import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  short_description: z.string().min(1).optional(),
  context: z.string().optional(),
})

async function getAuthorisedProduct(supabase: Awaited<ReturnType<typeof createClient>>, productId: string, userId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, user_id')
    .eq('id', productId)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, short_description, context, created_at, updated_at,
      personas(id, name, role_description, tech_savviness, behaviours, design_implications, relevant_features, created_at, updated_at),
      knowledge_base_items(id, source_type, filename, url, extracted_text, file_size_bytes, created_at)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const product = await getAuthorisedProduct(supabase, id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('products')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const product = await getAuthorisedProduct(supabase, id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { success: true } })
}
