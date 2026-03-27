import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Check if user record exists; create if first login
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, onboarding_complete')
    .eq('id', data.user.id)
    .single()

  if (!existingUser) {
    // New user via Google SSO — create profile
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
    })
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  if (!existingUser.onboarding_complete) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
