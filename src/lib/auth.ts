import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string, isDeleted: false },
          include: {
            roleRef: { include: { permissions: { include: { permission: true } } } },
            secondaryRoleRef: { include: { permissions: { include: { permission: true } } } },
          },
        })

        if (!user || !user.isActive) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Resolved permission set for the new dynamic RBAC system - union
        // of the primary and secondary Role's permissions.
        const permissionKeys = new Set<string>()
        for (const rp of user.roleRef?.permissions ?? []) permissionKeys.add(rp.permission.key)
        for (const rp of user.secondaryRoleRef?.permissions ?? []) permissionKeys.add(rp.permission.key)

        // Display name for the primary role - pulled from the Role record
        // rather than the legacy `role` enum, since a custom (non-system)
        // role's enum column holds a placeholder value that would show the
        // wrong label (see users/route.ts for why that placeholder exists).
        const roleName = user.roleRef?.name ?? user.role

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          secondaryRole: user.secondaryRole,
          roleName,
          clientId: user.clientId,
          image: user.avatar,
          permissions: Array.from(permissionKeys),
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.secondaryRole = user.secondaryRole
        token.roleName = user.roleName
        token.id = user.id
        token.clientId = user.clientId
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.secondaryRole = token.secondaryRole
        session.user.roleName = token.roleName
        session.user.id = token.id as string
        session.user.clientId = token.clientId
        session.user.permissions = token.permissions
      }
      return session
    },
  },
})
