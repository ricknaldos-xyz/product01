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

PASO 0: DETERMINA LA POSICION DE LA CAMARA
- La camara puede estar DELANTE del jugador (se ve su pecho), DETRAS (se ve su espalda), o de LADO
- IMPORTANTE: Si la camara esta DETRAS del jugador, lo que aparece a la IZQUIERDA en la imagen es en realidad el lado DERECHO del jugador, y viceversa
- Identifica la posicion de la camara ANTES de determinar izquierda/derecha del jugador

PASO 1: Identifica si el jugador es DIESTRO o ZURDO
- Mira que mano sostiene la raqueta principalmente
- La mayoria de jugadores son diestros (mano derecha dominante)

PASO 2: Observa de QUE LADO DEL CUERPO DEL JUGADOR golpea la pelota
- ATENCION: Usa la perspectiva DEL JUGADOR, no de la camara
- Para un DIESTRO:
  - DERECHA (forehand) = golpea del lado de su mano dominante (derecha del jugador)
  - REVES (backhand) = golpea del lado OPUESTO a su mano dominante (izquierda del jugador)
- CLAVE BIOMECANICA para distinguir:
  - DERECHA: El brazo dominante se extiende NATURALMENTE hacia el lado de la mano dominante. El pecho mira hacia la red.
  - REVES: El brazo dominante CRUZA el cuerpo hacia el lado opuesto. La espalda o el hombro apunta hacia la red durante la preparacion.

PASO 3: Para REVES, cuenta las manos en la raqueta durante el golpe
- UNA sola mano = reves a una mano (one-handed-backhand)
- DOS manos = reves a dos manos (two-handed-backhand)

CLAVES BIOMECANICAS PARA DISTINGUIR DERECHA vs REVES:
- En la DERECHA (forehand): la raqueta se prepara DETRAS del cuerpo del lado dominante. El movimiento va de atras hacia adelante por el lado de la mano dominante.
- En el REVES (backhand): la raqueta CRUZA el cuerpo durante la preparacion. El dorso de la mano dominante mira hacia la red al momento del impacto. El hombro delantero apunta hacia la red.
- Si el jugador esta de espaldas a la camara y ves que el brazo cruza hacia el otro lado = REVES
- Si el jugador rota mostrando la espalda al oponente durante la preparacion = probablemente REVES

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
  "reasoning": "Camara desde [delante/detras/lado]. Jugador [diestro/zurdo]. El brazo [cruza/no cruza] el cuerpo. [X] mano(s) en raqueta. Por lo tanto es [tecnica].",
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
2. Sigue los 4 PASOS de analisis (0,1,2,3) antes de decidir
3. En "reasoning" DEBES incluir:
   - Posicion de la camara (delante, detras, lado)
   - Si el jugador es diestro o zurdo
   - Si el brazo cruza el cuerpo o no
   - De que LADO DEL CUERPO DEL JUGADOR golpea
   - Cuantas manos tiene en la raqueta (si aplica)
4. Si el brazo dominante CRUZA el cuerpo hacia el lado opuesto = es REVES (backhand)
5. Si solo hay UNA mano en la raqueta en un reves = es "one-handed-backhand"
6. Si no estas seguro (confidence < 0.6), explicalo`
}
