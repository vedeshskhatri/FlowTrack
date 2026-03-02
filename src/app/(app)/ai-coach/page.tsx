'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MessageSquare, Trash2, Sparkles, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const EXAMPLE_PROMPTS = [
  'Suggest deadlift alternatives for lower back pain',
  "What's my estimated 1RM for bench press?",
  'How should I program my week for hypertrophy?',
  'Fix my squat form — I tend to lean forward',
  'Should I train during my luteal phase?',
  'How much protein do I actually need?',
]

export default function AiCoachPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [userKey, setUserKey]   = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load OpenAI key from preferences
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('user_preferences')
        .select('openai_key')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.openai_key) setUserKey(data.openai_key)
        })
    })
  }, []) // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(query: string) {
    if (!query.trim() || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), userKey }),
      })
      const data = await res.json()

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || data.error || 'Something went wrong.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t reach the server. Check your connection.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-black" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">AI Coach</h1>
          <p className="text-xs text-muted-foreground">Powered by your workout history</p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground hover:text-destructive"
            onClick={() => setMessages([])}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Message area */}
      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22D3EE]/20 to-[#A78BFA]/20 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Your AI Coach</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Ask anything about training, form, programming, nutrition, or recovery.
                  I pull your workout history to give personalised advice.
                </p>
              </div>

              {/* Example prompts */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">
                  Try asking…
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXAMPLE_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-sm rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 px-4 py-3 transition-all duration-150 text-muted-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gradient-to-br from-[#22D3EE]/20 to-[#A78BFA]/20'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5" />
                    : <Bot className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-border rounded-tl-sm'
                }`}>
                  {/* Render markdown-lite: bold, bullet points */}
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return <div key={i} className="flex gap-2 mt-1"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" /><span>{line.slice(2)}</span></div>
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold mt-2 first:mt-0">{line.slice(2, -2)}</p>
                    }
                    return <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22D3EE]/20 to-[#A78BFA]/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Textarea
              placeholder="Ask your AI coach anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="pr-12 resize-none bg-card border-border rounded-xl text-sm min-h-[44px] max-h-32 overflow-y-auto"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to send · Shift+Enter for new line · Optionally add your own key in{' '}
            <a href="/settings" className="text-primary hover:underline">Settings</a>
          </p>
        </div>
      </div>
    </div>
  )
}
