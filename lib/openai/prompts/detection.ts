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
    forehand: 'DERECHA: Golpe del lado de la mano dominante (derecha para diestros). La raqueta viene desde atras del cuerpo hacia adelante. Pelota viene del oponente.',
    backhand: 'REVES: Golpe del lado NO dominante (izquierda para diestros). Puede ser a una o dos manos. Pelota viene del oponente.',
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

Tu UNICA tarea es ver el video e identificar QUE TECNICA especifica esta ejecutando el jugador.

COMO DISTINGUIR LAS TECNICAS PRINCIPALES:
- SAQUE (serve): El jugador LANZA la pelota al aire y golpea DESDE ARRIBA. No hay pelota entrante del oponente.
- DERECHA (forehand): Golpe con la raqueta del LADO DOMINANTE (derecha para diestros). Pelota viene del otro lado.
- REVES (backhand): Golpe del LADO NO DOMINANTE. Cuerpo gira hacia ese lado. Puede ser 1 o 2 manos.
- VOLEA (volley): Golpe EN LA RED, la pelota NO BOTA. Movimiento corto.
- REMATE (smash): Golpe SOBRE LA CABEZA respondiendo a una pelota alta/globo.

TECNICAS DISPONIBLES:
${techniquesList}

Responde EXCLUSIVAMENTE en formato JSON valido:

\`\`\`json
{
  "technique": "<slug de la tecnica>",
  "variant": "<slug de variante o null>",
  "confidence": <numero entre 0.0 y 1.0>,
  "reasoning": "<explicacion breve en espanol de por que identificaste esta tecnica>",
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
2. Mira el video COMPLETO antes de decidir
3. Enfocate en el GOLPE PRINCIPAL que se ejecuta
4. Si ves un saque: el jugador LANZA la pelota, no hay pelota entrante
5. Si ves derecha/reves: hay una pelota que VIENE del oponente
6. Si no estas seguro (confidence < 0.6), explicalo en reasoning`
}
