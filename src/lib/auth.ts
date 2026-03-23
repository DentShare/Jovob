import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare, hash } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        if (credentials.action === 'register') {
          const exists = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (exists) throw new Error('User already exists')
          const hashedPassword = await hash(credentials.password, 12)
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              hashedPassword,
            },
          })
          return { id: user.id, email: user.email, name: user.name }
        }

        // Login
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user?.hashedPassword) return null
        const valid = await compare(credentials.password, user.hashedPassword)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string
      return session
    },
  },
}
