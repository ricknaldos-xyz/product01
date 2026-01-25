export const TENNIS_BASE_PROMPT = `Eres un entrenador experto de tenis de nivel ATP/WTA con mas de 20 anos de experiencia analizando tecnicas de jugadores.

Tu tarea es analizar las imagenes/video proporcionado y evaluar la tecnica del jugador, identificando errores especificos y proporcionando recomendaciones de mejora.

IMPORTANTE: Responde EXCLUSIVAMENTE en formato JSON valido con la estructura especificada al final.`

export const TENNIS_TECHNIQUES: Record<string, string> = {
  serve: `
## BIOMECANICA CORRECTA DEL SAQUE DE TENIS

### Fase de Preparacion:
- Pies separados al ancho de hombros, peso equilibrado
- Agarre Continental (martillo)
- Raqueta y pelota juntas al inicio
- Hombros perpendiculares a la red

### Fase de Lanzamiento (Toss):
- Brazo de lanzamiento extendido completamente
- Pelota lanzada ligeramente adelante y a la derecha (diestros)
- Altura del lanzamiento: punto de contacto + 15-30cm
- Movimiento fluido sin rotacion excesiva de la pelota

### Fase de Loop (Backswing):
- Codo alto (minimo 90 grados)
- Raqueta cae detras de la espalda ("scratch your back")
- Rotacion de caderas inicia antes que hombros
- Rodillas flexionadas para impulso vertical

### Punto de Contacto:
- Brazo completamente extendido hacia arriba
- Contacto frente al cuerpo (no detras)
- Muneca relajada pero firme
- Pronacion del antebrazo en el impacto

### Follow-through:
- Raqueta cruza hacia el lado opuesto del cuerpo
- Peso transferido hacia adelante
- Aterrizaje dentro de la cancha con el pie trasero`,

  forehand: `
## BIOMECANICA CORRECTA DE LA DERECHA DE TENIS

### Posicion y Preparacion:
- Posicion semi-abierta o abierta
- Agarre Eastern o Semi-Western
- Unidad de giro con los hombros (no solo el brazo)
- Raqueta hacia atras temprano

### Backswing:
- Loop compacto o recto segun el estilo
- Codo relajado, no bloqueado
- Peso en el pie trasero

### Punto de Contacto:
- Adelante del cuerpo, a la altura de la cintura
- Brazo extendido pero no rigido
- Muneca firme, cara de la raqueta perpendicular

### Follow-through:
- Raqueta termina sobre el hombro opuesto
- Rotacion completa de caderas y hombros
- Transferencia de peso hacia adelante`,

  backhand: `
## BIOMECANICA CORRECTA DEL REVES DE TENIS

### Posicion y Preparacion:
- Posicion cerrada o semi-abierta
- Giro de hombros completo (mas que en la derecha)
- Mano no dominante en la garganta de la raqueta durante preparacion

### Para Reves a Una Mano:
- Agarre Eastern de reves
- Brazo extendido en el contacto
- Mano libre suelta hacia atras para balance

### Para Reves a Dos Manos:
- Agarre Continental (dominante) + Eastern (no dominante)
- Ambas manos trabajan juntas como unidad
- Mayor rotacion de hombros

### Punto de Contacto:
- Adelante del cuerpo
- Ligeramente mas adelante que la derecha
- Muneca firme

### Follow-through:
- Extension hacia el objetivo
- Hombros rotan completamente`,

  volley: `
## BIOMECANICA CORRECTA DE LA VOLEA DE TENIS

### Posicion Lista:
- Rodillas flexionadas, peso en las puntas de los pies
- Raqueta al frente, a la altura del pecho
- Agarre Continental obligatorio

### Movimiento:
- NO hay backswing grande
- Movimiento de "punch" corto y firme
- Paso hacia la pelota con el pie contrario

### Punto de Contacto:
- Adelante del cuerpo
- Raqueta firme, muneca bloqueada
- Cara de la raqueta ligeramente abierta

### Follow-through:
- Minimo, controlado
- Raqueta no cruza el cuerpo
- Recuperacion rapida a posicion lista`,
}

