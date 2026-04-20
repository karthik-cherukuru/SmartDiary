/**
 * EmotionReveal — slides up after a journal entry is saved to show
 * the detected emotion label and confidence score.
 *
 * Uses Framer Motion spring animation.
 */
import { motion } from 'framer-motion'
import MoodBadge  from '@/components/shared/MoodBadge'
import { EMOTION_COLOR } from '@/data/themes'

export default function EmotionReveal({ emotion, confidence, onContinue }) {
    if (!emotion) return null

    const color      = EMOTION_COLOR[emotion] ?? '#9CA3AF'
    const percentage = confidence != null
        ? `${Math.round(confidence * 100)}%`
        : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="flex flex-col items-center gap-4 py-10 text-center"
        >
            {/* Glowing circle */}
            <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                    backgroundColor: `${color}18`,
                    border:          `1px solid ${color}44`,
                    boxShadow:       `0 0 40px ${color}22`,
                }}
            >
                <span className="text-3xl" aria-hidden="true">
                    {emotion === 'joy'      && '✦'}
                    {emotion === 'surprise' && '◈'}
                    {emotion === 'anger'    && '▲'}
                    {emotion === 'fear'     && '◆'}
                    {emotion === 'disgust'  && '⬟'}
                    {emotion === 'sadness'  && '◇'}
                    {emotion === 'neutral'  && '○'}
                </span>
            </div>

            <div className="space-y-2">
                <p className="font-mono-label text-xs text-muted-foreground uppercase tracking-widest">
                    Detected emotion
                </p>
                <MoodBadge emotion={emotion} className="text-sm px-3 py-1" />
                {percentage && (
                    <p className="font-mono-label text-[11px] text-muted-foreground">
                        {percentage} confidence
                    </p>
                )}
            </div>

            {/* Action */}
            <button
                onClick={onContinue}
                className="font-mono-label text-xs text-primary hover:underline mt-2 focus:outline-none"
            >
                Return to dashboard →
            </button>
        </motion.div>
    )
}
