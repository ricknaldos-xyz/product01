import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { verifyToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyToken(token, 'EMAIL_VERIFICATION')

    if (!result.valid || !result.userId) {
      return NextResponse.json(
        { error: result.error || 'Token invalido' },
        { status: 400 }
      )
    }

    // Atomically mark token as used + update user to prevent TOCTOU
    await prisma.$transaction(async (tx) => {
      // Mark token as used first -- a concurrent request will fail here
      const updated = await tx.verificationToken.updateMany({
        where: { token, usedAt: null },
        data: { usedAt: new Date() },
      })
      if (updated.count === 0) {
        throw new Error('TOKEN_ALREADY_USED')
      }

      // Update user emailVerified
      await tx.user.update({
        where: { id: result.userId },
        data: { emailVerified: new Date() },
      })
    })

    return NextResponse.json({
      message: 'Email verificado exitosamente',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_ALREADY_USED') {
      return NextResponse.json(
        { error: 'Este enlace ya ha sido utilizado' },
        { status: 400 }
      )
    }
    logger.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    )
  }
}
