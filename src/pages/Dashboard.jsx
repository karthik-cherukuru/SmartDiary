/**
 * Dashboard — the central hub after login.
 *
 * Applies:
 *  - Associative mode if no entry was written today
 *  - Corrective mode after the user saves an entry (passed via location state
 *    from the Journal page)
 *
 * Layout: three-column grid (streak | today card | recent entries)
 * All components use shadcn primitives.
 *
 * Confetti fires when a streak milestone is hit (triggered from Journal page
 * via location state).
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

/**
 * Check if any of the given entries were created today.
 */
function hasEntryToday(entries) {
    const today = new Date().toDateString()
    return entries.some(e => new Date(e.created_at).toDateString() === today)
}

/**
 * Fire a celebratory confetti burst.
 */
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

    // Reset loading ref on mount
    useEffect(() => {
        loadingRef.current = false
    }, [])

    // Fetch entries and streak on mount
    const loadData = useCallback(async () => {
        // Wait for auth to finish before attempting to load
        if (authLoading) return

        if (!user?.id) {
            setLoadingData(false)
            return
        }

        // Prevent concurrent loading
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

    // loadData is stable (useCallback); state is only set in async callbacks, not synchronously
    useEffect(() => {
        loadData()
    }, [loadData])

    // Apply the correct theme mode based on today's entries
    useEffect(() => {
        if (loadingData || entries.length === 0) {
            setEmotion('neutral', 'associative')
            return
        }

        const lastEntry   = entries[0]
        const wroteToday  = hasEntryToday(entries)
        const themeMode   = wroteToday ? 'corrective' : 'associative'

        setEmotion(lastEntry.emotion_label ?? 'neutral', themeMode)
    }, [entries, loadingData, setEmotion])

    // Handle post-save state from Journal page (confetti + toast)
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

        // Clear location state so it doesn't re-trigger on back navigation
        window.history.replaceState({}, '')
    }, [location.state])

    const lastEmotion    = entries[0]?.emotion_label ?? null
    const wroteToday     = hasEntryToday(entries)

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--theme-bg-primary, var(--background))' }}
        >
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                {/* Greeting */}
                <header className="mb-10">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                        {profile?.display_name
                            ? `Good to see you, ${profile.display_name}.`
                            : 'Welcome back.'}
                    </h1>
                    <p className="text-muted-foreground text-base mt-2">
                        {wroteToday
                            ? "You've written today. Your diary is up to date."
                            : "Your diary is waiting. Take a few minutes to check in."}
                    </p>
                </header>

                {/* Three-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Col 1 — Streak */}
                    <div className="md:col-span-1">
                        <StreakWidget
                            streakData={streakData}
                            onFreezeUsed={loadData}
                        />
                    </div>

                    {/* Col 2 — Today CTA */}
                    <div className="md:col-span-1">
                        <TodayCard
                            lastEmotion={lastEmotion}
                            hasWrittenToday={wroteToday}
                        />
                    </div>

                    {/* Col 3 — Recent entries */}
                    <div className="md:col-span-1">
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
