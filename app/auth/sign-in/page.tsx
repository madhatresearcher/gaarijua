"use client"

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase-client'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim().length > 0 && email.includes('@'), [email])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setStatus('sending')
    setFeedback(null)

    const redirectTo = typeof window === 'undefined' ? '/' : window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      setStatus('error')
      setFeedback(error.message)
      return
    }

    setStatus('sent')
    setFeedback(`Magic link sent to ${email}. Check spam if you don't see it within a few minutes.`)
    setEmail('')
  }

  const statusCopy = useMemo(() => {
    switch (status) {
      case 'sending':
        return 'Sending magic link…'
      case 'sent':
        return feedback
      case 'error':
        return feedback
      default:
        return null
    }
  }, [feedback, status])

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Gaarijua auth</p>
          <h1 className="text-3xl font-black text-slate-900">Sign in with your magic link</h1>
          <p className="text-sm text-slate-500">
            We send one-time links to the email you used for onboarding. No password is required.
            After signing in the headers will show your name and you can return here any time to re-request a link.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="magic-email">
            Email address
          </label>
          <input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!canSubmit || status === 'sending'}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-[0.3em] text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {statusCopy && (
              <p className={`text-sm ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {statusCopy}
              </p>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
          Need help? <Link href="/" className="font-semibold text-slate-900 underline">Return home</Link>
        </p>
      </div>
    </section>
  )
}
