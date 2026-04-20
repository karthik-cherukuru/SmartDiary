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
                <header className="mb-8">
                    <h1 className="font-heading text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Your emotional patterns over time — {entries.length} {entries.length === 1 ? 'entry' : 'entries'} recorded.
                    </p>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <Tabs defaultValue="timeline" className="space-y-6">
                        {/* Tab switcher */}
                        <TabsList className="grid w-full grid-cols-4 max-w-md">
                            <TabsTrigger value="timeline"  className="font-mono-label text-xs">Timeline</TabsTrigger>
                            <TabsTrigger value="frequency" className="font-mono-label text-xs">Frequency</TabsTrigger>
                            <TabsTrigger value="balance"   className="font-mono-label text-xs">Balance</TabsTrigger>
                            <TabsTrigger value="calendar"  className="font-mono-label text-xs">Calendar</TabsTrigger>
                        </TabsList>

                        {/* ---- Timeline tab ---- */}
                        <TabsContent value="timeline">
                            <Card className="shadow-brutal-muted">
                                <CardHeader>
                                    <CardTitle className="font-heading text-base">Mood over time</CardTitle>
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
                            <Card className="shadow-brutal-muted">
                                <CardHeader>
                                    <CardTitle className="font-heading text-base">Emotion frequency</CardTitle>
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
                            <Card className="shadow-brutal-muted">
                                <CardHeader>
                                    <CardTitle className="font-heading text-base">Weekly balance</CardTitle>
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
                            <Card className="shadow-brutal-muted">
                                <CardHeader>
                                    <CardTitle className="font-heading text-base">Activity calendar</CardTitle>
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
