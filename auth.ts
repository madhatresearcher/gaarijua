import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from './lib/db'
import { users, accounts, sessions, verificationTokens } from './lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const db = getDb()
  return {
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    session: { strategy: 'database' },
    trustHost: true,
    pages: {
      signIn: '/auth/sign-in',
      verifyRequest: '/auth/sign-in?sent=1',
    },
    providers: [
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.EMAIL_FROM,
      }),
    ],
    callbacks: {
      // Database sessions: surface the user id (and a friendly name) to the client.
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id
          const display = (user as { displayName?: string | null }).displayName
          if (display) session.user.name = display
        }
        return session
      },
    },
  }
})
