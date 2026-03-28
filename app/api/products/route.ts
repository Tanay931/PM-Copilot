import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  short_description: z.string().min(1, 'Short description is required'),
  context: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('products')
    .select('id, name, short_description, context, created_at, updated_at, personas(count), knowledge_base_items(count)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const products = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    short_description: p.short_description,
    context: p.context,
    updated_at: p.updated_at,
    created_at: p.created_at,
    // Supabase returns aggregate counts as [{count: N}]
    persona_count: (p.personas as unknown as { count: number }[])[0]?.count ?? 0,
    kb_item_count: (p.knowledge_base_items as unknown as { count: number }[])[0]?.count ?? 0,
  }))

  return NextResponse.json({ data: products })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
