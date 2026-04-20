/**
 * TodayCard — shows today's date, last recorded emotion, and the
 * primary CTA to write today's entry.
 *
 * Also shows the current theme mode (Associative / Corrective) as a
 * subtle status badge so the user knows what mode the dashboard is in.
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import MoodBadge  from '@/components/shared/MoodBadge'
import { useTheme } from '@/context/ThemeContext'

/**
 * Format today's date as "Tuesday, April 21"
 */
function formatToday() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month:   'long',
        day:     'numeric',
    })
}

export default function TodayCard({ lastEmotion, hasWrittenToday }) {
    const { mode } = useTheme()

    const modeLabel = mode === 'corrective' ? 'Corrective' : 'Associative'
    const modeDesc  = mode === 'corrective'
        ? 'Healing palette active'
        : 'Emotion-mirroring palette'

    return (
        <Card className="shadow-brutal">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-sm text-muted-foreground font-normal">
                        {formatToday()}
                    </CardTitle>

                    {/* Theme mode indicator */}
                    <Tooltip_stub>
                        <Badge
                            variant="outline"
                            className="font-mono-label text-[10px] cursor-default"
                            style={{
                                borderColor: mode === 'corrective' ? '#38BDF833' : '#F59E0B33',
                                color:       mode === 'corrective' ? '#38BDF8'   : '#F59E0B',
                                backgroundColor: mode === 'corrective' ? '#38BDF808' : '#F59E0B08',
                            }}
                            title={modeDesc}
                        >
                            {mode === 'corrective' ? '◇' : '✦'} {modeLabel}
                        </Badge>
                    </Tooltip_stub>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Last detected emotion */}
                <div className="space-y-1">
                    <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider">
                        Last detected emotion
                    </p>
                    {lastEmotion
                        ? <MoodBadge emotion={lastEmotion} />
                        : <p className="text-sm text-muted-foreground italic">No entries yet</p>
                    }
                </div>

                {/* Status message */}
                <p className="text-sm text-muted-foreground leading-snug">
                    {hasWrittenToday
                        ? "You've written today. Come back tomorrow to keep your streak alive."
                        : "Today's entry is waiting for you."}
                </p>

                {/* Primary CTA */}
                <Button
                    asChild
                    className="w-full shadow-brutal"
                    size="lg"
                    variant={hasWrittenToday ? 'outline' : 'default'}
                >
                    <Link to="/journal">
                        {hasWrittenToday ? '✎  Write again' : '✎  Write today\'s entry'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

// Tiny wrapper so we don't need Tooltip import just for title attr
function Tooltip_stub({ children }) {
    return children
}
