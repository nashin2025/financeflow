import { NextResponse } from 'next/server'
import { getHeaders } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: 'AI features require an OpenAI API key. Please set OPENAI_API_KEY in your environment variables.',
      })
    }

    const systemPrompt = `You are a helpful financial assistant for FinanceFlow. 
The user's financial context: ${JSON.stringify(context || {})}.
Provide concise, actionable financial advice. Use the user's data to give specific recommendations.
If asked about data you don't have, say so honestly.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process that request.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
