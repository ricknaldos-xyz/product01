import type { PromptBuilder } from './base'
import { JSON_OUTPUT_SCHEMA } from './base'
import { buildTennisPrompt } from './tennis'
import { buildPadelPrompt } from './padel'

const BUILDERS: Record<string, PromptBuilder> = {
  tennis: buildTennisPrompt,
  padel: buildPadelPrompt,
}

function buildGenericPrompt(
  techniqueSlug: string,
  variantSlug: string | null,
  correctForm: unknown,
  commonErrors: unknown,
  ragContext?: string
): string {
  const additionalContext = correctForm
    ? `\n\n### Contexto Adicional de la Tecnica:\n${JSON.stringify(correctForm, null, 2)}`
    : ''

  const errorsContext = commonErrors
    ? `\n\n### Errores Comunes a Buscar:\n${JSON.stringify(commonErrors, null, 2)}`
    : ''

  return `Eres un entrenador deportivo experto con mas de 20 anos de experiencia analizando tecnicas.

Tu tarea es analizar las imagenes/video proporcionado y evaluar la tecnica del jugador.

IMPORTANTE: Responde EXCLUSIVAMENTE en formato JSON valido con la estructura especificada al final.

Tecnica a evaluar: ${techniqueSlug}${variantSlug ? ` (variante: ${variantSlug})` : ''}
${additionalContext}
${errorsContext}
${ragContext || ''}
${JSON_OUTPUT_SCHEMA}`
}

export function getSportPromptBuilder(sportSlug: string): PromptBuilder {
  return BUILDERS[sportSlug] || buildGenericPrompt
}
