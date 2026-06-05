import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userMessage, mode } = await request.json()
    
    // Usar Vercel AI Gateway con modelo de OpenAI
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: userMessage,
      maxTokens: mode === 'full' ? 2000 : 500,
      temperature: 0.7,
    })
    
    return NextResponse.json({ 
      suggestion: text,
      success: true 
    })
  } catch (error) {
    console.error('[v0] Error generating plan suggestion:', error)
    
    // Retornar error para que el cliente use el fallback local
    return NextResponse.json(
      { error: 'Error al generar sugerencia', success: false },
      { status: 500 }
    )
  }
}
