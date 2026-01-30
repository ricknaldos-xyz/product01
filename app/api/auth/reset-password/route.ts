import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { verifyToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contrasena son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyToken(token, 'PASSWORD_RESET')

    if (!result.valid || !result.userId) {
      return NextResponse.json(
        { error: result.error || 'Token invalido' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atomically mark token as used + update password to prevent TOCTOU
    await prisma.$transaction(async (tx) => {
      // Mark token as used first -- a concurrent request will fail here
      const updated = await tx.verificationToken.updateMany({
        where: { token, usedAt: null },
        data: { usedAt: new Date() },
      })
      if (updated.count === 0) {
        throw new Error('TOKEN_ALREADY_USED')
      }

      // Update user password
      await tx.user.update({
        where: { id: result.userId },
        data: { password: hashedPassword },
      })
    })

    return NextResponse.json({
      message: 'Contrasena actualizada exitosamente',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_ALREADY_USED') {
      return NextResponse.json(
        { error: 'Este enlace ya ha sido utilizado' },
        { status: 400 }
      )
    }
    logger.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Error al restablecer la contrasena' },
      { status: 500 }
    )
  }
}
