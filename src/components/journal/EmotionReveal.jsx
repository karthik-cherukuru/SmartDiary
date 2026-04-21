/**
 * EmotionReveal — detected emotion + associative (supportive) line after save.
 */
import { motion } from 'framer-motion'
import {
    Smile,
    Zap,
    Flame,
    Cloud,
    ThumbsDown,
    HeartCrack,
    Circle,
} from 'lucide-react'

import MoodBadge  from '@/components/shared/MoodBadge'
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

export default function EmotionReveal({ emotion, confidence, associativeQuote, onContinue }) {
    if (!emotion) return null

    const color   = EMOTION_COLOR[emotion] ?? '#64748B'
    const percentage = confidence != null
        ? `${Math.round(confidence * 100)}%`
        : null

    const Icon = EMOTION_ICON[emotion] ?? Circle

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="flex flex-col items-center gap-6 py-12 text-center max-w-lg mx-auto px-4"
        >
            <div
                className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-border bg-card flat-card"
                style={{ borderColor: `${color}55` }}
            >
                <Icon className="h-11 w-11" style={{ color }} aria-hidden />
            </div>

            <div className="space-y-3">
                <p className="font-mono-label text-xs text-muted-foreground uppercase tracking-widest">
                    Detected emotion
                </p>
                <MoodBadge emotion={emotion} className="text-sm px-4 py-1.5" />
                {percentage && (
                    <p className="font-mono-label text-[11px] text-muted-foreground">
                        {percentage} confidence
                    </p>
                )}
            </div>

            {associativeQuote && (
                <div className="w-full max-w-md rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-left">
                    <p className="font-mono-label text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        A word alongside you
                    </p>
                    <p className="text-base leading-relaxed text-foreground">{associativeQuote}</p>
                </div>
            )}

            <button
                type="button"
                onClick={onContinue}
                className="font-mono-label text-sm text-primary hover:underline mt-2 focus:outline-none focus:underline"
            >
                Return to dashboard
            </button>
        </motion.div>
    )
}
