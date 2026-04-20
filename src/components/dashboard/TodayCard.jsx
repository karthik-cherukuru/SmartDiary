/**
 * TodayCard — date, emotion, and CTA to write (flat light card).
 */
import { Link } from 'react-router-dom'
import { PenLine, Sparkles, Leaf } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import MoodBadge  from '@/components/shared/MoodBadge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/context/ThemeContext'

function formatToday() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month:   'long',
        day:     'numeric',
    })
}

export default function TodayCard({ lastEmotion, hasWrittenToday }) {
    const { mode } = useTheme()

    const modeLabel = mode === 'corrective' ? 'Calm palette' : 'Mirroring palette'
    const modeDesc  = mode === 'corrective'
        ? 'Grounding colors after your last save'
        : 'Colors echo your recent emotional tone'

    return (
        <Card className="rounded-2xl border border-border bg-card flat-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="font-heading text-sm text-muted-foreground font-normal">
                        {formatToday()}
                    </CardTitle>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className="font-mono-label text-[10px] cursor-default gap-1 border-primary/25 bg-primary/5 text-primary"
                            >
                                {mode === 'corrective' ? (
                                    <Leaf className="h-3 w-3" aria-hidden />
                                ) : (
                                    <Sparkles className="h-3 w-3" aria-hidden />
                                )}
                                {modeLabel}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                            {modeDesc}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider">
                        Last detected emotion
                    </p>
                    {lastEmotion
                        ? <MoodBadge emotion={lastEmotion} />
                        : <p className="text-sm text-muted-foreground italic">No entries yet</p>
                    }
                </div>

                <p className="text-base text-muted-foreground leading-relaxed">
                    {hasWrittenToday
                        ? "You've written today. Come back tomorrow to keep your streak alive."
                        : "Today's entry is waiting for you."}
                </p>

                <Button
                    asChild
                    className="w-full h-12 rounded-full text-base"
                    size="lg"
                    variant={hasWrittenToday ? 'outline' : 'default'}
                >
                    <Link to="/journal" className="gap-2">
                        <PenLine className="h-5 w-5" />
                        {hasWrittenToday ? 'Write another entry' : 'Write today\'s entry'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
