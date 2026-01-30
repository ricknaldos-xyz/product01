import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await forgotPasswordLimiter.check(identifier)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe, recibiras instrucciones para restablecer tu contrasena',
      })
    }

    // Generate password reset token
    const token = await generateToken(user.id, 'PASSWORD_RESET')

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.name || 'Usuario', token)
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError)
      // Don't expose email errors to prevent enumeration
    }

    return NextResponse.json({
      message: 'Si el email existe, recibiras instrucciones para restablecer tu contrasena',
    })
  } catch (error) {
    logger.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