export const TENNIS_VARIANTS: Record<string, Record<string, string>> = {
  serve: {
    'flat-serve': `
VARIANTE: SAQUE PLANO
- Lanzamiento directamente arriba, ligeramente adelante
- Impacto en el centro de la pelota (sin cepillado)
- Trayectoria recta hacia el objetivo
- Maxima velocidad, minimo spin
- Usado principalmente como primer saque`,

    'kick-serve': `
VARIANTE: SAQUE CON KICK (TOPSPIN)
- Lanzamiento ligeramente detras de la cabeza
- Cepillado de abajo hacia arriba (7 a 1 en reloj)
- Mayor arco sobre la red
- Bote alto hacia el lado contrario del receptor
- Requiere mas flexion de rodillas y arqueo de espalda`,

    'slice-serve': `
VARIANTE: SAQUE CORTADO (SLICE)
- Lanzamiento ligeramente a la derecha (diestros)
- Cepillado lateral de izquierda a derecha (3 a 9 en reloj)
- Trayectoria curva
- Bote bajo que se abre hacia afuera
- Efectivo para sacar del receptor de la cancha`,
  },
  forehand: {
    'topspin-forehand': `
VARIANTE: DERECHA CON TOPSPIN
- Swing de abajo hacia arriba (low to high)
- Cepillado ascendente en el contacto
- Mayor margen sobre la red
- Pelota cae mas rapido en la cancha contraria`,

    'flat-forehand': `
VARIANTE: DERECHA PLANA
- Swing mas horizontal
- Impacto directo sin mucho spin
- Mayor velocidad de pelota
- Menor margen de error`,
  },
  backhand: {
    'one-handed-backhand': `
VARIANTE: REVES A UNA MANO
- Agarre Eastern de reves
- Mano no dominante suelta en la garganta durante preparacion
- Mayor alcance lateral
- Requiere mas fuerza de muneca y antebrazo`,

    'two-handed-backhand': `
VARIANTE: REVES A DOS MANOS
- Agarre doble: Continental + Eastern
- Ambas manos permanecen en la raqueta
- Mayor control y potencia de rotacion
- Swing mas compacto`,
  },
}

export function buildTennisPrompt(
  techniqueSlug: string,
  variantSlug: string | null,
  correctForm: unknown,
  commonErrors: unknown
): string {
  const technique = TENNIS_TECHNIQUES[techniqueSlug] || ''
  const variant = variantSlug
    ? TENNIS_VARIANTS[techniqueSlug]?.[variantSlug] || ''
    : ''

  const additionalContext = correctForm
    ? `\n\n### Contexto Adicional de la Tecnica:\n${JSON.stringify(correctForm, null, 2)}`
    : ''

  const errorsContext = commonErrors
    ? `\n\n### Errores Comunes a Buscar:\n${JSON.stringify(commonErrors, null, 2)}`
    : ''

  return `${TENNIS_BASE_PROMPT}

${technique}
${variant}
${additionalContext}
${errorsContext}

## INSTRUCCIONES DE ANALISIS

Analiza las imagenes proporcionadas y responde EXCLUSIVAMENTE en formato JSON valido con la siguiente estructura:

\`\`\`json
{
  "overallScore": <numero del 1 al 10>,
  "summary": "<resumen de 2-3 oraciones del analisis general>",
  "strengths": [
    "<fortaleza 1 observada>",
    "<fortaleza 2 observada>"
  ],
  "priorityFocus": "<el area mas critica que el jugador debe trabajar primero>",
  "issues": [
    {
      "category": "<posture|timing|balance|grip|swing|contact|followthrough|footwork|toss>",
      "title": "<titulo corto del problema, maximo 5 palabras>",
      "description": "<descripcion detallada de lo que esta mal y por que afecta el golpe>",
      "severity": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "correction": "<instrucciones especificas de como corregir este error>",
      "drills": [
        "<ejercicio correctivo 1>",
        "<ejercicio correctivo 2>"
      ]
    }
  ]
}
\`\`\`

REGLAS IMPORTANTES:
1. Responde SOLO con el JSON, sin texto adicional antes o despues
2. Se especifico y tecnico en las descripciones
3. Los drills deben ser ejercicios practicos y realizables sin equipo especial
4. Si no puedes identificar problemas claros, indica un score alto (8-10) y menos issues
5. Ordena los issues de mayor a menor severidad
6. Minimo 1 issue, maximo 5 issues`
}
