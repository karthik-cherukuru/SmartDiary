/**
 * StreakWidget — displays the user's current writing streak.
 *
 * Shows:
 *  - Current streak count with a flame icon
 *  - Progress bar toward the next milestone
 *  - Longest streak stat
 *  - Freeze token count + button to activate a freeze
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress }  from '@/components/ui/progress'
import { Button }    from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge }     from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { activateFreeze, STREAK_MILESTONES } from '@/services/streakService'
import { useAuth } from '@/context/AuthContext'

/**
 * Return the next milestone above the current streak value.
 * Returns null if the user has passed all milestones.
 *
 * @param {number} current
 * @returns {number|null}
 */
function nextMilestone(current) {
    return STREAK_MILESTONES.find(m => m > current) ?? null
}

export default function StreakWidget({ streakData, onFreezeUsed }) {
    const { user } = useAuth()
    const [freezing, setFreezing] = useState(false)

    const current  = streakData?.current_streak  ?? 0
    const longest  = streakData?.longest_streak  ?? 0
    const freezes  = streakData?.freeze_tokens_remaining ?? 0

    const nextTarget = nextMilestone(current)
    const progress   = nextTarget
        ? Math.round((current / nextTarget) * 100)
        : 100

    const handleActivateFreeze = async () => {
        if (freezes <= 0) {
            toast.error('No freeze tokens remaining.')
            return
        }

        setFreezing(true)
        try {
            const remaining = await activateFreeze(user.id)
            toast.success(`Freeze activated! ${remaining} token${remaining !== 1 ? 's' : ''} left.`)
            onFreezeUsed?.()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setFreezing(false)
        }
    }

    return (
        <Card className="shadow-brutal-muted">
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm flex items-center justify-between">
                    <span>Writing Streak</span>
                    <Badge
                        variant="outline"
                        className="font-mono-label text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-400"
                    >
                        ▲ streak
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Big streak number */}
                <motion.div
                    key={current}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-end gap-2"
                >
                    <span className="font-heading text-5xl font-bold text-foreground leading-none">
                        {current}
                    </span>
                    <span className="text-muted-foreground font-mono-label text-sm pb-1">
                        {current === 1 ? 'day' : 'days'}
                    </span>
                </motion.div>

                {/* Progress toward next milestone */}
                {nextTarget && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between font-mono-label text-[10px] text-muted-foreground">
                            <span>Next milestone</span>
                            <span>{current} / {nextTarget}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}

                <Separator />

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                            Longest
                        </p>
                        <p className="font-heading text-xl font-semibold">{longest}</p>
                    </div>

                    <div>
                        <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                            Freeze tokens
                        </p>
                        <div className="flex items-center gap-1.5">
                            <p className="font-heading text-xl font-semibold">{freezes}</p>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-mono-label"
                                        onClick={handleActivateFreeze}
                                        disabled={freezes <= 0 || freezing}
                                    >
                                        {freezing ? '...' : '◆ use'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p className="text-xs">
                                        Protect your streak for a missed day
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
