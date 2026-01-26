import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch((error) => {
      console.error('Failed to send welcome email:', error)
    })

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
