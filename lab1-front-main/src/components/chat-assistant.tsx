'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import * as motion from 'motion/react-m'
import { ArrowUp, X } from 'lucide-react'

type Message = {
  id: number
  role: 'assistant' | 'user'
  text: string
}

function getReply(message: string) {
  const text = message.toLowerCase()
  if (text.includes('deploy')) return 'I can help you plan deployment. Start by describing the app, target environment, and tools your agent needs.'
  if (text.includes('integrat') || text.includes('api')) return 'For integrations, list the APIs or services you need. AFROLAB can help connect those tools to your agent workflow.'
  if (text.includes('code') || text.includes('build')) return 'Tell me what you want to build and the framework you are using. I can help break it into code, testing, and deployment steps.'
  return 'Thanks for sharing that. Describe your project goal, and I can help shape it into an AI agent workflow.'
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Hi! I’m your AFROLAB assistant. What would you like to build?' },
  ])
  const nextId = useRef(2)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
  }, [])

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || isTyping) return

    setMessages((current) => [...current, { id: nextId.current++, role: 'user', text }])
    setInput('')
    setIsTyping(true)
    typingTimeout.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: 'assistant', text: getReply(text) },
      ])
      setIsTyping(false)
      typingTimeout.current = null
    }, 650)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            aria-label="AFROLAB chat assistant"
            className="flex h-[min(520px,72vh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-[#101815] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">A</span>
                <div>
                  <p className="text-sm font-semibold">AFROLAB assistant</p>
                  <p className="text-xs text-white/65">Here to help you build</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-full p-2 hover:bg-white/10">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${message.role === 'user' ? 'bg-primary text-black' : 'bg-secondary text-black'}`}>
                    {message.text}
                  </p>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3" aria-label="Assistant is typing">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:240ms]" />
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-border bg-white p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about building an agent..."
                aria-label="Type a message"
                className="min-w-0 flex-1 rounded-full bg-secondary px-4 py-2 text-sm text-black outline-none placeholder:text-foreground focus:ring-2 focus:ring-primary"
              />
              <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-black disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowUp size={17} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close AFROLAB chat' : 'Open AFROLAB chat'}
        aria-expanded={isOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-black shadow-lg shadow-emerald-950/20 transition-transform hover:scale-105"
      >
        <span className="font-sans text-2xl font-bold leading-none" aria-hidden="true">A</span>
      </motion.button>
    </div>
  )
}
