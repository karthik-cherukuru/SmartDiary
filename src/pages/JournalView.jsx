/**
 * JournalView — past entry + Sage (opens from route state when requested).
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Bot, MessageCircle } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Separator }  from '@/components/ui/separator'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'

import MoodBadge  from '@/components/shared/MoodBadge'
import ChatPanel  from '@/components/chatbot/ChatPanel'

import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getEntryById }  from '@/services/journalService'
import { getMessages } from '@/services/chatbotService'

function formatFull(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
    })
}

export default function JournalView() {
    const { id }         = useParams()
    const { user }       = useAuth()
    const { setEmotion } = useTheme()
    const navigate       = useNavigate()
    const location       = useLocation()

    const [entry,       setEntry]       = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [loading,     setLoading]     = useState(true)
    const [chatOpen,    setChatOpen]    = useState(false)

    useEffect(() => {
        if (location.state?.openSage) {
            setChatOpen(true)
            window.history.replaceState({}, '', location.pathname + location.search)
        }
    }, [location.state, location.pathname, location.search])

    useEffect(() => {
        if (!user || !id) return

        Promise.all([
            getEntryById(id),
            getMessages(user.id, id),
        ])
            .then(([fetchedEntry, fetchedMessages]) => {
                setEntry(fetchedEntry)
                setChatHistory(fetchedMessages)

                setEmotion(fetchedEntry?.emotion_label ?? 'neutral', 'corrective')
            })
            .catch(err => {
                console.error('[JournalView] load error:', err.message)
                toast.error('Could not load this entry.')
                navigate('/dashboard')
            })
            .finally(() => setLoading(false))
    }, [id, user, setEmotion, navigate])

    return (
        <div
            className="min-h-screen bg-background"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="font-mono-label text-xs text-muted-foreground gap-2 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-2/3 rounded-xl" />
                        <Skeleton className="h-4 w-1/4 rounded-lg" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                ) : entry ? (
                    <>
                        <Card className="flat-card rounded-2xl border border-border">
                            <CardHeader className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="space-y-2">
                                        <CardTitle className="font-heading text-xl sm:text-2xl">
                                            {formatFull(entry.created_at)}
                                        </CardTitle>
                                        <CardDescription className="flex flex-wrap items-center gap-2 text-base">
                                            <MoodBadge emotion={entry.emotion_label} />
                                            <span className="font-mono-label text-[11px]">
                                                {entry.word_count ?? 0} words
                                            </span>
                                        </CardDescription>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="lg"
                                        className="font-mono-label text-sm rounded-full shrink-0 border border-border h-12 px-6"
                                        onClick={() => setChatOpen(true)}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Sage
                                    </Button>
                                </div>
                            </CardHeader>

                            <Separator />

                            <CardContent className="pt-6">
                                <p className="text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                                    {entry.content}
                                </p>
                            </CardContent>
                        </Card>

                        {chatHistory.length > 0 && (
                            <Card className="flat-card rounded-2xl border border-border overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="font-heading text-base flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-primary" />
                                        Sage conversation
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Messages stay with this entry — open Sage to continue.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-0">
                                    {/* Native overflow: reliable scroll on mobile inside cards */}
                                    <div
                                        className="max-h-[min(28rem,60svh)] overflow-y-auto overscroll-y-contain touch-pan-y px-5 sm:px-6 py-3 [-webkit-overflow-scrolling:touch]"
                                    >
                                        <ul className="space-y-3 pb-2">
                                            {chatHistory.map((msg, idx) => (
                                                <li
                                                    key={msg.id ?? idx}
                                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {msg.role === 'assistant' && (
                                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                                                            <Bot className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                                                            msg.role === 'user'
                                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                                : 'bg-muted text-foreground rounded-bl-md border border-border'
                                                        }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : null}
            </main>

            <ChatPanel
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                entryContent={entry?.content ?? ''}
                entryEmotion={entry?.emotion_label ?? 'neutral'}
                entryId={id}
            />
        </div>
    )
}
