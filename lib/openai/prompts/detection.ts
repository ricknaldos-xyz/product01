export function buildDetectionPrompt(
  sportSlug: string,
  techniques: Array<{
    slug: string
    name: string
    description: string | null
    variants: Array<{ slug: string; name: string }>
  }>
): string {
  const sportName = sportSlug === 'tennis' ? 'tenis' : sportSlug

  // For tennis, add visual cues to help distinguish techniques
  const tennisVisualCues: Record<string, string> = {
    serve: 'SAQUE: Jugador lanza la pelota al aire con una mano, golpea desde arriba de la cabeza. Posicion inicial estatica, sin pelota entrante.',
    forehand: 'DERECHA: Raqueta del MISMO LADO que la mano dominante. Para diestro: raqueta lado DERECHO, pecho hacia la red.',
    backhand: 'REVES: Raqueta del LADO OPUESTO a la mano dominante. Para diestro: raqueta lado IZQUIERDO, espalda/hombro hacia la red. UNA MANO: brazo extendido solo. DOS MANOS: ambas manos en raqueta.',
    volley: 'VOLEA: Golpe en la RED, SIN que la pelota bote. Movimiento corto tipo "punch". Jugador cerca de la red.',
    return: 'DEVOLUCION: Respuesta al saque del oponente. Similar a derecha/reves pero desde la linea de fondo recibiendo un saque.',
    smash: 'REMATE/SMASH: Golpe aereo sobre la cabeza, similar al saque pero respondiendo a un globo. La pelota viene alta del oponente.',
    dropshot: 'DEJADA: Golpe suave que apenas pasa la red. Movimiento corto con mucho corte.',
    lob: 'GLOBO: Golpe alto que pasa por encima del oponente en la red.',
    approach: 'APPROACH: Golpe mientras el jugador avanza hacia la red.',
    halfvolley: 'MEDIA VOLEA: Golpe justo despues del bote, casi al ras del suelo.',
    passing: 'PASSING SHOT: Golpe que pasa al lado del oponente que esta en la red.',
    footwork: 'FOOTWORK: Movimiento de pies sin golpear la pelota.',
  }

  const techniquesList = techniques
    .map((t) => {
      const visualCue = tennisVisualCues[t.slug] || ''
      const variantList =
        t.variants.length > 0
          ? `\n    Variantes: ${t.variants.map((v) => `${v.slug} (${v.name})`).join(', ')}`
          : ''
      return `  - ${t.slug} (${t.name}): ${visualCue || t.description || 'Sin descripcion'}${variantList}`
    })
    .join('\n')

  return `Eres un clasificador experto de tecnicas de ${sportName}.

ANTES DE RESPONDER, analiza el video paso a paso:

PASO 1: Identifica si el jugador es DIESTRO o ZURDO
- Mira que mano sostiene la raqueta principalmente
- La mayoria de jugadores son diestros (mano derecha dominante)

PASO 2: Observa de QUE LADO del cuerpo golpea la pelota
- Si golpea del LADO DERECHO de su cuerpo (para un diestro) = DERECHA (forehand)
- Si golpea del LADO IZQUIERDO de su cuerpo (para un diestro) = REVES (backhand)

PASO 3: Para REVES, cuenta las manos en la raqueta durante el golpe
- UNA sola mano = reves a una mano (one-handed-backhand)
- DOS manos = reves a dos manos (two-handed-backhand)

EJEMPLO VISUAL DE REVES A UNA MANO (diestro):
- La pelota esta del lado IZQUIERDO del jugador
- El brazo DERECHO cruza el cuerpo hacia la IZQUIERDA
- Solo la mano DERECHA sostiene la raqueta
- La ESPALDA del jugador esta mas visible que su pecho

EJEMPLO VISUAL DE DERECHA (diestro):
- La pelota esta del lado DERECHO del jugador
- La raqueta se mueve en el lado DERECHO
- El PECHO del jugador esta mas visible

OTRAS TECNICAS:
- SAQUE (serve): El jugador LANZA la pelota al aire y golpea desde ARRIBA de la cabeza
- VOLEA (volley): Golpe en la RED, la pelota NO BOTA
- REMATE (smash): Golpe sobre la cabeza respondiendo a un globo

TECNICAS DISPONIBLES:
${techniquesList}

Responde EXCLUSIVAMENTE en formato JSON valido:

\`\`\`json
{
  "technique": "<slug de la tecnica>",
  "variant": "<slug de variante o null>",
  "confidence": <numero entre 0.0 y 1.0>,
  "reasoning": "Jugador [diestro/zurdo]. Golpea del lado [derecho/izquierdo] de su cuerpo. [X] mano(s) en raqueta. Por lo tanto es [tecnica].",
  "multipleDetected": false,
  "alternatives": []
}
\`\`\`

Si detectas MULTIPLES tecnicas diferentes en el video:
\`\`\`json
{
  "technique": "<slug de la tecnica PRINCIPAL>",
  "variant": "<slug o null>",
  "confidence": <0.0-1.0>,
  "reasoning": "<explicacion>",
  "multipleDetected": true,
  "alternatives": [
    { "technique": "<slug>", "variant": "<slug o null>", "confidence": <0.0-1.0> }
  ]
}
\`\`\`

REGLAS:
1. Responde SOLO con el JSON, sin texto adicional
2. Sigue los 3 PASOS de analisis antes de decidir
3. En "reasoning" DEBES incluir:
   - Si el jugador es diestro o zurdo
   - De que LADO del cuerpo golpea (izquierdo o derecho)
   - Cuantas manos tiene en la raqueta (si aplica)
4. Si la pelota esta del lado IZQUIERDO de un diestro = es REVES (backhand), NO derecha
5. Si solo hay UNA mano en la raqueta en un reves = es "one-handed-backhand"
6. Si no estas seguro (confidence < 0.6), explicalo`
}
