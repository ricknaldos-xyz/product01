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

  return: `
## BIOMECANICA CORRECTA DEL RESTO DE SAQUE

### Posicion de Anticipacion:
- Posicion baja, rodillas flexionadas, peso en puntas de los pies
- Raqueta al frente en posicion semi-preparada
- Ubicacion segun el tipo de saque esperado

### Split Step:
- Salto pequeno sincronizado con el impacto del sacador
- Aterrizar con ambos pies, rodillas flexionadas
- Listo para explotar en cualquier direccion

### Backswing Reducido:
- Backswing 50% mas corto que un groundstroke normal
- Preparacion compacta y rapida
- Usar el ritmo y velocidad del saque entrante

### Punto de Contacto:
- Adelante del cuerpo, firme y decidido
- Aprovechar el ritmo del saque para la devolucion
- Bloqueo solido contra primeros saques rapidos

### Recuperacion:
- Explosiva hacia el centro de la linea de fondo
- Preparacion inmediata para el siguiente golpe`,

  approach: `
## BIOMECANICA CORRECTA DEL GOLPE DE APROXIMACION

### Lectura y Posicionamiento:
- Detectar pelota corta temprano y avanzar sin dudar
- Moverse hacia la pelota mientras se prepara el golpe
- Decision de direccion antes de llegar a la pelota

### Preparacion en Movimiento:
- Backswing compacto mientras se avanza
- No detenerse para golpear — impactar en movimiento
- Peso transferido hacia adelante durante todo el golpe

### Punto de Contacto:
- Adelante del cuerpo con peso en el pie delantero
- Trayectoria baja y profunda al lado debil del oponente
- Control sobre potencia — la posicion en la red gana el punto

### Transicion a la Red:
- Continuar avanzando despues del golpe sin pausa
- Split step al llegar a la zona de volea
- Cerrar el angulo cubriendo el lado del golpe de aproximacion`,

  smash: `
## BIOMECANICA CORRECTA DEL REMATE

### Posicionamiento:
- Moverse debajo de la pelota con pasos laterales o cruzados
- NUNCA girar de espaldas a la red
- Brazo no dominante apunta a la pelota como guia visual

### Preparacion:
- Similar al saque: raqueta atras detras de la cabeza
- Codo alto, muñeca relajada
- Rodillas ligeramente flexionadas para impulso

### Punto de Contacto:
- Brazo completamente extendido hacia arriba
- Contacto en el punto mas alto posible
- Pronacion del antebrazo en el impacto
- Dirigir al espacio abierto, no solo buscar potencia

### Follow-through:
- Natural hacia abajo y al frente
- Peso transferido hacia adelante
- Recuperacion inmediata a posicion de red`,

  dropshot: `
## BIOMECANICA CORRECTA DE LA DEJADA

### Disfraz (Clave):
- Preparacion IDENTICA al groundstroke normal
- El oponente no debe detectar la dejada hasta despues del contacto
- Misma posicion corporal y backswing que un golpe regular

### Grip y Contacto:
- Grip Continental para maximo control del spin
- Cara de raqueta abierta, deslizar debajo de la pelota
- Toque suave — la raqueta "acaricia" la pelota
- Backspin pronunciado para que la pelota no avance tras botar

### Follow-through:
- Minimo — la raqueta casi se detiene despues del contacto
- No empujar la pelota, dejar que el angulo haga el trabajo

### Seleccion Tactica:
- Ejecutar cuando el oponente esta atras de la linea de fondo
- Evitar intentar desde posicion defensiva
- Alternar con golpes profundos para mantener al oponente adivinando`,

  lob: `
## BIOMECANICA CORRECTA DEL GLOBO

### Preparacion Disfrazada:
- Preparacion identica al groundstroke o passing shot
- El oponente no debe anticipar el globo
- Misma postura y backswing inicial

### Contacto:
- Cara de raqueta abierta, contacto debajo de la pelota
- Swing de abajo hacia arriba para generar la elevacion
- Control preciso de la fuerza para lograr profundidad correcta

### Trayectoria:
- Altura suficiente para que el oponente no alcance con smash
- Profundidad cerca de la linea de fondo
- Considerar el viento y las condiciones del techo (indoor)

### Follow-through:
- Hacia arriba y adelante, siguiendo la trayectoria deseada
- Mantener el equilibrio para estar listo si la pelota vuelve`,

  halfvolley: `
## BIOMECANICA CORRECTA DE LA MEDIA VOLEA

### Posicionamiento:
- Rodillas MUY flexionadas, centro de gravedad extremadamente bajo
- La raqueta debe llegar casi al nivel del suelo
- Paso adelante hacia la pelota con el pie contrario

### Grip y Raqueta:
- Grip Continental para versatilidad
- Cara de raqueta ligeramente abierta para elevar sobre la red
- Cabeza de la raqueta firme, sin aflojarse

### Contacto:
- Timing critico: justo despues del bote, la pelota apenas sube
- Movimiento de bloqueo firme, NO swing completo
- Absorber el impacto con la raqueta firme
- Dirigir con la cara de la raqueta, no con el swing

### Follow-through:
- Corto y controlado hacia el objetivo
- Mantener posicion baja durante todo el golpe
- Recuperacion inmediata a posicion de volea`,

  passing: `
## BIOMECANICA CORRECTA DEL PASSING SHOT

### Lectura del Oponente:
- Evaluar la posicion del oponente en la red ANTES de golpear
- Decidir direccion (paralelo vs cruzado) basado en su posicion
- Considerar el globo como alternativa si el oponente esta bien posicionado

### Preparacion Bajo Presion:
- Preparacion rapida y compacta a pesar de la presion del approach
- No apresurarse — tomar la pelota en la zona de confort
- Mantener la calma y la tecnica limpia

### Punto de Contacto:
- Firme y dirigido al espacio abierto
- Trayectoria baja sobre la red para dificultar la volea
- Precision sobre potencia — no intentar winners imposibles

### Variedad:
- Alternar entre paralelo y cruzado para ser impredecible
- Usar topspin para que la pelota caiga a los pies del oponente
- El globo es siempre una opcion valida`,

  footwork: `
## BIOMECANICA CORRECTA DEL TRABAJO DE PIES

### Posicion Base:
- Rodillas flexionadas, peso en las puntas de los pies
- Pies al ancho de hombros, equilibrio centrado
- Pies activos, nunca completamente quietos (pequeños rebotes)

### Split Step:
- Ejecutar en CADA golpe del oponente sin excepcion
- Salto pequeno y aterrizaje con rodillas flexionadas
- Permite reaccionar explosivamente en cualquier direccion

### Movimiento Lateral:
- Pasos laterales rapidos (shuffle) para distancias cortas
- Paso cruzado para cubrir distancias largas
- NUNCA cruzar los pies durante el shuffle lateral

### Recuperacion:
- Vuelta explosiva al centro despues de CADA golpe
- No quedarse viendo el golpe — moverse inmediatamente
- Primer paso rapido en la direccion correcta

### Ajuste Final:
- Pasos pequenos y rapidos para posicionamiento preciso
- Llegar a la pelota con el peso equilibrado
- Base estable en el momento del impacto`,
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
  return: {
    'first-serve-return': `
VARIANTE: RESTO DE PRIMER SAQUE
- Posicion mas retrasada (1-2 metros detras de la linea de fondo)
- Backswing minimo, casi bloqueo
- Prioridad: devolver profundo y en juego
- Usar el ritmo del saque, no generar potencia propia
- Ideal: devolucion profunda al centro para neutralizar`,

    'second-serve-return': `
VARIANTE: RESTO DE SEGUNDO SAQUE
- Posicion adelantada, dentro o sobre la linea de fondo
- Swing mas completo, similar a groundstroke
- Oportunidad de atacar y tomar control del punto
- Buscar golpe agresivo a una esquina
- Avanzar hacia adelante con el golpe`,

    'block-return': `
VARIANTE: RESTO BLOQUEADO
- Sin backswing, raqueta firme al frente como pared
- Cara ligeramente abierta para elevar sobre la red
- Ideal contra saques muy rapidos o con mucho efecto
- Usar el ritmo del saque completamente
- Devolucion profunda y controlada`,
  },
  approach: {
    'forehand-approach': `
VARIANTE: APROXIMACION DE DERECHA
- Grip Semi-Western o Eastern
- Topspin controlado o plano segun la situacion
- Mas opciones de angulo disponibles
- Dirigir preferiblemente al reves del oponente`,

    'backhand-approach': `
VARIANTE: APROXIMACION DE REVES
- Preparacion compacta y dirigida
- Generalmente cruzada o por el centro
- Slice de reves es muy efectivo como approach
- Mantener trayectoria baja y profunda`,

    'slice-approach': `
VARIANTE: APROXIMACION CORTADA (SLICE)
- Cara de raqueta abierta, movimiento de arriba hacia abajo
- La pelota se mantiene muy baja despues del bote
- Da mas tiempo para llegar a la red
- Dificil de atacar con passing por la baja altura
- Ideal para transicion fluida a posicion de volea`,
  },
  smash: {
    'standard-smash': `
VARIANTE: REMATE ESTANDAR
- Pies plantados en el suelo, base solida
- Mayor control y precision
- Usado cuando la pelota no esta demasiado alta o atras
- Mecanica similar al saque pero sin lanzamiento`,

    'jump-smash': `
VARIANTE: REMATE CON SALTO
- Impulso vertical con ambas piernas
- Contacto en el punto mas alto del salto
- Mayor alcance para pelotas altas o retrasadas
- Requiere excelente timing y coordinacion
- Aterrizaje controlado para recuperacion`,

    'backhand-smash': `
VARIANTE: REMATE DE REVES
- Giro de hombros rapido para posicionarse
- Contacto sobre el hombro no dominante
- Menos potencia que el remate de derecha
- Usado como recurso de emergencia
- Requiere excelente coordinacion`,
  },
  dropshot: {
    'forehand-dropshot': `
VARIANTE: DEJADA DE DERECHA
- Preparacion identica a la derecha normal
- Mas natural de disfrazar por la variedad de grips
- Mayor variedad de angulos posibles
- Abrir cara de raqueta en el ultimo momento`,

    'backhand-dropshot': `
VARIANTE: DEJADA DE REVES
- Se integra naturalmente con el slice de reves
- Dificil de leer para el oponente (parece slice normal)
- Usar grip Continental
- Reducir la velocidad del swing en el ultimo momento`,
  },
  lob: {
    'topspin-lob': `
VARIANTE: GLOBO CON TOPSPIN
- Swing de abajo hacia arriba con cepillado pronunciado
- El topspin hace que la pelota caiga mas rapido dentro de la cancha
- Mas agresivo y dificil de alcanzar
- Requiere buena tecnica de brushing
- Ideal como golpe ofensivo sorpresivo`,

    'defensive-lob': `
VARIANTE: GLOBO DEFENSIVO
- Muy alto para ganar maximo tiempo
- Profundo para empujar al oponente hacia la linea de fondo
- Desde posicion de emergencia (estirado, desequilibrado)
- Prioridad: sobrevivir el punto y reposicionarse
- Cara de raqueta muy abierta`,

    'offensive-lob': `
VARIANTE: GLOBO OFENSIVO
- Disfrazado como passing shot hasta el ultimo momento
- Menos alto que el defensivo, pero mas rapido
- Pasa justo sobre el alcance del oponente
- Busca ganar el punto directamente
- Requiere lectura perfecta de la posicion del rival`,
  },
  halfvolley: {
    'forehand-halfvolley': `
VARIANTE: MEDIA VOLEA DE DERECHA
- Grip Continental o Eastern
- Paso adelante con pie contrario
- Mas natural y con mejor control de angulo
- Bloqueo firme con muñeca estable`,

    'backhand-halfvolley': `
VARIANTE: MEDIA VOLEA DE REVES
- Grip Continental obligatorio
- Paso adelante con pie del lado dominante
- Mas dificil, requiere mas fuerza de muñeca
- Mantener cabeza de raqueta firme`,
  },
  passing: {
    'down-the-line-passing': `
VARIANTE: PASSING PARALELO
- Por la linea lateral, menor margen de error
- Mas sorpresivo si el oponente se mueve al centro
- Requiere timing preciso y contacto firme
- Efectivo cuando el oponente cubre el cruzado`,

    'crosscourt-passing': `
VARIANTE: PASSING CRUZADO
- En diagonal, mayor margen sobre la red (parte mas baja)
- Mas distancia de cancha disponible
- Opcion mas segura estadisticamente
- Efectivo con angulo pronunciado`,

    'topspin-passing': `
VARIANTE: PASSING CON TOPSPIN
- Topspin pronunciado que hace caer la pelota a los pies
- La pelota baja rapidamente despues de cruzar la red
- Dificil de volear porque llega bajo
- Mayor margen sobre la red por el efecto
- Ideal para passing cruzado con angulo`,
  },
  footwork: {
    'split-step': `
VARIANTE: SPLIT STEP
- Salto pequeno justo cuando el oponente hace contacto
- Aterrizar con pies al ancho de hombros, rodillas flexionadas
- Base de TODO movimiento en tenis
- Sin split step, la reaccion es demasiado lenta
- Debe ser automatico en cada punto`,

    'recovery-step': `
VARIANTE: PASO DE RECUPERACION
- Vuelta explosiva al centro despues de cada golpe
- No caminar — moverse con urgencia
- La velocidad de recuperacion define el nivel del jugador
- Orientarse hacia el centro de la linea de fondo
- Estar listo para el split step al llegar`,

    'crossover-step': `
VARIANTE: PASO CRUZADO
- Pie trasero cruza POR ENCIMA del pie delantero
- Para cubrir distancias largas lateralmente
- Mas rapido que el shuffle lateral para distancias grandes
- Transicion a pasos de ajuste al acercarse a la pelota
- Usado para bolas anchas y defensivas`,

    'lateral-shuffle': `
VARIANTE: DESPLAZAMIENTO LATERAL
- Pasos laterales rapidos SIN cruzar los pies
- Mayor equilibrio y control durante el movimiento
- Para distancias cortas y ajustes finos
- Mantener centro de gravedad bajo
- Ideal para posicionamiento cerca de la pelota`,
  },
}

export function buildTennisPrompt(
  techniqueSlug: string,
  variantSlug: string | null,
  correctForm: unknown,
  commonErrors: unknown,
  ragContext?: string
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
${ragContext || ''}

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
