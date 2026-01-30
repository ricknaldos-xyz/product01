import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      subscription: string
      accountType: string
      hasPlayerProfile: boolean
      hasCoachProfile: boolean
      isProvider: boolean
      providerTypes: string[]
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    subscription: string
    accountType: string
    hasPlayerProfile: boolean
    hasCoachProfile: boolean
    isProvider: boolean
    providerTypes: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    subscription: string
    accountType: string
    hasPlayerProfile: boolean
    hasCoachProfile: boolean
    isProvider: boolean
    providerTypes: string[]
    lastRefresh: number
  }
}
