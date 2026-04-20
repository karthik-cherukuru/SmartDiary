/**
 * JournalView — read-only display of a past journal entry.
 *
 * Route: /journal/:id
 *
 * Shows:
 *  - Entry date, emotion badge, word count
 *  - Full entry text in a Card
 *  - All saved chat messages for this entry in a ScrollArea
 *  - Option to open ChatPanel to continue the conversation
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import Navbar from '@/components/layout/Navbar'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator }  from '@/components/ui/separator'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'

import MoodBadge  from '@/components/shared/MoodBadge'
import ChatPanel  from '@/components/chatbot/ChatPanel'

import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getEntryById }  from '@/services/journalService'
import { getMessages }   from '@/services/chatbotService'

/**
 * Format date as "Tuesday, April 21, 2026"
 */
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

    const [entry,       setEntry]       = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [loading,     setLoading]     = useState(true)
    const [chatOpen,    setChatOpen]    = useState(false)

    useEffect(() => {
        if (!user || !id) return

        Promise.all([
            getEntryById(id),
            getMessages(user.id, id),
        ])
            .then(([fetchedEntry, fetchedMessages]) => {
                setEntry(fetchedEntry)
                setChatHistory(fetchedMessages)

                // Apply corrective theme for the past entry's emotion
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
            className="min-h-screen"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
                {/* Back link */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="font-mono-label text-xs text-muted-foreground"
                >
                    ← Back to Dashboard
                </Button>

                {loading ? (
                    // Loading skeleton
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ) : entry ? (
                    <>
                        {/* Entry card */}
                        <Card className="shadow-brutal-muted">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="font-heading text-lg">
                                            {formatFull(entry.created_at)}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <MoodBadge emotion={entry.emotion_label} />
                                            <span className="font-mono-label text-[10px]">
                                                {entry.word_count ?? 0} words
                                            </span>
                                        </CardDescription>
                                    </div>

                                    {/* Open chatbot for this entry */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-mono-label text-xs shrink-0"
                                        onClick={() => setChatOpen(true)}
                                    >
                                        ◆ Talk about this
                                    </Button>
                                </div>
                            </CardHeader>

                            <Separator />

                            <CardContent className="pt-5">
                                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                    {entry.content}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Chat history for this entry */}
                        {chatHistory.length > 0 && (
                            <Card className="shadow-brutal-muted">
                                <CardHeader className="pb-3">
                                    <CardTitle className="font-heading text-sm text-muted-foreground font-normal">
                                        Conversation with Sage
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <ScrollArea className="max-h-80 px-6 pb-4">
                                        <div className="space-y-3">
                                            {chatHistory.map((msg, idx) => (
                                                <div
                                                    key={idx}
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
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : null}
            </main>

            {/* Chat panel for continuing conversation */}
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
