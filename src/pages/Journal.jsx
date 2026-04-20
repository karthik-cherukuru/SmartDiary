/**
 * Journal — centered composer (ChatGPT-style) + optional Sage companion.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpenCheck, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import EmotionReveal from '@/components/journal/EmotionReveal'
import ChatPanel     from '@/components/chatbot/ChatPanel'

import { useAuth }  from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

import { classifyEmotion } from '@/services/emotionService'
import { saveEntry }       from '@/services/journalService'
import { updateStreak }    from '@/services/streakService'
import { getEntries }      from '@/services/journalService'
import { getRandomQuote }  from '@/data/quotes'
import { saveMessageSequence } from '@/services/chatbotService'

function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length
}

const MIN_WORDS = 5

export default function Journal() {
    const { user }       = useAuth()
    const { setEmotion } = useTheme()
    const navigate       = useNavigate()

    const [content,      setContent]      = useState('')
    const [saving,       setSaving]       = useState(false)
    const [analyzing,    setAnalyzing]    = useState(false)
    const [savedEntry,   setSavedEntry]   = useState(null)
    const [chatOpen,     setChatOpen]     = useState(false)
    const [quote,        setQuote]        = useState('')
    const [writingEmotion, setWritingEmotion] = useState('neutral')

    const textareaRef = useRef(null)
    const sageMessagesRef = useRef([])

    const syncSageDraft = useCallback((msgs) => {
        sageMessagesRef.current = msgs
    }, [])

    // Auto-grow composer height with content (ChatGPT-style)
    const adjustComposerHeight = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        const maxPx = Math.round(window.innerHeight * 0.42)
        const next = Math.min(el.scrollHeight, maxPx)
        el.style.height = `${Math.max(next, 52)}px`
    }, [])

    useEffect(() => {
        if (!user) return

        getEntries(user.id, 1).then(entries => {
            const lastEmotion = entries[0]?.emotion_label ?? 'neutral'
            setWritingEmotion(lastEmotion)
            setEmotion(lastEmotion, 'associative')
            setQuote(getRandomQuote(lastEmotion))
        })

        textareaRef.current?.focus()
    }, [user, setEmotion])

    useEffect(() => {
        adjustComposerHeight()
    }, [content, adjustComposerHeight])

    const words = wordCount(content)

    const handleSave = async () => {
        if (words < MIN_WORDS) {
            toast.error(`Write at least ${MIN_WORDS} words before saving.`)
            return
        }

        setSaving(true)
        setAnalyzing(true)

        try {
            const { emotion, confidence } = await classifyEmotion(content)
            setAnalyzing(false)

            const entry = await saveEntry(user.id, content, emotion, confidence)

            const draft = sageMessagesRef.current
            if (draft.length > 0) {
                try {
                    await saveMessageSequence(user.id, entry.id, draft)
                } catch (syncErr) {
                    console.error('[Journal] Sage message sync error:', syncErr.message)
                }
            }

            const { newStreak, isMilestone } = await updateStreak(user.id)

            setSavedEntry({ emotion, confidence, id: entry.id, newStreak, isMilestone })

        } catch (err) {
            console.error('[Journal] handleSave error:', err.message)
            setAnalyzing(false)
            toast.error(`Could not save: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    const handleContinue = () => {
        navigate('/dashboard', {
            state: {
                savedEntry:  true,
                isMilestone: savedEntry?.isMilestone ?? false,
                newStreak:   savedEntry?.newStreak   ?? 0,
            },
            replace: true,
        })
    }

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave()
        }
    }

    return (
        <div
            className="flex flex-col min-h-screen bg-background"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            <header className="flex items-center justify-between gap-4 px-5 sm:px-8 py-5 border-b border-border">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 font-mono-label text-xs text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                </button>

                <div className="flex items-center gap-3 sm:gap-4">
                    <Badge variant="secondary" className="font-mono-label text-xs px-3 py-1">
                        {words} {words === 1 ? 'word' : 'words'}
                    </Badge>

                    <Button
                        onClick={handleSave}
                        disabled={saving || !!savedEntry}
                        size="default"
                        className={`font-mono-label text-xs rounded-full px-6 h-10 ${
                            analyzing ? 'animate-pulse' : ''
                        }`}
                    >
                        {analyzing
                            ? 'Analyzing…'
                            : saving
                            ? 'Saving…'
                            : 'Save'}
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-4 sm:px-8 pb-36 pt-10 relative">
                <AnimatePresence mode="wait">
                    {!savedEntry ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col flex-1 w-full max-w-3xl mx-auto"
                        >
                            <div className="flex flex-col items-center text-center gap-3 mb-10">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card flat-card">
                                    <BookOpenCheck className="h-6 w-6 text-primary" aria-hidden />
                                </div>
                                <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
                                    Today&apos;s entry
                                </h1>
                                <p className="text-muted-foreground text-base max-w-md leading-relaxed">
                                    Write freely in the box below. Sage can join when you want a listening ear.
                                </p>
                            </div>

                            {quote && (
                                <p className="text-center text-sm sm:text-base text-muted-foreground italic mb-8 max-w-xl mx-auto leading-relaxed">
                                    {quote}
                                </p>
                            )}

                            {analyzing && (
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <Skeleton className="h-3 w-3 rounded-full" />
                                    <span className="font-mono-label text-xs text-muted-foreground animate-pulse">
                                        Analyzing your words…
                                    </span>
                                </div>
                            )}

                            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
                                <div
                                    className="w-full rounded-[1.75rem] border border-border bg-card px-4 py-3 sm:px-6 sm:py-4 flat-card"
                                >
                                    <Textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="What's on your mind today?"
                                        disabled={saving}
                                        rows={2}
                                        className="w-full min-h-[52px] max-h-[42vh] resize-none border-0 bg-transparent text-lg sm:text-xl leading-relaxed text-foreground focus-visible:ring-0 focus:outline-none placeholder:text-muted-foreground/50 p-0"
                                    />
                                </div>

                                <p className="font-mono-label text-[11px] text-muted-foreground/60 mt-4 text-center">
                                    Ctrl+Enter or ⌘+Enter to save · Minimum {MIN_WORDS} words
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-1 items-center justify-center"
                        >
                            <EmotionReveal
                                emotion={savedEntry.emotion}
                                confidence={savedEntry.confidence}
                                onContinue={handleContinue}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {!savedEntry && (
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
                    <div className="mx-auto max-w-3xl px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Button
                            type="button"
                            onClick={() => setChatOpen(true)}
                            variant="secondary"
                            className="w-full sm:w-auto h-12 sm:h-14 rounded-full px-8 text-base border border-border"
                            aria-label="Open Sage companion"
                        >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Talk with Sage
                        </Button>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md leading-relaxed">
                            Optional: open a side panel to process this entry with Sage — same context as your words above.
                        </p>
                    </div>
                </div>
            )}

            <ChatPanel
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                entryContent={content}
                entryEmotion={writingEmotion}
                entryId={savedEntry?.id ?? null}
                onMessagesChange={syncSageDraft}
            />
        </div>
    )
}
