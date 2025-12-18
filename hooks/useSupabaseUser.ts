"use client"

import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase-client'

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    async function fetchSession() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setUser(data.session?.user ?? null)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!active) return
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return user
}
