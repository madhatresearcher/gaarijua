import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    displayName?: string | null
    role?: string | null
    vendorType?: string | null
  }
}
