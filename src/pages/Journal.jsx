/**
 * Journal — fullscreen distraction-free writing page.
 *
 * Features:
 *  - Plain textarea filling the viewport
 *  - Word counter badge
 *  - Save button with pulsing animation + "Analyzing your words..." state
 *  - Emotion reveal card that slides up after classification
 *  - Chatbot toggle button on the right edge
 *  - Applies Associative theme (last saved emotion) while writing
 *  - On save: classifies, stores entry, updates streak, then transitions
 *    to Dashboard with corrective theme via router state
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import EmotionReveal from '@/components/journal/EmotionReveal'
import ChatPanel     from '@/components/chatbot/ChatPanel'

import { useAuth }  from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

import { classifyEmotion }          from '@/services/emotionService'
import { saveEntry }                 from '@/services/journalService'
import { updateStreak }              from '@/services/streakService'
import { getEntries }                from '@/services/journalService'
import { getRandomQuote }            from '@/data/quotes'

/**
 * Count words in a string.
 */
function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length
}

// Minimum word count to save (prevents empty saves)
const MIN_WORDS = 5

export default function Journal() {
    const { user }            = useAuth()
    const { setEmotion }      = useTheme()
    const navigate            = useNavigate()

    const [content,      setContent]      = useState('')
    const [saving,       setSaving]       = useState(false)
    const [analyzing,    setAnalyzing]    = useState(false)
    const [savedEntry,   setSavedEntry]   = useState(null)   // holds { emotion, confidence, id }
    const [chatOpen,     setChatOpen]     = useState(false)
    const [quote,        setQuote]        = useState('')

    // Track the last emotion to set associative theme while writing
    const [writingEmotion, setWritingEmotion] = useState('neutral')

    const textareaRef = useRef(null)

    // On mount: load the last entry's emotion for the associative palette + fetch a quote
    useEffect(() => {
        if (!user) return

        getEntries(user.id, 1).then(entries => {
            const lastEmotion = entries[0]?.emotion_label ?? 'neutral'
            setWritingEmotion(lastEmotion)
            setEmotion(lastEmotion, 'associative')
            setQuote(getRandomQuote(lastEmotion))
        })

        // Focus the textarea on mount
        textareaRef.current?.focus()
    }, [user, setEmotion])

    const words = wordCount(content)

    // ---- Save handler ----
    const handleSave = async () => {
        if (words < MIN_WORDS) {
            toast.error(`Write at least ${MIN_WORDS} words before saving.`)
            return
        }

        setSaving(true)
        setAnalyzing(true)

        try {
            // 1. Classify emotion
            const { emotion, confidence } = await classifyEmotion(content)
            setAnalyzing(false)

            // 2. Save entry to Supabase
            const entry = await saveEntry(user.id, content, emotion, confidence)

            // 3. Update streak
            const { newStreak, isMilestone } = await updateStreak(user.id)

            // 4. Show emotion reveal
            setSavedEntry({ emotion, confidence, id: entry.id, newStreak, isMilestone })

        } catch (err) {
            console.error('[Journal] handleSave error:', err.message)
            setAnalyzing(false)
            toast.error(`Could not save: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    // ---- Continue to dashboard after reveal ----
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

    // ---- Keyboard shortcut: Ctrl/Cmd + Enter to save ----
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave()
        }
    }

    return (
        <div
            className="flex flex-col min-h-screen"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            {/* Top bar — minimal, no full navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="font-mono-label text-xs text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Back to dashboard"
                >
                    ← Dashboard
                </button>

                <div className="flex items-center gap-3">
                    {/* Word count */}
                    <Badge
                        variant="outline"
                        className="font-mono-label text-[10px]"
                    >
                        {words} {words === 1 ? 'word' : 'words'}
                    </Badge>

                    {/* Save button */}
                    <Button
                        onClick={handleSave}
                        disabled={saving || !!savedEntry}
                        size="sm"
                        className={`font-mono-label text-xs relative ${
                            analyzing ? 'animate-pulse' : ''
                        } shadow-brutal`}
                    >
                        {analyzing
                            ? 'Analyzing…'
                            : saving
                            ? 'Saving…'
                            : 'Save  ⌘↵'}
                    </Button>
                </div>
            </header>

            {/* Writing area */}
            <main className="flex-1 flex flex-col px-6 sm:px-12 md:px-24 lg:px-40 py-8 relative">
                <AnimatePresence mode="wait">
                    {!savedEntry ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col flex-1"
                        >
                            {/* Writing prompt */}
                            {quote && (
                                <p className="font-mono-label text-xs text-muted-foreground mb-6 italic">
                                    {quote}
                                </p>
                            )}

                            {/* "Analyzing" overlay status */}
                            {analyzing && (
                                <div className="flex items-center gap-3 mb-4">
                                    <Skeleton className="h-3 w-3 rounded-full" />
                                    <span className="font-mono-label text-xs text-muted-foreground animate-pulse">
                                        Analyzing your words…
                                    </span>
                                </div>
                            )}

                            {/* Main textarea */}
                            <Textarea
                                ref={textareaRef}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Start writing… this space is yours."
                                disabled={saving}
                                className="flex-1 min-h-[60vh] resize-none border-0 bg-transparent text-foreground text-base leading-relaxed focus:ring-0 focus:outline-none placeholder:text-muted-foreground/40 p-0"
                            />

                            {/* Keyboard hint */}
                            <p className="font-mono-label text-[10px] text-muted-foreground/40 mt-4 text-right">
                                Ctrl+Enter to save
                            </p>
                        </motion.div>
                    ) : (
                        /* Emotion reveal after save */
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

            {/* Chatbot toggle — fixed right edge button (only visible while writing) */}
            {!savedEntry && (
                <button
                    onClick={() => setChatOpen(true)}
                    aria-label="Open AI companion"
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-30
                               bg-secondary border border-border text-muted-foreground
                               hover:text-primary hover:border-primary/50
                               transition-all px-2 py-6 rounded-l-lg
                               font-mono-label text-[10px] [writing-mode:vertical-lr]
                               rotate-180 tracking-widest"
                >
                    ◆ Help me feel better
                </button>
            )}

            {/* Chatbot slide-in panel */}
            <ChatPanel
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                entryContent={content}
                entryEmotion={writingEmotion}
                entryId={savedEntry?.id ?? null}
            />
        </div>
    )
}
