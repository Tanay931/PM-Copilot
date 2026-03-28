import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const MAX_PERSONAS = parseInt(process.env.MAX_PERSONAS_PER_PRODUCT ?? '10')

const CreatePersonaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role_description: z.string().min(1, 'Role description is required'),
  tech_savviness: z.enum(['low', 'medium', 'high']),
  behaviours: z.string().optional(),
  design_implications: z.string().optional(),
  relevant_features: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify product belongs to user
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check limit
  const { count } = await supabase
    .from('personas')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
  if ((count ?? 0) >= MAX_PERSONAS) {
    return NextResponse.json({ error: `Maximum ${MAX_PERSONAS} personas per product.` }, { status: 400 })
  }

  const body = await request.json()
  const parsed = CreatePersonaSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('personas')
    .insert({ ...parsed.data, product_id: productId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
