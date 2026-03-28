import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: productId, itemId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify the KB item belongs to a product owned by the user (RLS also enforces this)
  const { data: item } = await supabase
    .from('knowledge_base_items')
    .select('id, product_id, products!inner(user_id)')
    .eq('id', itemId)
    .eq('product_id', productId)
    .single()

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('knowledge_base_items').delete().eq('id', itemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { success: true } })
}
