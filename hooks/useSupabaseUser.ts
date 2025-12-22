"use client"

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase-client'

type SupabaseUserState = {
  user: User | null
  profile: { display_name?: string } | null
  signOut: () => Promise<void>
}

export function useSupabaseUser(): SupabaseUserState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ display_name?: string } | null>(null)
  const router = useRouter()

  async function loadProfile(userId: string | null) {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
    setProfile(data?.display_name ? { display_name: data.display_name } : null)
  }

  useEffect(() => {
    let active = true

    async function fetchSession() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const nextUser = data.session?.user ?? null
      setUser(nextUser)
      await loadProfile(nextUser?.id ?? null)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!active) return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      void loadProfile(nextUser?.id ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  return { user, profile, signOut }
}
