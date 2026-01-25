import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Tennis sport
  const tennis = await prisma.sport.upsert({
    where: { slug: 'tennis' },
    update: {},
    create: {
      slug: 'tennis',
      name: 'Tenis',
      description: 'Deporte de raqueta que se juega individualmente o en parejas',
      icon: 'tennis',
      isActive: true,
      order: 1,
    },
  })

  console.log('Created sport:', tennis.name)

  // Tennis techniques
  const techniques = [
    {
      slug: 'serve',
      name: 'Saque',
      description: 'Golpe inicial que pone la pelota en juego',
      difficulty: 4,
      correctForm: {
        preparation: 'Pies separados al ancho de hombros, peso equilibrado',
        grip: 'Agarre Continental (martillo)',
        toss: 'Brazo extendido, pelota lanzada ligeramente adelante y a la derecha',
        backswing: 'Codo alto, raqueta cae detras de la espalda',
        contact: 'Brazo completamente extendido, contacto frente al cuerpo',
        followThrough: 'Raqueta cruza hacia el lado opuesto del cuerpo',
      },
      commonErrors: [
        'Lanzamiento de pelota inconsistente',
        'Codo caido durante el backswing',
        'Contacto demasiado bajo',
        'Falta de pronacion',
        'No usar las piernas para impulso',
      ],
      keyPoints: [
        'Lanzamiento consistente',
        'Rotacion de caderas antes que hombros',
        'Codo alto en el backswing',
        'Contacto con brazo extendido',
        'Pronacion en el impacto',
      ],
      variants: [
        {
          slug: 'flat-serve',
          name: 'Saque Plano',
          description: 'Saque de maxima velocidad con trayectoria recta',
          correctForm: {
            toss: 'Directamente arriba, ligeramente adelante',
            contact: 'Impacto en el centro de la pelota',
            trajectory: 'Trayectoria recta hacia el objetivo',
          },
          keyDifferences: [
            'Lanzamiento mas adelante',
            'Impacto directo en el centro',
            'Maxima velocidad, menos spin',
          ],
        },
        {
          slug: 'kick-serve',
          name: 'Saque con Kick',
          description: 'Saque con efecto que produce un bote alto',
          correctForm: {
            toss: 'Ligeramente detras de la cabeza',
            contact: 'Cepillado de abajo hacia arriba',
            trajectory: 'Mayor arco sobre la red',
          },
          keyDifferences: [
            'Lanzamiento mas atras',
            'Movimiento de cepillado ascendente',
            'Bote alto hacia el lado contrario',
          ],
        },
        {
          slug: 'slice-serve',
          name: 'Saque Cortado',
          description: 'Saque con efecto lateral que se abre',
          correctForm: {
            toss: 'Ligeramente a la derecha',
            contact: 'Cepillado lateral de izquierda a derecha',
            trajectory: 'Curva hacia afuera',
          },
          keyDifferences: [
            'Lanzamiento mas a la derecha',
            'Movimiento de corte lateral',
            'Bote bajo que se abre',
          ],
        },
      ],
    },
    {
      slug: 'forehand',
      name: 'Derecha',
      description: 'Golpe fundamental ejecutado del lado dominante',
      difficulty: 2,
      correctForm: {
        stance: 'Posicion semi-abierta o abierta',
        grip: 'Eastern o Semi-Western',
        backswing: 'Unidad de giro con hombros',
        contact: 'Adelante del cuerpo, altura de cintura',
        followThrough: 'Hacia el hombro opuesto',
      },
      commonErrors: [
        'Golpear muy tarde',
        'No girar los hombros',
        'Muñeca suelta en el impacto',
        'No transferir el peso',
      ],
      keyPoints: [
        'Preparacion temprana',
        'Unidad de giro',
        'Punto de contacto adelante',
        'Follow-through completo',
      ],
      variants: [
        {
          slug: 'topspin-forehand',
          name: 'Derecha con Topspin',
          description: 'Derecha con efecto liftado',
          correctForm: {
            swing: 'Movimiento de abajo hacia arriba',
            contact: 'Cepillado ascendente',
          },
          keyDifferences: ['Swing mas vertical', 'Mayor margen sobre la red'],
        },
        {
          slug: 'flat-forehand',
          name: 'Derecha Plana',
          description: 'Derecha con poco efecto para maxima velocidad',
          correctForm: {
            swing: 'Movimiento mas horizontal',
            contact: 'Impacto directo',
          },
          keyDifferences: ['Swing mas horizontal', 'Mayor velocidad'],
        },
      ],
    },
    {
      slug: 'backhand',
      name: 'Reves',
      description: 'Golpe ejecutado del lado no dominante',
      difficulty: 3,
      correctForm: {
        stance: 'Posicion cerrada o semi-abierta',
        grip: 'Eastern de reves (una mano) o Continental + Eastern (dos manos)',
        backswing: 'Giro de hombros completo',
        contact: 'Adelante del cuerpo',
        followThrough: 'Extension hacia el objetivo',
      },
      commonErrors: [
        'Preparacion tardia',
        'No girar suficiente los hombros',
        'Codo volador',
        'Contacto muy cerca del cuerpo',
      ],
      keyPoints: [
        'Giro de hombros completo',
        'Punto de contacto adelante',
        'Brazo/brazos extendidos',
      ],
      variants: [
        {
          slug: 'one-handed-backhand',
          name: 'Reves a Una Mano',
          description: 'Reves clasico ejecutado con una sola mano',
          correctForm: {
            grip: 'Eastern de reves',
            nonDominantHand: 'En la garganta de la raqueta durante preparacion',
          },
          keyDifferences: ['Mayor alcance', 'Requiere mas fuerza de muñeca'],
        },
        {
          slug: 'two-handed-backhand',
          name: 'Reves a Dos Manos',
          description: 'Reves moderno con ambas manos en la raqueta',
          correctForm: {
            grip: 'Continental (dominante) + Eastern (no dominante)',
            contact: 'Ambas manos trabajan juntas',
          },
          keyDifferences: ['Mayor control', 'Mas potencia de rotacion'],
        },
      ],
    },
    {
      slug: 'volley',
      name: 'Volea',
      description: 'Golpe en el aire antes de que la pelota bote',
      difficulty: 3,
      correctForm: {
        stance: 'Posicion lista, rodillas flexionadas',
        grip: 'Continental',
        swing: 'Movimiento corto, punch',
        contact: 'Adelante del cuerpo, raqueta firme',
      },
      commonErrors: [
        'Swing muy largo',
        'Muñeca floja',
        'No moverse hacia la pelota',
        'Contacto muy bajo',
      ],
      keyPoints: [
        'Grip Continental',
        'Movimiento de punch corto',
        'Raqueta firme en el impacto',
        'Moverse hacia adelante',
      ],
      variants: [
        {
          slug: 'forehand-volley',
          name: 'Volea de Derecha',
          description: 'Volea ejecutada del lado dominante',
          correctForm: {},
          keyDifferences: [],
        },
        {
          slug: 'backhand-volley',
          name: 'Volea de Reves',
          description: 'Volea ejecutada del lado no dominante',
          correctForm: {},
          keyDifferences: [],
        },
      ],
    },
  ]

  for (const tech of techniques) {
    const technique = await prisma.technique.upsert({
      where: {
        sportId_slug: {
          sportId: tennis.id,
          slug: tech.slug,
        },
      },
      update: {
        name: tech.name,
        description: tech.description,
        difficulty: tech.difficulty,
        correctForm: tech.correctForm,
        commonErrors: tech.commonErrors,
        keyPoints: tech.keyPoints,
      },
      create: {
        sportId: tennis.id,
        slug: tech.slug,
        name: tech.name,
        description: tech.description,
        difficulty: tech.difficulty,
        correctForm: tech.correctForm,
        commonErrors: tech.commonErrors,
        keyPoints: tech.keyPoints,
      },
    })

    console.log('Created technique:', technique.name)

    // Create variants
    for (const variant of tech.variants) {
      await prisma.variant.upsert({
        where: {
          techniqueId_slug: {
            techniqueId: technique.id,
            slug: variant.slug,
          },
        },
        update: {
          name: variant.name,
          description: variant.description,
          correctForm: variant.correctForm,
          keyDifferences: variant.keyDifferences,
        },
        create: {
          techniqueId: technique.id,
          slug: variant.slug,
          name: variant.name,
          description: variant.description,
          correctForm: variant.correctForm,
          keyDifferences: variant.keyDifferences,
        },
      })
    }
  }

  // Create exercise templates
  const exercises = [
    {
      slug: 'shadow-swing',
      name: 'Shadow Swing',
      description: 'Practica el movimiento sin pelota frente a un espejo',
      instructions:
        'Realiza el movimiento completo de la tecnica frente a un espejo. Enfocate en la forma correcta y repite lentamente hasta dominar el patron de movimiento.',
      category: 'drill',
      targetAreas: ['swing', 'posture', 'balance'],
      sportSlugs: ['tennis'],
      defaultSets: 3,
      defaultReps: 20,
    },
    {
      slug: 'ball-toss-practice',
      name: 'Practica de Lanzamiento',
      description: 'Mejora la consistencia del lanzamiento de pelota',
      instructions:
        'Con una canasta de pelotas, practica solo el lanzamiento sin golpear. La pelota debe caer consistentemente en el mismo punto. Usa un objetivo en el suelo como referencia.',
      category: 'drill',
      targetAreas: ['toss', 'timing'],
      sportSlugs: ['tennis'],
      defaultSets: 3,
      defaultReps: 30,
    },
    {
      slug: 'wall-practice',
      name: 'Practica contra la Pared',
      description: 'Mejora la consistencia y timing golpeando contra una pared',
      instructions:
        'Golpea contra una pared a una distancia de 3-4 metros. Enfocate en mantener la tecnica correcta incluso cuando la pelota regresa rapido.',
      category: 'drill',
      targetAreas: ['timing', 'contact', 'consistency'],
      sportSlugs: ['tennis'],
      defaultSets: 3,
      defaultDurationMins: 10,
    },
    {
      slug: 'resistance-band-rotation',
      name: 'Rotacion con Banda Elastica',
      description: 'Fortalece los musculos de rotacion del core',
      instructions:
        'Sujeta una banda elastica a la altura del pecho. Rota el torso manteniendo las caderas estables. Controla el movimiento en ambas direcciones.',
      category: 'strength',
      targetAreas: ['core', 'rotation'],
      sportSlugs: [],
      defaultSets: 3,
      defaultReps: 15,
    },
    {
      slug: 'shoulder-stretch',
      name: 'Estiramiento de Hombro',
      description: 'Mejora la flexibilidad del hombro para el saque',
      instructions:
        'Lleva el brazo cruzado por delante del pecho y sostenlo con el otro brazo. Manten 30 segundos cada lado.',
      category: 'flexibility',
      targetAreas: ['shoulder', 'flexibility'],
      sportSlugs: [],
      defaultSets: 2,
      defaultDurationMins: 1,
    },
    {
      slug: 'footwork-ladder',
      name: 'Escalera de Agilidad',
      description: 'Mejora la velocidad y coordinacion de pies',
      instructions:
        'Realiza diferentes patrones de pies a traves de una escalera de agilidad. Mantén los pies rapidos y ligeros.',
      category: 'footwork',
      targetAreas: ['footwork', 'agility', 'balance'],
      sportSlugs: [],
      defaultSets: 3,
      defaultReps: 5,
    },
    {
      slug: 'split-step-drill',
      name: 'Ejercicio de Split Step',
      description: 'Practica el split step para mejorar la reaccion',
      instructions:
        'Practica el pequeño salto de preparacion (split step) antes de cada golpe. Aterriza con las rodillas flexionadas listo para moverte en cualquier direccion.',
      category: 'drill',
      targetAreas: ['footwork', 'timing', 'balance'],
      sportSlugs: ['tennis'],
      defaultSets: 3,
      defaultReps: 20,
    },
    {
      slug: 'wrist-strengthening',
      name: 'Fortalecimiento de Muñeca',
      description: 'Ejercicios para fortalecer la muñeca',
      instructions:
        'Con una pesa ligera o la raqueta, realiza flexiones y extensiones de muñeca controladas. Tambien rotaciones.',
      category: 'strength',
      targetAreas: ['wrist', 'grip'],
      sportSlugs: ['tennis'],
      defaultSets: 3,
      defaultReps: 15,
    },
  ]

  for (const exercise of exercises) {
    await prisma.exerciseTemplate.upsert({
      where: { slug: exercise.slug },
      update: {
        name: exercise.name,
        description: exercise.description,
        instructions: exercise.instructions,
        category: exercise.category,
        targetAreas: exercise.targetAreas,
        sportSlugs: exercise.sportSlugs,
        defaultSets: exercise.defaultSets,
        defaultReps: exercise.defaultReps,
        defaultDurationMins: exercise.defaultDurationMins,
      },
      create: exercise,
    })
  }

  console.log('Created exercise templates')

  // Create placeholder sports for future
  const futureSports = [
    { slug: 'golf', name: 'Golf', icon: 'golf', order: 2 },
    { slug: 'basketball', name: 'Basketball', icon: 'basketball', order: 3 },
    { slug: 'soccer', name: 'Futbol', icon: 'soccer', order: 4 },
  ]

  for (const sport of futureSports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {},
      create: {
        ...sport,
        isActive: false,
        description: 'Proximamente',
      },
    })
  }

  console.log('Created placeholder sports')
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
