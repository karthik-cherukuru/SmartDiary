/**
 * Analytics — visualizes the user's emotional history.
 *
 * Four tabs:
 *  - Timeline  : mood area chart over time
 *  - Frequency : emotion frequency donut chart
 *  - Balance   : positive/negative stacked bar by week
 *  - Calendar  : GitHub-style activity heatmap
 *
 * All charts show EmptyState when no entries exist.
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import Navbar from '@/components/layout/Navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import MoodTimeline    from '@/components/analytics/MoodTimeline'
import EmotionDonut    from '@/components/analytics/EmotionDonut'
import BalanceBar      from '@/components/analytics/BalanceBar'
import CalendarHeatmap from '@/components/analytics/CalendarHeatmap'

import { useAuth }        from '@/context/AuthContext'
import { getAllEntries }   from '@/services/journalService'
import { EMOTION_COLOR } from '@/data/themes'

/**
 * Highlight stats so the analytics page feels complete when data exists.
 */
function AnalyticsSummary({ entries }) {
    if (!entries?.length) return null

    const counts = {}
    for (const e of entries) {
        const label = e.emotion_label ?? 'neutral'
        counts[label] = (counts[label] ?? 0) + 1
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const thisWeek = entries.filter(e => new Date(e.created_at) >= weekAgo).length

    const color = EMOTION_COLOR[top[0]] ?? '#64748B'

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="rounded-2xl border border-border flat-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-heading text-4xl font-bold tabular-nums">{entries.length}</p>
                </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border flat-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Most common tone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-heading text-2xl font-semibold capitalize" style={{ color }}>
                        {top[0]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{top[1]} entries</p>
                </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border flat-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 days</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-heading text-4xl font-bold tabular-nums">{thisWeek}</p>
                    <p className="text-xs text-muted-foreground mt-1">entries logged</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function Analytics() {
    const { user } = useAuth()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        getAllEntries(user.id)
            .then(data => setEntries(data))
            .catch(err => {
                console.error('[Analytics] load error:', err.message)
                toast.error('Could not load analytics data.')
            })
            .finally(() => setLoading(false))
    }, [user])

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
                <header className="mb-10">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground text-base mt-2">
                        Your emotional patterns over time — {entries.length} {entries.length === 1 ? 'entry' : 'entries'} recorded.
                    </p>
                </header>

                {!loading && <AnalyticsSummary entries={entries} />}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <Tabs defaultValue="timeline" className="space-y-6">
                        {/* Tab switcher */}
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-3xl h-auto sm:h-11 gap-1">
                            <TabsTrigger value="timeline"  className="font-mono-label text-xs py-2.5">Timeline</TabsTrigger>
                            <TabsTrigger value="frequency" className="font-mono-label text-xs py-2.5">Frequency</TabsTrigger>
                            <TabsTrigger value="balance"   className="font-mono-label text-xs py-2.5">Balance</TabsTrigger>
                            <TabsTrigger value="calendar"  className="font-mono-label text-xs py-2.5">Calendar</TabsTrigger>
                        </TabsList>

                        {/* ---- Timeline tab ---- */}
                        <TabsContent value="timeline">
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <CardTitle className="font-heading text-lg sm:text-xl">Mood over time</CardTitle>
                                    <CardDescription className="text-xs">
                                        Each point represents one entry. Higher = more positive.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MoodTimeline entries={entries} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ---- Frequency tab ---- */}
                        <TabsContent value="frequency">
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <CardTitle className="font-heading text-lg sm:text-xl">Emotion frequency</CardTitle>
                                    <CardDescription className="text-xs">
                                        Which emotions appear most in your writing.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EmotionDonut entries={entries} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ---- Balance tab ---- */}
                        <TabsContent value="balance">
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <CardTitle className="font-heading text-lg sm:text-xl">Weekly balance</CardTitle>
                                    <CardDescription className="text-xs">
                                        Positive, neutral, and negative days per week.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BalanceBar entries={entries} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ---- Calendar tab ---- */}
                        <TabsContent value="calendar">
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <CardTitle className="font-heading text-lg sm:text-xl">Activity calendar</CardTitle>
                                    <CardDescription className="text-xs">
                                        Last 16 weeks — each square colored by the day's detected emotion.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CalendarHeatmap entries={entries} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    )
}
