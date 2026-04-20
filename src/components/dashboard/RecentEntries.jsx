/**
 * RecentEntries — lists the user's recent journal entries.
 *
 * Each item shows:
 *  - Date
 *  - Emotion badge
 *  - First ~120 chars of the entry as an excerpt
 *  - Word count
 *
 * Clicking an entry navigates to /journal/:id for full view.
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator }  from '@/components/ui/separator'
import { Skeleton }   from '@/components/ui/skeleton'

import EmptyState from '@/components/shared/EmptyState'
import MoodBadge  from '@/components/shared/MoodBadge'

/**
 * Format a date string like "Apr 21"
 */
function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day:   'numeric',
    })
}

/**
 * Truncate content to a given character limit.
 */
function excerpt(text, limit = 120) {
    if (!text) return ''
    return text.length > limit ? text.slice(0, limit).trimEnd() + '…' : text
}

// Card entrance animation
const itemVariants = {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export default function RecentEntries({ entries = [], loading = false }) {
    return (
        <Card className="shadow-brutal-muted flex flex-col h-full">
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm flex items-center justify-between">
                    <span>Recent Entries</span>
                    <span className="font-mono-label text-[10px] text-muted-foreground">
                        {entries.length > 0 ? `${entries.length} shown` : ''}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                {loading ? (
                    // Loading skeleton
                    <div className="space-y-3 px-6 py-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <EmptyState
                        title="No entries yet"
                        description="Write your first entry to see it here."
                    />
                ) : (
                    <ScrollArea className="h-[360px] px-6">
                        <motion.ul
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                            className="space-y-0"
                        >
                            {entries.map((entry, idx) => (
                                <motion.li key={entry.id} variants={itemVariants}>
                                    {idx > 0 && <Separator className="my-0" />}
                                    <Link
                                        to={`/journal/${entry.id}`}
                                        className="block py-4 group"
                                    >
                                        {/* Top row: date + emotion */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-mono-label text-[10px] text-muted-foreground">
                                                {formatDate(entry.created_at)}
                                            </span>
                                            <MoodBadge emotion={entry.emotion_label} />
                                        </div>

                                        {/* Excerpt */}
                                        <p className="text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                            {excerpt(entry.content)}
                                        </p>

                                        {/* Word count */}
                                        <p className="font-mono-label text-[10px] text-muted-foreground mt-1.5">
                                            {entry.word_count ?? 0} words
                                        </p>
                                    </Link>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
