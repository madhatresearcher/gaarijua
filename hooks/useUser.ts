"use client"

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

  const user: AppUser | null = sessionUser?.id
    ? { id: sessionUser.id, email: sessionUser.email ?? null, name: sessionUser.name ?? null }
    : null

  const profile = sessionUser?.name ? { display_name: sessionUser.name } : null

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/auth/sign-in' })
  }

  return { user, profile, loading: status === 'loading', signOut }
}
