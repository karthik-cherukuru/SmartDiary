/**
 * RecentEntries — journal list + quick Sage entry for each row.
 */
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator }  from '@/components/ui/separator'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'

import EmptyState from '@/components/shared/EmptyState'
import MoodBadge  from '@/components/shared/MoodBadge'

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day:   'numeric',
    })
}

function excerpt(text, limit = 120) {
    if (!text) return ''
    return text.length > limit ? text.slice(0, limit).trimEnd() + '…' : text
}

const itemVariants = {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export default function RecentEntries({ entries = [], loading = false }) {
    const navigate = useNavigate()

    return (
        <Card className="flex flex-col h-full rounded-2xl border border-border bg-card flat-card">
            <CardHeader className="pb-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-heading text-lg">Recent entries</CardTitle>
                    <span className="font-mono-label text-[10px] text-muted-foreground pt-1">
                        {entries.length > 0 ? `${entries.length} shown` : ''}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                    Open Sage from an entry to reflect on that day&apos;s writing in context.
                </p>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                {loading ? (
                    <div className="space-y-3 px-6 py-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-1/3 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-3 w-2/3 rounded" />
                            </div>
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <EmptyState
                        title="No entries yet"
                        description="Write your first entry to see it here."
                    />
                ) : (
                    <ScrollArea className="h-[380px] px-4 sm:px-6">
                        <motion.ul
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                            className="space-y-0"
                        >
                            {entries.map((entry, idx) => (
                                <motion.li key={entry.id} variants={itemVariants}>
                                    {idx > 0 && <Separator className="my-0" />}
                                    <div className="flex gap-2 sm:gap-3 py-5 items-start">
                                        <Link
                                            to={`/journal/${entry.id}`}
                                            className="flex-1 min-w-0 block group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono-label text-[11px] text-muted-foreground">
                                                    {formatDate(entry.created_at)}
                                                </span>
                                                <MoodBadge emotion={entry.emotion_label} />
                                            </div>

                                            <p className="text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {excerpt(entry.content)}
                                            </p>

                                            <p className="font-mono-label text-[11px] text-muted-foreground mt-2">
                                                {entry.word_count ?? 0} words
                                            </p>
                                        </Link>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="shrink-0 h-11 w-11 rounded-xl border border-border mt-1"
                                            aria-label={`Open Sage for entry from ${formatDate(entry.created_at)}`}
                                            onClick={() => {
                                                navigate(`/journal/${entry.id}`, {
                                                    state: { openSage: true },
                                                })
                                            }}
                                        >
                                            <MessageCircle className="h-5 w-5 text-primary" />
                                        </Button>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
