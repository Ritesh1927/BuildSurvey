import type { UserRole } from '@/generated/prisma/enums'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: UserRole
    clientId?: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      clientId?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    clientId?: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
    clientId?: string | null
  }
}
