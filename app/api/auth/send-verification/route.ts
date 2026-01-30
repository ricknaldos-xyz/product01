import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateToken } from '@/lib/tokens'
import { sendEmailVerification } from '@/lib/email'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'El email ya esta verificado' },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = await generateToken(user.id, 'EMAIL_VERIFICATION')

    // Send verification email
    try {
      await sendEmailVerification(user.email, user.name || 'Usuario', token)
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Error al enviar el email de verificacion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email de verificacion enviado',
    })
  } catch (error) {
    logger.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
