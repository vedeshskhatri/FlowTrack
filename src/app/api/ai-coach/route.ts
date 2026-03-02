import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Free models tried in order — first success wins
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-3-12b-it:free',
  'qwen/qwen2.5-72b-instruct:free',
]

async function callOpenRouter(apiKey: string, model: string, messages: object[], appUrl: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  appUrl,
      'X-Title':       'FlowTrack AI Coach',
    },
    body: JSON.stringify({ model, messages, max_tokens: 600, temperature: 0.7 }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return (data.choices?.[0]?.message?.content as string) ?? null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, userKey } = body as { query: string; userKey?: string }

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: workouts }, { data: prefs }] = await Promise.all([
      supabase
        .from('exercise_history')
        .select('exercise_name, weight_kg, reps, sets, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20),
      supabase
        .from('user_preferences')
        .select('goal, units, cycle_phase')
        .eq('user_id', user.id)
        .single(),
    ])

    const apiKey = userKey || process.env.OPENROUTER_API_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    let response: string | null = null

    if (apiKey && !apiKey.startsWith('placeholder')) {
      const systemPrompt = `You are FlowTrack's AI fitness coach — knowledgeable, encouraging, and concise.
You help athletes optimise their training with evidence-based advice.
Never be toxic or use pressure tactics. Be gentle with missed sessions.

User profile:
- Goal: ${prefs?.goal ?? 'general fitness'}
- Units: ${prefs?.units ?? 'kg'}
- Cycle phase: ${prefs?.cycle_phase ?? 'n/a'}

Recent exercise history (last 20 sessions):
${workouts ? JSON.stringify(workouts, null, 2) : 'No history available.'}

Keep answers to 2-4 short paragraphs. Use bullet points for lists. Be practical and actionable.`

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: query },
      ]

      // Try each free model in sequence
      for (const model of FREE_MODELS) {
        try {
          response = await callOpenRouter(apiKey, model, messages, appUrl)
          if (response) break
        } catch {
          // try next model
        }
      }
    }

    // Fall back to mock if all models failed or no key
    if (!response) {
      response = getMockResponse(query)
    }

    await supabase.from('ai_chat_history').insert({
      user_id:  user.id,
      query,
      response,
      context:  JSON.stringify({ workoutsIncluded: workouts?.length ?? 0 }),
    }).then(() => {}) // fire and forget, don't block

    return NextResponse.json({ response })
  } catch (err) {
    console.error('[AI Coach]', err)
    // Never surface raw errors — fall back gracefully
    return NextResponse.json({ response: getMockResponse('general') })
  }
}


/** Fallback responses when OpenAI key is not configured. */
function getMockResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('1rm') || q.includes('one rep max')) {
    return "**Estimating Your 1RM**\n\nUse the Epley formula: **1RM = weight × (1 + reps/30)**\n\nFor example, if you lifted 80kg for 8 reps: 80 × (1 + 8/30) ≈ **101kg**.\n\nI can pull your recent lift data automatically once you connect your OpenAI key in Settings."
  }
  if (q.includes('lower back') || q.includes('back pain')) {
    return "**Deadlift Alternatives for Lower Back Pain**\n\n• **Romanian Deadlift** — lighter, hip-hinge focus\n• **Trap Bar Deadlift** — reduces lumbar stress significantly\n• **Cable Pull-throughs** — great for glute activation without spinal load\n• **Kettlebell Swings** — dynamic hip hinge with less compression\n\nAlways listen to your body. Pain is a signal, not a challenge."
  }
  if (q.includes('bench') || q.includes('chest')) {
    return "**Bench Press Form Tips**\n\n• Retract your scapulae before unracking — creates a stable base\n• Keep a slight arch; don't flatten your back completely\n• Touch low-chest (near nipple line) and press up + slightly back\n• Use leg drive for power transfer\n\nFilm yourself from the side to check bar path."
  }
  return "**FlowTrack AI Coach**\n\nI'm running in demo mode. To get personalised responses based on your workout history, add your OpenAI API key in **Settings → AI Coach**.\n\nIn the meantime, I'm happy to share general fitness knowledge. Just ask me about exercises, form, programming, or nutrition!"
}
