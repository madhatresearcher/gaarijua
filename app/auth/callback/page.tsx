"use client"

import { Suspense, useEffect, useMemo, useState } from 'react'
import type { EmailOtpType } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase-client'

const SUPPORTED_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
])

type CallbackState = 'working' | 'error'

function AuthCallbackShell({ state, message }: { state: CallbackState; message: string }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Gaarijua auth</p>
          <h1 className="text-3xl font-black text-slate-900">
            {state === 'working' ? 'Signing you in' : 'Sign-in needs attention'}
          </h1>
          <p className={`text-sm ${state === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
            {message}
          </p>
        </div>
      </div>
    </section>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<CallbackState>('working')
  const [message, setMessage] = useState('Finishing your sign-in...')

  const nextPath = useMemo(() => {
    const next = searchParams.get('next')
    return next && next.startsWith('/') ? next : '/host'
  }, [searchParams])

  useEffect(() => {
    let active = true

    async function finishSignIn() {
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            throw error
          }
        } else if (tokenHash && type && SUPPORTED_EMAIL_OTP_TYPES.has(type as EmailOtpType)) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash: tokenHash,
          })
          if (error) {
            throw error
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          throw new Error('We could not finish your sign-in. Request a new magic link and try again.')
        }

        if (!active) return
        router.replace(nextPath)
        router.refresh()
      } catch (error) {
        if (!active) return
        setState('error')
        setMessage((error as Error).message || 'We could not finish your sign-in.')
      }
    }

    void finishSignIn()

    return () => {
      active = false
    }
  }, [nextPath, router, searchParams])

  return <AuthCallbackShell state={state} message={message} />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackShell state="working" message="Finishing your sign-in..." />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
