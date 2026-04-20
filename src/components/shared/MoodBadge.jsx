/**
 * MoodBadge — a colored badge showing an emotion label.
 *
 * Uses the EMOTION_COLOR map to apply the correct accent color as a
 * background tint and border. Keeps the text dark for legibility.
 */
import { Badge } from '@/components/ui/badge'
import { EMOTION_COLOR } from '@/data/themes'

// Emoji/icon associated with each emotion (for compact display)
const EMOTION_ICON = {
    joy:      '✦',
    surprise: '◈',
    anger:    '▲',
    fear:     '◆',
    disgust:  '⬟',
    sadness:  '◇',
    neutral:  '○',
}

export default function MoodBadge({ emotion, showIcon = true, className = '' }) {
    if (!emotion) return null

    const color = EMOTION_COLOR[emotion] ?? '#9CA3AF'
    const icon  = EMOTION_ICON[emotion] ?? '○'

    return (
        <Badge
            className={`font-mono-label capitalize text-[10px] px-2 py-0.5 ${className}`}
            style={{
                backgroundColor: `${color}22`,
                borderColor:     `${color}66`,
                color:           color,
                border:          '1px solid',
            }}
            variant="outline"
        >
            {showIcon && (
                <span className="mr-1" aria-hidden="true">
                    {icon}
                </span>
            )}
            {emotion}
        </Badge>
    )
}
