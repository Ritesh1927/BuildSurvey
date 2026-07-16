import type { UserRole } from '@/generated/prisma/enums'

declare module 'next-auth' {
  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
  }
}
