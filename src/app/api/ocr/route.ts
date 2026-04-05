import { NextResponse } from 'next/server'
import { getHeaders } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('receipt') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract the following from this receipt: merchant name, total amount, date, and individual line items. Return as JSON with keys: merchant, total, date, items (array of {name, amount}).',
                  },
                  {
                    type: 'image_url',
                    image_url: { url: `data:${file.type};base64,${base64}` },
                  },
                ],
              },
            ],
            max_tokens: 500,
          }),
        })

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || '{}'
        const parsed = JSON.parse(content)

        return NextResponse.json({
          merchant: parsed.merchant || '',
          total: parsed.total || 0,
          date: parsed.date || new Date().toISOString().split('T')[0],
          items: parsed.items || [],
        })
      } catch (aiError) {
        console.error('OCR AI error:', aiError)
      }
    }

    return NextResponse.json({
      merchant: file.name.replace(/\.[^/.]+$/, ''),
      total: 0,
      date: new Date().toISOString().split('T')[0],
      items: [],
      note: 'OCR requires OPENAI_API_KEY. Upload saved for manual entry.',
    })
  } catch (error) {
    console.error('Error processing receipt:', error)
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 })
  }
}
