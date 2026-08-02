import type { UserRole } from '@/generated/prisma/enums'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      secondaryRole?: UserRole | null
      clientId?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
  }
}
