import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { recalculateSkillScore } from '@/lib/skill-score'

// POST - Force recalculate skill score
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await recalculateSkillScore(session.user.id)

    return NextResponse.json({ message: 'Score recalculado exitosamente' })
  } catch (error) {
    logger.error('Recalculate skill score error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
