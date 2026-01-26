import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contrasena actual requerida'),
  newPassword: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = changePasswordSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validated.data

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contrasena actual incorrecta' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Error al cambiar contrasena' },
      { status: 500 }
    )
  }
}
