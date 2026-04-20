/**
 * ChatPanel — Sage: desktop = right third; mobile = bottom sheet (~80vh) with drag handle.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, SendHorizonal, Sparkles } from 'lucide-react'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Input }      from '@/components/ui/input'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'
import { Separator }  from '@/components/ui/separator'

import { useAuth } from '@/context/AuthContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
    sendMessage,
    saveMessage,
    getMessages,
    buildSystemPrompt,
} from '@/services/chatbotService'

/** Drag threshold (px) before we close the mobile sheet */
const CLOSE_PULL_PX = 72

export default function ChatPanel({
    open,
    onClose,
    entryContent,
    entryEmotion,
    entryId,
    onMessagesChange,
}) {
    const { user } = useAuth()
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const [messages,  setMessages]  = useState([])
    const [input,     setInput]     = useState('')
    const [sending,   setSending]   = useState(false)

    /** Mobile: vertical offset while dragging the handle down */
    const [pullOffset, setPullOffset] = useState(0)
    const dragStartY = useRef(null)
    const handleRef  = useRef(null)

    const bottomRef = useRef(null)

    const setMessagesTracked = useCallback((updater) => {
        setMessages(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            onMessagesChange?.(next)
            return next
        })
    }, [onMessagesChange])

    useEffect(() => {
        if (!open || !user || !entryId) return

        getMessages(user.id, entryId)
            .then(history => {
                const mapped = history.map(m => ({ role: m.role, content: m.content }))
                setMessagesTracked(() => mapped)
            })
            .catch(err => {
                console.error('[ChatPanel] getMessages error:', err.message)
            })
    }, [open, user, entryId, setMessagesTracked])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending])

    /** Reset drag offset when sheet closes or switches layout */
    useEffect(() => {
        if (!open) setPullOffset(0)
    }, [open])

    const endHandleDrag = useCallback((clientY, pointerId) => {
        const start = dragStartY.current
        dragStartY.current = null
        if (start == null) return

        const delta = clientY - start
        setPullOffset(0)

        if (delta >= CLOSE_PULL_PX) {
            onClose()
        }

        if (handleRef.current && pointerId != null) {
            try {
                handleRef.current.releasePointerCapture(pointerId)
            } catch {
                // ignore
            }
        }
    }, [onClose])

    const onHandlePointerDown = e => {
        if (isDesktop) return
        dragStartY.current = e.clientY
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const onHandlePointerMove = e => {
        if (isDesktop || dragStartY.current == null) return
        const dy = e.clientY - dragStartY.current
        if (dy > 0) setPullOffset(dy)
    }

    const onHandlePointerUp = e => {
        if (isDesktop) return
        endHandleDrag(e.clientY, e.pointerId)
    }

    const onHandlePointerCancel = e => {
        if (isDesktop) return
        setPullOffset(0)
        dragStartY.current = null
        if (e?.pointerId != null && handleRef.current) {
            try {
                handleRef.current.releasePointerCapture(e.pointerId)
            } catch {
                // ignore
            }
        }
    }

    const handleSend = async () => {
        const text = input.trim()
        if (!text || sending) return

        setInput('')
        setSending(true)

        const systemPrompt = buildSystemPrompt(
            entryContent ?? '(no entry provided)',
            entryEmotion ?? 'neutral'
        )

        const userMessage  = { role: 'user', content: text }
        const conversation = [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage,
        ]

        setMessagesTracked(prev => [...prev, userMessage])

        try {
            const reply = await sendMessage(conversation)
            const assistantMessage = { role: 'assistant', content: reply }
            setMessagesTracked(prev => [...prev, assistantMessage])

            if (entryId) {
                await saveMessage(user.id, entryId, 'user', text)
                await saveMessage(user.id, entryId, 'assistant', reply)
            }
        } catch (err) {
            console.error('[ChatPanel] send error:', err.message)
            toast.error('Could not get a response. Please try again.')
            setMessagesTracked(prev => prev.slice(0, -1))
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

    const sheetSide = isDesktop ? 'right' : 'bottom'

    /** Desktop: one third of the viewport; mobile: full width bottom sheet */
    const sheetClassName = isDesktop
        ? [
            'flex flex-col min-h-0 p-0 gap-0 border-l border-border shadow-none bg-card',
            'h-full !w-[33.333vw] min-w-[280px] max-w-[520px]',
        ].join(' ')
        : [
            'flex flex-col min-h-0 p-0 gap-0 border-t border-border shadow-none bg-card',
            'w-full !max-w-none rounded-t-[1.75rem] overflow-hidden',
            'h-[80vh] max-h-[80vh]',
        ].join(' ')

    return (
        <Sheet open={open} onOpenChange={v => !v && onClose()}>
            <SheetContent
                side={sheetSide}
                showCloseButton
                className={sheetClassName}
            >
                <div
                    className="flex flex-col flex-1 min-h-0 min-w-0"
                    style={
                        isDesktop
                            ? undefined
                            : { transform: `translate3d(0, ${pullOffset}px, 0)` }
                    }
                >
                    {/* Mobile-only drag handle (pull down to close) */}
                    {!isDesktop && (
                        <div
                            ref={handleRef}
                            className="flex shrink-0 justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
                            onPointerDown={onHandlePointerDown}
                            onPointerMove={onHandlePointerMove}
                            onPointerUp={onHandlePointerUp}
                            onPointerCancel={onHandlePointerCancel}
                            role="presentation"
                            aria-hidden
                        >
                            <div className="h-1.5 w-11 rounded-full bg-muted-foreground/35" />
                        </div>
                    )}

                    <SheetHeader className={`px-5 shrink-0 ${isDesktop ? 'pt-6 pb-4' : 'pt-1 pb-3'}`}>
                        <SheetTitle className="font-heading text-lg flex items-center gap-2 pr-8">
                            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                            Sage
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground">
                            Reflect on what you wrote — short, gentle replies.
                        </SheetDescription>
                    </SheetHeader>

                    <Separator />

                    {/* flex-1 + min-h-0 so the scroll viewport gets a real height bound */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-5 py-4 [-webkit-overflow-scrolling:touch]">
                        {messages.length === 0 && !sending ? (
                            <div className="flex flex-col items-center justify-center min-h-[12rem] text-center gap-3">
                                <Bot className="h-10 w-10 text-muted-foreground/40" aria-hidden />
                                <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                                    Ask Sage about your entry. Nothing leaves this space without you choosing to save it.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 pr-1">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={`${msg.role}-${idx}-${msg.content?.slice(0, 12)}`}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div
                                                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted"
                                                    aria-hidden
                                                >
                                                    <Bot className="h-4 w-4 text-foreground" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                                                    msg.role === 'user'
                                                        ? 'bg-primary text-primary-foreground rounded-br-md'
                                                        : 'bg-muted text-foreground rounded-bl-md border border-border'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {sending && (
                                        <motion.div
                                            key="typing"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start gap-2"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
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

                        <div ref={bottomRef} />
                    </div>

                    <Separator />

                    <div className="px-5 py-5 shrink-0 bg-card border-t border-border">
                        <div className="flex gap-2 items-center rounded-2xl border border-border bg-muted/40 px-2 py-2">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Sage…"
                                disabled={sending}
                                className="flex-1 text-base border-0 bg-transparent shadow-none focus-visible:ring-0 h-11"
                                autoFocus
                            />
                            <Button
                                type="button"
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-xl"
                                aria-label="Send message"
                            >
                                <SendHorizonal className="h-5 w-5" />
                            </Button>
                        </div>

                        <p className="font-mono-label text-[10px] text-muted-foreground/70 mt-3 text-center leading-relaxed">
                            Sage is an AI companion, not a clinician. If you are in crisis, contact local emergency services or a licensed professional.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
