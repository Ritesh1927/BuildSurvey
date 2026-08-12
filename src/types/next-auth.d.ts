import type { UserRole } from '@/generated/prisma/enums'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
    permissions?: string[]
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      secondaryRole?: UserRole | null
      clientId?: string | null
      permissions?: string[]
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
    permissions?: string[]
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
    secondaryRole?: UserRole | null
    clientId?: string | null
    permissions?: string[]
  }
}
