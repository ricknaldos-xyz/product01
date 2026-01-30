import { logger } from '@/lib/logger'
import { getGeminiClient } from '@/lib/gemini/client'
import { retrieveRelevantChunks } from '@/lib/rag/retriever'
import { buildRagContext } from '@/lib/rag/context-builder'

type GoalType = 'TECHNIQUE' | 'SCORE_TARGET' | 'TIER_TARGET'

export interface RoadmapStep {
  order: number
  title: string
  description: string
  type: 'analysis' | 'training'
  completed: boolean
  linkedId: string | null
}

export interface RoadmapData {
  steps: RoadmapStep[]
}

interface GoalInput {
  type: GoalType
  title: string
  description?: string | null
  targetScore?: number | null
  targetTier?: string | null
  baselineScore?: number | null
}

interface TechniqueInput {
  name: string
  slug: string
  sport: { name: string; slug: string }
}

const TIER_LABELS: Record<string, string> = {
  BRONCE: 'Bronce',
  PLATA: 'Plata',
  ORO: 'Oro',
  PLATINO: 'Platino',
  DIAMANTE: 'Diamante',
}

function buildGoalDescription(goal: GoalInput): string {
  switch (goal.type) {
    case 'TECHNIQUE':
      return `Mejorar técnica: ${goal.title}${goal.description ? `. ${goal.description}` : ''}`
    case 'SCORE_TARGET':
      return `Alcanzar puntuación de ${goal.targetScore ?? '?'}${goal.baselineScore != null ? ` (actual: ${goal.baselineScore})` : ''}. ${goal.title}`
    case 'TIER_TARGET':
      return `Alcanzar nivel ${TIER_LABELS[goal.targetTier ?? ''] ?? goal.targetTier ?? '?'}${goal.baselineScore != null ? ` (puntuación actual: ${goal.baselineScore})` : ''}. ${goal.title}`
    default:
      return goal.title
  }
}

function buildPrompt(goal: GoalInput, techniques: TechniqueInput[], ragContext: string): string {
  const goalDesc = buildGoalDescription(goal)
  const techniqueList = techniques.map((t) => `- ${t.name} (${t.sport.name})`).join('\n')

  return `Eres un coach deportivo experto. Genera un roadmap personalizado de pasos para que un deportista logre su objetivo.

## Objetivo del deportista
${goalDesc}

## Técnicas involucradas
${techniqueList}

## Tipo de objetivo
${goal.type === 'TECHNIQUE' ? 'Mejora de técnica específica' : goal.type === 'SCORE_TARGET' ? 'Alcanzar una puntuación objetivo' : 'Alcanzar un nivel/tier objetivo'}
${goal.baselineScore != null ? `Puntuación base actual: ${goal.baselineScore}` : ''}
${goal.targetScore != null ? `Puntuación objetivo: ${goal.targetScore}` : ''}
${goal.targetTier ? `Nivel objetivo: ${TIER_LABELS[goal.targetTier] ?? goal.targetTier}` : ''}
${ragContext}

## Instrucciones
Genera entre 3 y 5 pasos concretos para alcanzar este objetivo. Las reglas son:
1. El PRIMER paso SIEMPRE debe ser de tipo "analysis" (grabar y analizar una línea base)
2. Los pasos deben alternar entre "analysis" (grabación y análisis de video) y "training" (plan de entrenamiento correctivo)
3. El ÚLTIMO paso debe ser de tipo "analysis" (validación final)
4. Cada paso debe tener un título claro y una descripción detallada de qué debe hacer el deportista
5. Personaliza los pasos según el tipo de objetivo, las técnicas y los datos del deportista

Responde SOLO con JSON válido en este formato exacto:
{
  "steps": [
    { "order": 1, "title": "...", "description": "...", "type": "analysis", "completed": false, "linkedId": null },
    { "order": 2, "title": "...", "description": "...", "type": "training", "completed": false, "linkedId": null }
  ]
}`
}

function getDefaultRoadmap(goal: GoalInput): RoadmapData {
  const goalDesc = buildGoalDescription(goal)
  return {
    steps: [
      {
        order: 1,
        title: 'Diagnóstico inicial',
        description: `Graba un video realizando la técnica para establecer tu línea base. ${goalDesc}`,
        type: 'analysis',
        completed: false,
        linkedId: null,
      },
      {
        order: 2,
        title: 'Plan de corrección',
        description: 'Genera un plan de entrenamiento basado en los problemas detectados en tu análisis inicial.',
        type: 'training',
        completed: false,
        linkedId: null,
      },
      {
        order: 3,
        title: 'Evaluación de progreso',
        description: 'Graba un nuevo video para medir tu progreso después de completar el plan de entrenamiento.',
        type: 'analysis',
        completed: false,
        linkedId: null,
      },
      {
        order: 4,
        title: 'Consolidación',
        description: 'Genera un plan de entrenamiento avanzado enfocado en los aspectos que aún necesitan mejora.',
        type: 'training',
        completed: false,
        linkedId: null,
      },
      {
        order: 5,
        title: 'Validación final',
        description: 'Graba un video final para confirmar que has alcanzado tu objetivo y medir el progreso total.',
        type: 'analysis',
        completed: false,
        linkedId: null,
      },
    ],
  }
}

function validateRoadmap(data: RoadmapData): boolean {
  if (!data.steps || !Array.isArray(data.steps) || data.steps.length < 3 || data.steps.length > 5) {
    return false
  }

  // First step must be analysis
  if (data.steps[0].type !== 'analysis') return false

  // Last step must be analysis
  if (data.steps[data.steps.length - 1].type !== 'analysis') return false

  // All steps must have required fields
  for (const step of data.steps) {
    if (!step.title || !step.description || !step.type) return false
    if (step.type !== 'analysis' && step.type !== 'training') return false
  }

  return true
}

export async function generateGoalRoadmap(
  goal: GoalInput,
  techniques: TechniqueInput[]
): Promise<RoadmapData> {
  try {
    // Gather RAG context from technique-related documents
    let ragContext = ''
    if (techniques.length > 0) {
      const technique = techniques[0]
      const query = `${goal.title} ${techniques.map((t) => t.name).join(' ')} mejora entrenamiento progresión`

      try {
        const ragChunks = await retrieveRelevantChunks(query, {
          sportSlug: technique.sport.slug,
          category: ['EXERCISE', 'TRAINING_PLAN'],
          technique: technique.slug,
          limit: 3,
          threshold: 0.35,
        })
        ragContext = buildRagContext(ragChunks)
      } catch {
        // RAG retrieval failed, continue without context
      }
    }

    // Generate roadmap with Gemini
    const prompt = buildPrompt(goal, techniques, ragContext)
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    // Parse JSON, handle markdown code blocks
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(jsonContent) as RoadmapData

    // Normalize steps
    const roadmap: RoadmapData = {
      steps: parsed.steps.map((step, i) => ({
        order: i + 1,
        title: step.title || `Paso ${i + 1}`,
        description: step.description || '',
        type: step.type === 'training' ? 'training' : 'analysis',
        completed: false,
        linkedId: null,
      })),
    }

    if (!validateRoadmap(roadmap)) {
      logger.warn('Gemini returned invalid roadmap structure, using default')
      return getDefaultRoadmap(goal)
    }

    return roadmap
  } catch (error) {
    logger.error('Failed to generate goal roadmap:', error)
    return getDefaultRoadmap(goal)
  }
}
