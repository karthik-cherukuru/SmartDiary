/**
 * BalanceBar — stacked bar chart showing positive vs negative days per week.
 *
 * Positive emotions: joy, surprise
 * Negative emotions: anger, fear, disgust, sadness
 * Neutral:           neutral
 *
 * Groups entries by ISO week number and stacks the counts.
 */
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

import EmptyState from '@/components/shared/EmptyState'

// Emotion polarity classification
const POSITIVE = new Set(['joy', 'surprise'])
const NEGATIVE = new Set(['anger', 'fear', 'disgust', 'sadness'])

/**
 * Get ISO week label "Wk N" for a date.
 */
function weekLabel(dateStr) {
    const d = new Date(dateStr)
    const startOfYear = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
    return `Wk ${week}`
}

/**
 * Build per-week positive/negative/neutral counts.
 */
function buildWeeklyData(entries) {
    const weeks = {}

    for (const entry of entries) {
        const label  = weekLabel(entry.created_at)
        const emotion = entry.emotion_label ?? 'neutral'

        if (!weeks[label]) {
            weeks[label] = { week: label, positive: 0, negative: 0, neutral: 0 }
        }

        if (POSITIVE.has(emotion))      weeks[label].positive++
        else if (NEGATIVE.has(emotion)) weeks[label].negative++
        else                            weeks[label].neutral++
    }

    return Object.values(weeks)
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs flat-card space-y-1">
            <p className="text-muted-foreground font-mono-label">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.fill }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    )
}

export default function BalanceBar({ entries = [] }) {
    if (entries.length === 0) {
        return (
            <EmptyState
                title="No data yet"
                description="Your weekly balance will appear after a few entries."
            />
        )
    }

    const data = buildWeeklyData(entries)

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

                <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                />

                <RechartsTooltip content={<CustomTooltip />} />

                <Legend
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 12 }}
                />

                <Bar dataKey="positive" stackId="a" fill="#6D28D9" radius={[0, 0, 0, 0]} name="positive" />
                <Bar dataKey="neutral"  stackId="a" fill="#6B7280" name="neutral" />
                <Bar dataKey="negative" stackId="a" fill="#F87171" radius={[3, 3, 0, 0]} name="negative" />
            </BarChart>
        </ResponsiveContainer>
    )
}
