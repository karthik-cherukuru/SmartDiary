/**
 * MoodBadge — emotion label with icon and color tint (no emoji glyphs).
 */
import {
    Smile,
    Zap,
    Flame,
    Cloud,
    ThumbsDown,
    HeartCrack,
    Circle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { EMOTION_COLOR } from '@/data/themes'

const EMOTION_ICON = {
    joy:      Smile,
    surprise: Zap,
    anger:    Flame,
    fear:     Cloud,
    disgust:  ThumbsDown,
    sadness:  HeartCrack,
    neutral:  Circle,
}

export default function MoodBadge({ emotion, showIcon = true, className = '' }) {
    if (!emotion) return null

    const color = EMOTION_COLOR[emotion] ?? '#64748B'
    const Icon  = EMOTION_ICON[emotion] ?? Circle

    return (
        <Badge
            className={`font-mono-label capitalize text-[10px] px-2 py-0.5 gap-1 ${className}`}
            style={{
                backgroundColor: `${color}18`,
                borderColor:     `${color}55`,
                color:           color,
                border:          '1px solid',
            }}
            variant="outline"
        >
            {showIcon && (
                <Icon className="h-3 w-3 shrink-0" aria-hidden />
            )}
            {emotion}
        </Badge>
    )
}
