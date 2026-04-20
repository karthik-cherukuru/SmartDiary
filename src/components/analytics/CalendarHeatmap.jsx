/**
 * CalendarHeatmap — GitHub-style calendar grid colored by emotion.
 *
 * Shows the last 16 weeks (112 days) of entries.
 * Each square is colored with the emotion accent color for that day.
 * Empty days show a muted border square.
 *
 * Rendered as a custom SVG grid (no external heatmap library needed).
 */
import { useMemo } from 'react'
import { EMOTION_COLOR } from '@/data/themes'
import EmptyState from '@/components/shared/EmptyState'

const CELL_SIZE = 14
const CELL_GAP  = 3
const WEEKS     = 16
const DAYS      = 7

/**
 * Build a map of date string → emotion label from entries.
 */
function buildDateMap(entries) {
    const map = {}
    for (const entry of entries) {
        const date = new Date(entry.created_at).toDateString()
        // Last entry of the day wins (if multiple exist)
        map[date] = entry.emotion_label ?? 'neutral'
    }
    return map
}

/**
 * Get Sunday of the week containing `date`.
 */
function startOfWeek(date) {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Add `days` days to a date.
 */
function addDays(date, days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarHeatmap({ entries = [] }) {
    const dateMap = useMemo(() => buildDateMap(entries), [entries])

    // Build the grid: WEEKS columns × 7 rows, anchored to today
    const grid = useMemo(() => {
        const today      = new Date()
        today.setHours(0, 0, 0, 0)
        const lastSunday = startOfWeek(today)
        const firstDate  = addDays(lastSunday, -(WEEKS - 1) * 7)

        const weeks = []
        for (let w = 0; w < WEEKS; w++) {
            const week = []
            for (let d = 0; d < DAYS; d++) {
                const cellDate = addDays(firstDate, w * 7 + d)
                const key      = cellDate.toDateString()
                week.push({
                    date:    cellDate,
                    emotion: dateMap[key] ?? null,
                    label:   cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                })
            }
            weeks.push(week)
        }
        return weeks
    }, [dateMap])

    if (entries.length === 0) {
        return (
            <EmptyState
                title="No entries yet"
                description="Your activity calendar will fill in as you write."
            />
        )
    }

    const svgWidth  = WEEKS * (CELL_SIZE + CELL_GAP) + 20
    const svgHeight = DAYS  * (CELL_SIZE + CELL_GAP) + 24

    return (
        <div className="overflow-x-auto">
            <svg
                width={svgWidth}
                height={svgHeight}
                aria-label="Writing activity calendar"
            >
                {/* Day labels on left */}
                {DAY_LABELS.map((label, i) => (
                    <text
                        key={i}
                        x={0}
                        y={20 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4}
                        fontSize={9}
                        fill="#64748B"
                        fontFamily="monospace"
                    >
                        {i % 2 === 1 ? label : ''}
                    </text>
                ))}

                {/* Grid cells */}
                {grid.map((week, wi) =>
                    week.map((cell, di) => {
                        const x      = 16 + wi * (CELL_SIZE + CELL_GAP)
                        const y      = 20 + di * (CELL_SIZE + CELL_GAP)
                        const color  = cell.emotion ? EMOTION_COLOR[cell.emotion] : null
                        const isFuture = cell.date > new Date()

                        return (
                            <rect
                                key={`${wi}-${di}`}
                                x={x}
                                y={y}
                                width={CELL_SIZE}
                                height={CELL_SIZE}
                                rx={2}
                                fill={
                                    isFuture
                                        ? '#F3F4F6'
                                        : color
                                        ? `${color}CC`
                                        : '#E5E7EB'
                                }
                                stroke={
                                    color
                                        ? `${color}55`
                                        : '#D1D5DB'
                                }
                                strokeWidth={0.5}
                                opacity={isFuture ? 0.3 : 1}
                            >
                                <title>
                                    {cell.label}{cell.emotion ? ` — ${cell.emotion}` : ' — no entry'}
                                </title>
                            </rect>
                        )
                    })
                )}
            </svg>

            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(EMOTION_COLOR).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: `${color}CC`, border: `1px solid ${color}55` }}
                        />
                        <span className="font-mono-label text-[10px] text-muted-foreground capitalize">
                            {label}
                        </span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-muted border border-border" />
                    <span className="font-mono-label text-[10px] text-muted-foreground">no entry</span>
                </div>
            </div>
        </div>
    )
}
