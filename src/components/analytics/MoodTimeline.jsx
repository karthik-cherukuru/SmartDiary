/**
 * MoodTimeline — area chart (solid fill, no gradients).
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

const EMOTION_SCORE = {
    joy:      7,
    surprise: 6,
    neutral:  4,
    fear:     3,
    sadness:  2,
    disgust:  2,
    anger:    1,
}

const STROKE = '#6D28D9'

function buildChartData(entries) {
    return entries.map(entry => ({
        date:    new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score:   EMOTION_SCORE[entry.emotion_label] ?? 4,
        emotion: entry.emotion_label ?? 'neutral',
        color:   EMOTION_COLOR[entry.emotion_label] ?? '#64748B',
    }))
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs flat-card">
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
                description="Your mood timeline appears after your first journal entry."
            />
        )
    }

    const data = buildChartData(entries)

    return (
        <div className="w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'var(--font-sans)' }}
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
                        stroke={STROKE}
                        strokeWidth={2.5}
                        fill={STROKE}
                        fillOpacity={0.12}
                        dot={{ r: 4, fill: STROKE, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: STROKE }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
