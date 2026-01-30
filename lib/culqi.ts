import Culqi from 'culqi-node'

export { PLANS, type PlanType } from '@/lib/plans'

let culqiClient: InstanceType<typeof Culqi> | null = null

export function getCulqiClient() {
  if (!culqiClient) {
    if (!process.env.CULQI_SECRET_KEY) {
      throw new Error('CULQI_SECRET_KEY is not configured')
    }
    culqiClient = new Culqi({
      privateKey: process.env.CULQI_SECRET_KEY,
    })
  }
  return culqiClient
}

export const CULQI_PLAN_IDS = {
  PRO: process.env.CULQI_PRO_PLAN_ID || null,
  ELITE: process.env.CULQI_ELITE_PLAN_ID || null,
} as const
