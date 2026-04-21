/**
 * Dashboard — hub: greeting, corrective line (latest entry), streak, today card, recent entries.
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

import Navbar        from '@/components/layout/Navbar'
import StreakWidget  from '@/components/dashboard/StreakWidget'
import TodayCard     from '@/components/dashboard/TodayCard'
import RecentEntries from '@/components/dashboard/RecentEntries'

import { useAuth }  from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

import { getEntries }    from '@/services/journalService'
import { getStreak }     from '@/services/streakService'

function hasEntryToday(entries) {
    const today = new Date().toDateString()
    return entries.some(e => new Date(e.created_at).toDateString() === today)
}

function fireConfetti() {
    confetti({
        particleCount: 140,
        spread:        80,
        origin:        { y: 0.6 },
        colors:        ['#6D28D9', '#8B5CF6', '#C4B5FD', '#F5F3FF'],
    })
    setTimeout(() => {
        confetti({
            particleCount: 60,
            spread:        60,
            origin:        { x: 0.2, y: 0.7 },
            colors:        ['#6D28D9', '#E9D5FF'],
        })
    }, 300)
}

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth()
    const { setEmotion }    = useTheme()
    const location          = useLocation()

    const [entries,     setEntries]     = useState([])
    const [streakData,  setStreakData]  = useState(null)
    const [loadingData, setLoadingData] = useState(true)
    const loadingRef = useRef(false)

    useEffect(() => {
        loadingRef.current = false
    }, [])

    const loadData = useCallback(async () => {
        if (authLoading) return

        if (!user?.id) {
            setLoadingData(false)
            return
        }

        if (loadingRef.current) return

        loadingRef.current = true
        setLoadingData(true)

        try {
            const [fetchedEntries, fetchedStreak] = await Promise.all([
                getEntries(user.id, 20),
                getStreak(user.id),
            ])

            setEntries(fetchedEntries)
            setStreakData(fetchedStreak)
        } catch (err) {
            console.error('[Dashboard] loadData error:', err)
            toast.error(`Could not load your diary data: ${err.message}`)
        } finally {
            loadingRef.current = false
            setLoadingData(false)
        }
    }, [user, authLoading])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        if (loadingData || entries.length === 0) {
            setEmotion('neutral', 'associative')
            return
        }

        const lastEntry  = entries[0]
        const wroteToday = hasEntryToday(entries)
        const themeMode  = wroteToday ? 'corrective' : 'associative'

        setEmotion(lastEntry.emotion_label ?? 'neutral', themeMode)
    }, [entries, loadingData, setEmotion])

    useEffect(() => {
        const state = location.state

        if (state?.savedEntry) {
            toast.success('Entry saved and emotion detected.')
        }

        if (state?.isMilestone) {
            fireConfetti()
            toast.success(`${state.newStreak}-day streak milestone`, {
                duration: 5000,
            })
        }

        window.history.replaceState({}, '')
    }, [location.state])

    const lastEmotion = entries[0]?.emotion_label ?? null
    const wroteToday  = hasEntryToday(entries)
    /** Corrective line for days you have written (ties to dashboard copy about writing today). */
    const correctiveQuote =
        wroteToday && entries[0]?.corrective_quote?.trim()
            ? entries[0].corrective_quote.trim()
            : null

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <header className="mb-10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                        <div className="min-w-0 flex-1">
                            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                {profile?.display_name
                                    ? `Good to see you, ${profile.display_name}.`
                                    : 'Welcome back.'}
                            </h1>
                            <p className="text-muted-foreground text-base mt-2">
                                {wroteToday
                                    ? "You've written today. Your diary is up to date."
                                    : 'Your diary is waiting. Take a few minutes to check in.'}
                            </p>

                            {correctiveQuote && (
                                <div className="mt-4 rounded-2xl border border-border bg-secondary/50 px-4 py-4 lg:hidden">
                                    <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                        A thought for your path
                                    </p>
                                    <p className="text-sm sm:text-base leading-relaxed text-foreground">
                                        {correctiveQuote}
                                    </p>
                                </div>
                            )}
                        </div>

                        {correctiveQuote && (
                            <div
                                className="hidden lg:block w-full max-w-md shrink-0 rounded-2xl border border-border bg-secondary/50 px-5 py-4"
                            >
                                <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                    A thought for your path
                                </p>
                                <p className="text-sm leading-relaxed text-foreground">{correctiveQuote}</p>
                            </div>
                        )}
                    </div>
                </header>

                {/* Mobile: today card first, then streak, then recent. Desktop: three columns. */}
                <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-start">
                    <div className="order-1 md:order-none">
                        <TodayCard
                            lastEmotion={lastEmotion}
                            hasWrittenToday={wroteToday}
                        />
                    </div>

                    <div className="order-2 md:order-none">
                        <StreakWidget
                            streakData={streakData}
                            onFreezeUsed={loadData}
                        />
                    </div>

                    <div className="order-3 md:order-none">
                        <RecentEntries
                            entries={entries}
                            loading={loadingData}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
