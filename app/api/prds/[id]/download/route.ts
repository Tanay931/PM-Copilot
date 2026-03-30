import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markdownToDocxBlob } from '@/lib/generate-docx'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('prds')
    .select('title, content_markdown, product:products(name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!data.content_markdown) return NextResponse.json({ error: 'No content to download' }, { status: 400 })

  const productName = (data.product as unknown as { name: string } | null)?.name ?? ''
  const docTitle = [data.title, productName].filter(Boolean).join(' · ')

  const blob = await markdownToDocxBlob(data.content_markdown, docTitle)
  const buffer = await blob.arrayBuffer()

  const filename = `${data.title.replace(/[^\x00-\x7F]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase()}.docx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
