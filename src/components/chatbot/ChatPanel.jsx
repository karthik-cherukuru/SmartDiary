/**
 * ChatPanel — a slide-in Sheet from the right for the AI companion.
 *
 * Features:
 *  - Opens as a shadcn <Sheet> from side="right"
 *  - Full-height scroll area for the conversation
 *  - User messages: right-aligned amber bubbles
 *  - Bot messages:  left-aligned grey bubbles
 *  - Input + send button at the bottom
 *  - Typing indicator (skeleton rows) while awaiting Groq response
 *  - Auto-scrolls to the latest message
 *  - Persists messages to Supabase `chat_messages` table
 *  - Builds a compassionate system prompt around the journal entry
 */
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input }      from '@/components/ui/input'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'
import { Separator }  from '@/components/ui/separator'

import { useAuth } from '@/context/AuthContext'
import {
    sendMessage,
    saveMessage,
    getMessages,
    buildSystemPrompt,
} from '@/services/chatbotService'

export default function ChatPanel({ open, onClose, entryContent, entryEmotion, entryId }) {
    const { user } = useAuth()

    const [messages,  setMessages]  = useState([])
    const [input,     setInput]     = useState('')
    const [sending,   setSending]   = useState(false)

    const bottomRef = useRef(null)

    // Load existing messages for this entry when the panel opens
    useEffect(() => {
        if (!open || !user || !entryId) return

        getMessages(user.id, entryId)
            .then(history => {
                setMessages(history.map(m => ({ role: m.role, content: m.content })))
            })
            .catch(err => {
                console.error('[ChatPanel] getMessages error:', err.message)
            })
    }, [open, user, entryId])

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending])

    // ---- Send a message ----
    const handleSend = async () => {
        const text = input.trim()
        if (!text || sending) return

        setInput('')
        setSending(true)

        // Build system prompt that bakes in the journal entry as context
        const systemPrompt = buildSystemPrompt(
            entryContent ?? '(no entry provided)',
            entryEmotion ?? 'neutral'
        )

        // Full conversation history to send to Groq
        const userMessage  = { role: 'user', content: text }
        const conversation = [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage,
        ]

        // Optimistically append user message
        setMessages(prev => [...prev, userMessage])

        try {
            const reply = await sendMessage(conversation)

            const assistantMessage = { role: 'assistant', content: reply }
            setMessages(prev => [...prev, assistantMessage])

            // Persist both messages to Supabase (if we have an entry ID)
            if (entryId) {
                await Promise.all([
                    saveMessage(user.id, entryId, 'user', text),
                    saveMessage(user.id, entryId, 'assistant', reply),
                ])
            }
        } catch (err) {
            console.error('[ChatPanel] send error:', err.message)
            toast.error('Could not get a response. Please try again.')
            // Remove the optimistic user message on failure
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Sheet open={open} onOpenChange={v => !v && onClose()}>
            <SheetContent
                side="right"
                className="flex flex-col w-full sm:max-w-md p-0 gap-0"
            >
                {/* Header */}
                <SheetHeader className="px-5 pt-5 pb-3 shrink-0">
                    <SheetTitle className="font-heading text-base flex items-center gap-2">
                        <span className="text-primary">◆</span>
                        Sage — Your companion
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                        Here to listen, reflect, and help you feel a little lighter.
                    </SheetDescription>
                </SheetHeader>

                <Separator />

                {/* Messages scroll area */}
                <ScrollArea className="flex-1 px-5 py-4">
                    {messages.length === 0 && !sending ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                            <span className="text-2xl text-muted-foreground/40">◆</span>
                            <p className="text-xs text-muted-foreground max-w-[220px]">
                                Ask Sage anything about what you just wrote. No judgment — only reflection.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                    : 'bg-secondary text-foreground rounded-bl-sm border border-border'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing indicator */}
                                {sending && (
                                    <motion.div
                                        key="typing"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <Skeleton
                                                    key={i}
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Anchor for auto-scroll */}
                    <div ref={bottomRef} />
                </ScrollArea>

                <Separator />

                {/* Input area */}
                <div className="px-5 py-4 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            disabled={sending}
                            className="flex-1 text-sm"
                            autoFocus
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            size="sm"
                            className="shrink-0"
                            aria-label="Send message"
                        >
                            ↑
                        </Button>
                    </div>

                    <p className="font-mono-label text-[10px] text-muted-foreground/50 mt-2 text-center">
                        Sage is an AI — not a therapist. In crisis, seek professional help.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
