/**
 * NotFound — 404 fallback page.
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-6 text-center px-4">
            <p className="font-mono-label text-xs text-muted-foreground tracking-widest uppercase">
                404
            </p>
            <h1 className="font-heading text-4xl font-bold">Page not found.</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Button asChild className="rounded-full">
                <Link to="/dashboard">← Back to Dashboard</Link>
            </Button>
        </div>
    )
}
