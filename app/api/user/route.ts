import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  description: z.string().optional(),
  onboarding_complete: z.boolean().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, job_title, company, description, role, onboarding_complete, created_at')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// POST — create user profile row (called after email OTP verification)
export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Upsert so it's idempotent
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = UpdateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      { id: user.id, email: user.email!, ...parsed.data, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
