import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractBufferText, extractUrlContent } from '@/lib/extract-text'
import { z } from 'zod'

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_UPLOAD_SIZE_MB ?? '10')) * 1024 * 1024
const MAX_DOCS = parseInt(process.env.MAX_KB_DOCS_PER_PRODUCT ?? '20')
const MAX_URLS = parseInt(process.env.MAX_KB_URLS_PER_PRODUCT ?? '20')

const ACCEPTED_TYPES: Record<string, boolean> = {
  'application/pdf': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'text/plain': true,
}

const UrlSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().optional(),
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

  const contentType = request.headers.get('content-type') ?? ''

  // ── File upload ──────────────────────────────────────────────────────────────
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ACCEPTED_TYPES[file.type]) {
      return NextResponse.json({ error: 'File type not supported. Use PDF, DOCX, or TXT.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` }, { status: 400 })
    }

    // Check doc limit
    const { count } = await supabase
      .from('knowledge_base_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('source_type', 'upload')
    if ((count ?? 0) >= MAX_DOCS) {
      return NextResponse.json({ error: `Maximum ${MAX_DOCS} documents per product.` }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText: string | null = null
    try {
      extractedText = await extractBufferText(buffer, file.type, file.name)
    } catch {
      // Store without text — extraction failed
    }

    const { data, error } = await supabase
      .from('knowledge_base_items')
      .insert({
        product_id: productId,
        source_type: 'upload',
        filename: file.name,
        file_size_bytes: file.size,
        extracted_text: extractedText,
      })
      .select('id, source_type, filename, url, extracted_text, file_size_bytes, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data }, { status: 201 })
  }

  // ── URL ──────────────────────────────────────────────────────────────────────
  const body = await request.json()
  const parsed = UrlSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Check URL limit
  const { count } = await supabase
    .from('knowledge_base_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('source_type', 'url')
  if ((count ?? 0) >= MAX_URLS) {
    return NextResponse.json({ error: `Maximum ${MAX_URLS} URLs per product.` }, { status: 400 })
  }

  const displayName = parsed.data.name?.trim() || new URL(parsed.data.url).hostname

  let extractedText: string | null = null
  try {
    extractedText = await extractUrlContent(parsed.data.url)
  } catch {
    // Store without text
  }

  const { data, error } = await supabase
    .from('knowledge_base_items')
    .insert({
      product_id: productId,
      source_type: 'url',
      filename: displayName,
      url: parsed.data.url,
      extracted_text: extractedText,
    })
    .select('id, source_type, filename, url, extracted_text, file_size_bytes, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
