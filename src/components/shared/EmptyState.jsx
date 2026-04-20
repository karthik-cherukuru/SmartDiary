/**
 * EmptyState — friendly placeholder shown when no data exists.
 *
 * Used in:
 *  - Analytics charts (no entries yet)
 *  - Recent entries list (no entries written)
 *
 * Renders an inline SVG illustration + heading + description.
 */

export default function EmptyState({
    title       = 'Nothing here yet',
    description = 'Start writing to see something here.',
    icon,
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            {/* Illustration — book with a quill */}
            {icon ?? (
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    {/* Book cover */}
                    <rect
                        x="12"
                        y="16"
                        width="44"
                        height="52"
                        rx="4"
                        fill="currentColor"
                        fillOpacity="0.08"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                    />
                    {/* Spine */}
                    <rect
                        x="12"
                        y="16"
                        width="8"
                        height="52"
                        rx="2"
                        fill="currentColor"
                        fillOpacity="0.14"
                    />
                    {/* Lines on page */}
                    <line x1="28" y1="34" x2="48" y2="34" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="28" y1="42" x2="48" y2="42" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="28" y1="50" x2="40" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Quill feather */}
                    <path
                        d="M54 22 C62 14, 68 18, 64 28 C60 36, 54 38, 50 44 L48 44 C50 36, 56 30, 54 22Z"
                        fill="currentColor"
                        fillOpacity="0.4"
                    />
                    <line x1="49" y1="44" x2="44" y2="58" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                </svg>
            )}

            <div className="space-y-1">
                <p className="font-heading text-base font-semibold text-foreground">
                    {title}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                    {description}
                </p>
            </div>
        </div>
    )
}
