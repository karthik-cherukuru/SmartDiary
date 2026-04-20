/**
 * Contact — minimal form; rows stored in `tickets` for manual review.
 */
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, SendHorizonal } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { useAuth } from '@/context/AuthContext'
import { submitTicket } from '@/services/ticketService'

export default function Contact() {
    const { user } = useAuth()

    const [name,    setName]    = useState('')
    const [email,   setEmail]   = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (user?.email) {
            setEmail(prev => prev || user.email)
        }
    }, [user?.email])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user?.id) {
            toast.error('Sign in to send a message.')
            return
        }

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error('Please fill in every field.')
            return
        }

        setSending(true)
        try {
            await submitTicket(user.id, { name, email, message })
            toast.success('Thanks — your message was sent.')
            setName('')
            setEmail('')
            setMessage('')
        } catch (err) {
            console.error('[Contact]', err.message)
            toast.error(err.message || 'Could not send. Try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-lg px-4 sm:px-6 py-12 sm:py-16">
                <div className="flex flex-col items-center text-center gap-4 mb-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card flat-card">
                        <Mail className="h-7 w-7 text-primary" aria-hidden />
                    </div>
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">Contact us</h1>
                    <p className="text-muted-foreground text-lg">
                        We&apos;d love to hear from you.
                    </p>
                </div>

                <Card className="rounded-2xl border border-border flat-card">
                    <CardHeader>
                        <CardTitle className="font-heading text-lg">Send a note</CardTitle>
                        <CardDescription className="text-base">
                            This goes to our team as a ticket. We read every message.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name" className="text-sm font-medium">Name</Label>
                                <Input
                                    id="contact-name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your name"
                                    autoComplete="name"
                                    disabled={sending}
                                    className="h-12 text-base rounded-xl border-border bg-muted/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={sending}
                                    className="h-12 text-base rounded-xl border-border bg-muted/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-message" className="text-sm font-medium">Message</Label>
                                <Textarea
                                    id="contact-message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="What's on your mind?"
                                    disabled={sending}
                                    rows={5}
                                    className="text-base rounded-xl border-border bg-muted/40 min-h-[140px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={sending}
                                className="w-full h-12 rounded-full text-base gap-2"
                            >
                                <SendHorizonal className="h-5 w-5" />
                                {sending ? 'Sending…' : 'Send message'}
                            </Button>
                        </form>

                        <p className="text-sm text-center text-muted-foreground mt-8">
                            Or email us directly at{' '}
                            <a
                                href="mailto:hello@smartdiary.app"
                                className="text-primary underline-offset-4 hover:underline font-medium"
                            >
                                hello@smartdiary.app
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
