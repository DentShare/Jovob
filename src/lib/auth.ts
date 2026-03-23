import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare, hash } from 'bcryptjs'
import { formatPhoneUz } from './auth-utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null

        const login = credentials.login.trim()
        const isPhone = /^[\d\s+()-]+$/.test(login) && login.replace(/\D/g, '').length >= 9
        const isEmail = login.includes('@')

        if (credentials.action === 'register') {
          // Registration
          if (!credentials.name?.trim()) throw new Error('Name is required')

          if (isPhone) {
            const phone = formatPhoneUz(login)
            const exists = await prisma.user.findUnique({ where: { phone } })
            if (exists) throw new Error('Этот номер уже зарегистрирован')

            const hashedPassword = await hash(credentials.password, 12)
            const user = await prisma.user.create({
              data: {
                phone,
                name: credentials.name.trim(),
                hashedPassword,
                lastLoginAt: new Date(),
              },
            })
            return { id: user.id, name: user.name, email: user.phone }
          }

          if (isEmail) {
            const exists = await prisma.user.findUnique({ where: { email: login.toLowerCase() } })
            if (exists) throw new Error('Этот email уже зарегистрирован')

            const hashedPassword = await hash(credentials.password, 12)
            const user = await prisma.user.create({
              data: {
                email: login.toLowerCase(),
                name: credentials.name.trim(),
                hashedPassword,
                lastLoginAt: new Date(),
              },
            })
            return { id: user.id, name: user.name, email: user.email }
          }

          throw new Error('Введите телефон или email')
        }

        // Login
        let user = null
        if (isPhone) {
          const phone = formatPhoneUz(login)
          user = await prisma.user.findUnique({ where: { phone } })
        } else if (isEmail) {
          user = await prisma.user.findUnique({ where: { email: login.toLowerCase() } })
        }

        if (!user?.hashedPassword) return null
        const valid = await compare(credentials.password, user.hashedPassword)
        if (!valid) return null

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return { id: user.id, name: user.name, email: user.email || user.phone }
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
