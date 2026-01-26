import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL))
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.redirect(new URL('/pricing', process.env.NEXT_PUBLIC_APP_URL))
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/settings`,
    })

    return NextResponse.redirect(portalSession.url)
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.redirect(
      new URL('/profile/settings?error=portal', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
