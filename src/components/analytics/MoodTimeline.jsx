/**
 * MoodTimeline — Recharts AreaChart showing emotion scores over time.
 *
 * Maps each emotion label to a numeric y-axis score (1–7) and renders
 * a colored area under the curve, with the line colored by each emotion's
 * accent color.
 */
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts'

import { EMOTION_COLOR } from '@/data/themes'
import EmptyState from '@/components/shared/EmptyState'

// Numeric score for each emotion label (for y-axis ordering)
const EMOTION_SCORE = {
    joy:      7,
    surprise: 6,
    neutral:  4,
    fear:     3,
    sadness:  2,
    disgust:  2,
    anger:    1,
}

/**
 * Transform raw journal_entries into chart data points.
 *
 * @param {object[]} entries
 * @returns {object[]}  { date, score, emotion, color }
 */
function buildChartData(entries) {
    return entries.map(entry => ({
        date:    new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score:   EMOTION_SCORE[entry.emotion_label] ?? 4,
        emotion: entry.emotion_label ?? 'neutral',
        color:   EMOTION_COLOR[entry.emotion_label] ?? '#9CA3AF',
    }))
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
            <p className="text-muted-foreground mb-0.5">{label}</p>
            <p className="font-semibold capitalize" style={{ color: d.color }}>
                {d.emotion}
            </p>
        </div>
    )
}

export default function MoodTimeline({ entries = [] }) {
    if (entries.length === 0) {
        return (
            <EmptyState
                title="No entries yet"
                description="Your mood timeline will appear here after your first entry."
            />
        )
    }

    const data = buildChartData(entries)

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}    />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" vertical={false} />

                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'oklch(0.55 0 0)', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    domain={[1, 7]}
                    hide
                />

                <RechartsTooltip content={<CustomTooltip />} />

                <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#F59E0B' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
