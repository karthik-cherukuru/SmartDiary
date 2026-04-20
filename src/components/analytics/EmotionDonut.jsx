/**
 * EmotionDonut — Recharts PieChart showing how often each emotion appears.
 *
 * Each segment is colored with the emotion's accent color.
 * A custom legend below the chart shows label + count.
 */
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts'

import { EMOTION_COLOR, EMOTION_LABELS } from '@/data/themes'
import EmptyState from '@/components/shared/EmptyState'

/**
 * Count occurrences of each emotion label from entries.
 *
 * @param {object[]} entries
 * @returns {object[]}  [{ name, value, color }]
 */
function buildFrequencyData(entries) {
    const counts = {}
    for (const label of EMOTION_LABELS) counts[label] = 0
    for (const entry of entries) {
        const label = entry.emotion_label ?? 'neutral'
        counts[label] = (counts[label] ?? 0) + 1
    }

    return EMOTION_LABELS
        .map(label => ({
            name:  label,
            value: counts[label],
            color: EMOTION_COLOR[label],
        }))
        .filter(d => d.value > 0)
}

// Custom tooltip
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs flat-card">
            <p className="font-semibold capitalize" style={{ color: d.color }}>{d.name}</p>
            <p className="text-muted-foreground">{d.value} {d.value === 1 ? 'entry' : 'entries'}</p>
        </div>
    )
}

export default function EmotionDonut({ entries = [] }) {
    if (entries.length === 0) {
        return (
            <EmptyState
                title="No data yet"
                description="Emotion frequency will appear here after a few entries."
            />
        )
    }

    const data = buildFrequencyData(entries)

    return (
        <div className="flex flex-col items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} opacity={0.85} />
                        ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Custom legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {data.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: d.color }}
                        />
                        <span className="font-mono-label text-[10px] text-muted-foreground capitalize">
                            {d.name} ({d.value})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
