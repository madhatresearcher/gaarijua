"use client"

import { useCallback, useMemo } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

export type AppUser = {
  id: string
  email: string | null
  name: string | null
}

type UseUserState = {
  user: AppUser | null
  profile: { display_name?: string } | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useUser(): UseUserState {
  const { data: session, status } = useSession()
  const sessionUser = session?.user

  const userId = sessionUser?.id ?? null
  const userEmail = sessionUser?.email ?? null
  const userName = sessionUser?.name ?? null

  const user: AppUser | null = useMemo(
    () => (userId ? { id: userId, email: userEmail, name: userName } : null),
    [userId, userEmail, userName]
  )

  const profile = useMemo(
    () => (userName ? { display_name: userName } : null),
    [userName]
  )

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ callbackUrl: '/auth/sign-in' })
  }, [])

  return { user, profile, loading: status === 'loading', signOut }
}
