import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreatePRDSchema = z.object({
  title: z.string().min(1),
  content_markdown: z.string().optional(),
  product_id: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'complete']).default('complete'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Ensure public users row exists
  await supabase
    .from('users')
    .upsert({ id: user.id, email: user.email! }, { onConflict: 'id', ignoreDuplicates: true })

  const body = await request.json()
  const parsed = CreatePRDSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('prds')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
