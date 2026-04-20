/**
 * About — product story and disclaimer (flat light layout, icons only).
 */
import { BookMarked, Diamond, AlertTriangle } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'

const BELIEFS = [
    'Everyone deserves a private, non-judgmental space to process their feelings.',
    'Self-awareness is the first step toward emotional wellbeing.',
    'Consistency, not perfection, is what builds lasting habits.',
    'Technology should feel human — warm, empathetic, and adaptive.',
]

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
                <div className="flex flex-col items-center text-center gap-4 mb-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card flat-card">
                        <BookMarked className="h-9 w-9 text-primary" aria-hidden />
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">
                        About Smart Diary
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Write. Feel. Heal.
                    </p>
                </div>

                <div className="rounded-[1.75rem] border border-border bg-card flat-card p-8 sm:p-10 space-y-10">
                    <section className="space-y-4">
                        <h2 className="font-heading text-xl font-semibold">Our mission</h2>
                        <p className="text-base sm:text-lg leading-relaxed text-foreground">
                            Smart Diary uses emotional intelligence to turn journaling into a supportive ritual — not a chore.
                            We help you notice patterns, name what you feel, and move toward states that serve you, one entry at a time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-heading text-xl font-semibold">What we believe</h2>
                        <ul className="space-y-4">
                            {BELIEFS.map(line => (
                                <li key={line} className="flex gap-3 text-base leading-relaxed">
                                    <Diamond className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section
                        className="rounded-2xl border border-border bg-muted/50 px-5 py-5 sm:px-6 sm:py-6 space-y-3"
                    >
                        <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground">
                            <AlertTriangle className="h-5 w-5 text-primary shrink-0" aria-hidden />
                            Important disclaimer
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                            Smart Diary is a self-reflection tool. It does not provide medical advice, psychological diagnosis,
                            or therapy. If you are experiencing a mental health crisis or ongoing distress, please contact a
                            qualified professional or your local emergency services.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}
