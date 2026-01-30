import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendWelcomeEmail, sendEmailVerification } from '@/lib/email'
import { generateToken } from '@/lib/tokens'
import { registerLimiter } from '@/lib/rate-limit'
import { normalizeEmail, validatePassword } from '@/lib/validation'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  accountType: z.enum(['PLAYER', 'COACH']).optional().default('PLAYER'),
})

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await registerLimiter.check(identifier)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, password, accountType } = validated.data
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }
    const email = normalizeEmail(validated.data.email)

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

    // Create user with profile based on account type
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountType,
        playerProfile: accountType === 'PLAYER' ? {
          create: {
            displayName: name,
            country: 'PE',
          },
        } : undefined,
        coachProfile: accountType === 'COACH' ? {
          create: {
            country: 'PE',
          },
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        createdAt: true,
      },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch((e) => {
      logger.error('Failed to send welcome email:', e)
    })

    // Send verification email (non-blocking)
    generateToken(user.id, 'EMAIL_VERIFICATION')
      .then((token) => sendEmailVerification(email, name, token))
      .catch((e) => {
        logger.error('Failed to send verification email:', e)
      })

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
