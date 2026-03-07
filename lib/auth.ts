import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isRegister: { label: 'Register', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })

        // Registration flow
        if (credentials.isRegister === 'true') {
          if (user) return null // email taken
          const hash = await bcrypt.hash(credentials.password, 12)
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              passwordHash: hash,
            }
          })
          return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
        }

        // Login flow
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = (user as any).role
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        (session.user as any).id = token.sub as string
        ;(session.user as any).role = token.role as string
      }
      return session
    }
  },
  pages: { signIn: '/auth/signin' }
}
