import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getActiveDistricts, PROXIMAMENTE_CITIES } from '@/lib/coverage'

// GET - Return coverage information
export async function GET() {
  try {
    return NextResponse.json({
      districts: getActiveDistricts(),
      proximamente: PROXIMAMENTE_CITIES,
    })
  } catch (error) {
    logger.error('Coverage error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
