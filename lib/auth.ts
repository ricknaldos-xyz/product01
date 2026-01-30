import { logger } from '@/lib/logger'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authLimiter } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) {
          return null
        }

        const { password } = validated.data
        const email = validated.data.email.toLowerCase()

        const { success } = await authLimiter.check(email)
        if (!success) {
          logger.warn('Rate limited login attempt for:', email)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            playerProfile: { select: { id: true } },
            coachProfile: { select: { id: true } },
          },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          subscription: user.subscription,
          accountType: user.accountType,
          hasPlayerProfile: !!user.playerProfile,
          hasCoachProfile: !!user.coachProfile,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: set all fields
        token.id = user.id as string
        token.role = user.role
        token.subscription = user.subscription
        token.accountType = user.accountType
        token.hasPlayerProfile = user.hasPlayerProfile
        token.hasCoachProfile = user.hasCoachProfile
        token.lastRefresh = Date.now()
      } else if (!token.lastRefresh || Date.now() - token.lastRefresh > 5 * 60 * 1000) {
        // Re-fetch every 5 minutes to pick up role/subscription changes
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              subscription: true,
              accountType: true,
              playerProfile: { select: { id: true } },
              coachProfile: { select: { id: true } },
            },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.subscription = dbUser.subscription
            token.accountType = dbUser.accountType
            token.hasPlayerProfile = !!dbUser.playerProfile
            token.hasCoachProfile = !!dbUser.coachProfile
            token.lastRefresh = Date.now()
          }
        } catch {
          // If DB is down, keep existing token values
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscription = token.subscription as string
        session.user.accountType = token.accountType as string
        session.user.hasPlayerProfile = token.hasPlayerProfile as boolean
        session.user.hasCoachProfile = token.hasCoachProfile as boolean
      }
      return session
    },
  },
})
