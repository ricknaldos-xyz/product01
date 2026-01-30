import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('test1234', 10)

  // ============================================
  // USERS
  // ============================================

  // 1. Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sporttech.pe' },
    update: {},
    create: {
      email: 'admin@sporttech.pe',
      name: 'Admin SportTech',
      password: hashedPassword,
      role: 'ADMIN',
      accountType: 'PLAYER',
      subscription: 'ELITE',
      onboardingCompleted: true,
      emailVerified: new Date(),
      playerProfile: {
        create: {
          displayName: 'Admin',
          country: 'PE',
          region: 'Lima',
          city: 'Lima',
          playStyle: 'All-Court',
          dominantHand: 'Derecha',
          backhandType: 'Dos manos',
          yearsPlaying: 15,
          ageGroup: '26-35',
          matchElo: 1800,
          compositeScore: 85,
          skillTier: 'DIAMANTE',
          effectiveScore: 85,
          totalAnalyses: 50,
          totalTechniques: 12,
        },
      },
    },
  })
  console.log('Created admin:', adminUser.email)

  // 2. Player FREE
  const testUser = await prisma.user.upsert({
    where: { email: 'test@sporttech.pe' },
    update: {},
    create: {
      email: 'test@sporttech.pe',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      subscription: 'FREE',
      onboardingCompleted: true,
      emailVerified: new Date(),
      playerProfile: {
        create: {
          displayName: 'TestPlayer',
          country: 'PE',
          region: 'Lima',
          city: 'Lima',
          playStyle: 'Agresivo',
          dominantHand: 'Derecha',
          backhandType: 'Dos manos',
          yearsPlaying: 3,
          ageGroup: '18-25',
          matchElo: 1200,
          compositeScore: 45,
          skillTier: 'BRONCE',
          effectiveScore: 45,
          totalAnalyses: 5,
          totalTechniques: 4,
        },
      },
    },
  })
  console.log('Created test user:', testUser.email)

  // 3. Player PRO
  const proPlayer = await prisma.user.upsert({
    where: { email: 'pro@sporttech.pe' },
    update: {},
    create: {
      email: 'pro@sporttech.pe',
      name: 'Carlos Mendoza',
      password: hashedPassword,
      role: 'USER',
      subscription: 'PRO',
      onboardingCompleted: true,
      emailVerified: new Date(),
      playerProfile: {
        create: {
          displayName: 'CarlosMTennis',
          bio: 'Jugador de tenis competitivo. Busco mejorar mi reves.',
          country: 'PE',
          region: 'Lima',
          city: 'Miraflores',
          playStyle: 'Agresivo de fondo',
          dominantHand: 'Derecha',
          backhandType: 'Una mano',
          yearsPlaying: 7,
          ageGroup: '26-35',
          matchElo: 1450,
          compositeScore: 62,
          skillTier: 'PLATA',
          effectiveScore: 62,
          totalAnalyses: 18,
          totalTechniques: 8,
          matchesPlayed: 12,
          matchesWon: 8,
          followersCount: 5,
          followingCount: 3,
        },
      },
    },
  })
  console.log('Created pro player:', proPlayer.email)

  // 4. Player ELITE
  const elitePlayer = await prisma.user.upsert({
    where: { email: 'elite@sporttech.pe' },
    update: {},
    create: {
      email: 'elite@sporttech.pe',
      name: 'Maria Fernandez',
      password: hashedPassword,
      role: 'USER',
      subscription: 'ELITE',
      onboardingCompleted: true,
      emailVerified: new Date(),
      playerProfile: {
        create: {
          displayName: 'MariaFTennis',
          bio: 'Ex top 10 nacional juvenil. Entreno 5 veces por semana.',
          country: 'PE',
          region: 'Lima',
          city: 'San Isidro',
          playStyle: 'Agresivo',
          dominantHand: 'Derecha',
          backhandType: 'Dos manos',
          yearsPlaying: 12,
          ageGroup: '18-25',
          matchElo: 1650,
          compositeScore: 78,
          skillTier: 'ORO',
          effectiveScore: 78,
          totalAnalyses: 35,
          totalTechniques: 12,
          matchesPlayed: 25,
          matchesWon: 19,
          followersCount: 15,
          followingCount: 8,
        },
      },
    },
  })
  console.log('Created elite player:', elitePlayer.email)

  // 5. Another player (padel focus)
  const padelPlayer = await prisma.user.upsert({
    where: { email: 'padel@sporttech.pe' },
    update: {},
    create: {
      email: 'padel@sporttech.pe',
      name: 'Andres Torres',
      password: hashedPassword,
      role: 'USER',
      subscription: 'PRO',
      onboardingCompleted: true,
      emailVerified: new Date(),
      playerProfile: {
        create: {
          displayName: 'AndresTorres',
          bio: 'Jugador de padel amateur. Me encanta la estrategia.',
          country: 'PE',
          region: 'Lima',
          city: 'La Molina',
          playStyle: 'Defensivo',
          dominantHand: 'Derecha',
          backhandType: 'Dos manos',
          yearsPlaying: 2,
          ageGroup: '36-45',
          matchElo: 1100,
          compositeScore: 35,
          skillTier: 'BRONCE',
          effectiveScore: 35,
          totalAnalyses: 8,
          totalTechniques: 5,
        },
      },
    },
  })
  console.log('Created padel player:', padelPlayer.email)

  // 6. New user (no onboarding)
  const newUser = await prisma.user.upsert({
    where: { email: 'nuevo@sporttech.pe' },
    update: {},
    create: {
      email: 'nuevo@sporttech.pe',
      name: 'Usuario Nuevo',
      password: hashedPassword,
      role: 'USER',
      subscription: 'FREE',
      onboardingCompleted: false,
      emailVerified: new Date(),
    },
  })
  console.log('Created new user:', newUser.email)

  // 7. Verified coach
  const testCoach = await prisma.user.upsert({
    where: { email: 'coach@sporttech.pe' },
    update: {},
    create: {
      email: 'coach@sporttech.pe',
      name: 'Test Coach',
      password: hashedPassword,
      role: 'COACH',
      accountType: 'COACH',
      subscription: 'PRO',
      onboardingCompleted: true,
      emailVerified: new Date(),
      coachProfile: {
        create: {
          headline: 'Entrenador certificado con 10 años de experiencia',
          bio: 'Ex jugador profesional, especializado en técnica de saque y estrategia de juego.',
          certifications: ['ITF Nivel 1', 'RPT Profesional'],
          yearsExperience: 10,
          specialties: ['Saque', 'Estrategia', 'Preparación física'],
          hourlyRate: 80,
          currency: 'PEN',
          isAvailable: true,
          country: 'PE',
          city: 'Lima',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          averageRating: 4.8,
          totalReviews: 12,
        },
      },
    },
  })
  console.log('Created test coach:', testCoach.email)

  // 8. Pending coach
  const pendingCoach = await prisma.user.upsert({
    where: { email: 'coach2@sporttech.pe' },
    update: {},
    create: {
      email: 'coach2@sporttech.pe',
      name: 'Laura Gomez',
      password: hashedPassword,
      role: 'COACH',
      accountType: 'COACH',
      subscription: 'PRO',
      onboardingCompleted: true,
      emailVerified: new Date(),
      coachProfile: {
        create: {
          headline: 'Entrenadora de padel y tenis juvenil',
          bio: 'Especialista en desarrollo de jugadores juveniles. 5 años de experiencia formando campeones.',
          certifications: ['FPT Nivel 2'],
          yearsExperience: 5,
          specialties: ['Juveniles', 'Derecha', 'Táctica'],
          hourlyRate: 60,
          currency: 'PEN',
          isAvailable: true,
          country: 'PE',
          city: 'Arequipa',
          verificationStatus: 'PENDING_VERIFICATION',
        },
      },
    },
  })
  console.log('Created pending coach:', pendingCoach.email)

  // 9. Rejected coach
  const rejectedCoach = await prisma.user.upsert({
    where: { email: 'coach3@sporttech.pe' },
    update: {},
    create: {
      email: 'coach3@sporttech.pe',
      name: 'Pedro Ruiz',
      password: hashedPassword,
      role: 'COACH',
      accountType: 'COACH',
      subscription: 'FREE',
      onboardingCompleted: true,
      emailVerified: new Date(),
      coachProfile: {
        create: {
          headline: 'Instructor de tenis recreativo',
          bio: 'Clases para principiantes y nivel intermedio.',
          certifications: [],
          yearsExperience: 2,
          specialties: ['Principiantes'],
          hourlyRate: 40,
          currency: 'PEN',
          isAvailable: false,
          country: 'PE',
          city: 'Lima',
          verificationStatus: 'REJECTED',
        },
      },
    },
  })
  console.log('Created rejected coach:', rejectedCoach.email)

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
    {
      slug: 'return',
      name: 'Resto de Saque',
      description: 'Devolucion del saque del oponente, requiere reaccion rapida y backswing corto',
      difficulty: 3,
      correctForm: {
        readyPosition: 'Posicion baja, peso en puntas de los pies, raqueta al frente',
        splitStep: 'Salto pequeno justo cuando el oponente impacta la pelota',
        backswing: 'Backswing reducido (50% del groundstroke normal)',
        contact: 'Adelante del cuerpo, usar el ritmo del saque entrante',
        recovery: 'Recuperacion inmediata al centro de la linea de fondo',
      },
      commonErrors: [
        'Preparacion tardia por no leer el lanzamiento del sacador',
        'Backswing demasiado largo para primer saque rapido',
        'No hacer split step antes del golpe',
        'Posicion demasiado erguida, sin flexion de rodillas',
        'No ajustar la posicion segun el tipo de saque',
      ],
      keyPoints: [
        'Split step sincronizado con el impacto del sacador',
        'Backswing compacto y rapido',
        'Usar el ritmo del saque a tu favor',
        'Leer la direccion del saque temprano',
        'Recuperacion explosiva al centro',
      ],
      variants: [
        {
          slug: 'first-serve-return',
          name: 'Resto de Primer Saque',
          description: 'Devolucion defensiva contra saques rapidos',
          correctForm: {
            stance: 'Mas atras de la linea de fondo',
            backswing: 'Minimo, casi bloqueo',
            objective: 'Devolver profundo y seguro',
          },
          keyDifferences: [
            'Posicion mas retrasada',
            'Prioridad: devolver en juego',
            'Backswing casi inexistente',
          ],
        },
        {
          slug: 'second-serve-return',
          name: 'Resto de Segundo Saque',
          description: 'Devolucion agresiva contra segundos saques',
          correctForm: {
            stance: 'Mas adelante, dentro de la cancha',
            backswing: 'Mas completo, similar a groundstroke',
            objective: 'Golpe agresivo para tomar control',
          },
          keyDifferences: [
            'Posicion adelantada para atacar',
            'Swing mas completo y agresivo',
            'Buscar winners o forzar errores',
          ],
        },
        {
          slug: 'block-return',
          name: 'Resto Bloqueado',
          description: 'Devolucion con minimo movimiento usando el ritmo del saque',
          correctForm: {
            swing: 'Sin backswing, solo raqueta firme al frente',
            contact: 'Bloqueo solido con cara abierta',
          },
          keyDifferences: [
            'Cero backswing',
            'Raqueta como pared',
            'Ideal contra saques muy rapidos',
          ],
        },
      ],
    },
    {
      slug: 'approach',
      name: 'Golpe de Aproximacion',
      description: 'Golpe de transicion para subir a la red, con trayectoria baja y profunda',
      difficulty: 3,
      correctForm: {
        positioning: 'Pelota corta detectada temprano, movimiento hacia adelante',
        backswing: 'Compacto, preparacion mientras se avanza',
        contact: 'Adelante del cuerpo con peso transferido hacia la red',
        trajectory: 'Trayectoria baja y profunda, preferiblemente al reves del oponente',
        transition: 'Continuar movimiento hacia la red despues del golpe',
      },
      commonErrors: [
        'Detenerse para golpear en vez de golpear en movimiento',
        'Trayectoria alta que permite passing facil',
        'No continuar hacia la red despues del golpe',
        'Golpe sin direccion, al centro de la cancha',
        'Preparacion tardia al no leer la pelota corta',
      ],
      keyPoints: [
        'Golpear en movimiento hacia adelante',
        'Trayectoria baja y profunda',
        'Dirigir al lado debil del oponente',
        'Split step al llegar a la red',
        'Transicion fluida del golpe a la posicion de volea',
      ],
      variants: [
        {
          slug: 'forehand-approach',
          name: 'Aproximacion de Derecha',
          description: 'Golpe de aproximacion con la derecha',
          correctForm: {
            grip: 'Semi-Western o Eastern',
            swing: 'Movimiento ascendente con topspin controlado',
          },
          keyDifferences: ['Mas opciones de angulo', 'Puede ir con topspin o plana'],
        },
        {
          slug: 'backhand-approach',
          name: 'Aproximacion de Reves',
          description: 'Golpe de aproximacion con el reves',
          correctForm: {
            grip: 'Continental o Eastern de reves',
            swing: 'Swing compacto y dirigido',
          },
          keyDifferences: ['Requiere mas preparacion', 'Generalmente cruzada o por el centro'],
        },
        {
          slug: 'slice-approach',
          name: 'Aproximacion Cortada',
          description: 'Golpe de aproximacion con efecto cortado que mantiene la pelota baja',
          correctForm: {
            swing: 'De arriba hacia abajo con cara abierta',
            trajectory: 'Baja y deslizante',
          },
          keyDifferences: [
            'Pelota se mantiene muy baja',
            'Dificil de atacar con passing',
            'Mas tiempo para llegar a la red',
          ],
        },
      ],
    },
    {
      slug: 'smash',
      name: 'Remate',
      description: 'Golpe aereo agresivo similar al saque, ejecutado cerca de la red',
      difficulty: 4,
      correctForm: {
        positioning: 'Moverse debajo de la pelota con pasos laterales/cruzados',
        preparation: 'Brazo no dominante apunta a la pelota, raqueta atras como en saque',
        contact: 'Brazo completamente extendido, contacto en el punto mas alto',
        followThrough: 'Seguimiento natural hacia abajo y al frente',
        footwork: 'Peso transferido hacia adelante en el impacto',
      },
      commonErrors: [
        'No moverse debajo de la pelota a tiempo',
        'Dejar caer el brazo de guia demasiado pronto',
        'Contacto con brazo no extendido completamente',
        'Intentar golpear demasiado fuerte sacrificando control',
        'No ajustar la posicion con pasos pequenos',
        'Girar de espaldas a la red en vez de hacer pasos laterales',
      ],
      keyPoints: [
        'Brazo libre apunta a la pelota como guia',
        'Moverse con pasos laterales, nunca de espaldas',
        'Contacto en el punto mas alto posible',
        'Pronacion similar al saque',
        'Dirigir al espacio abierto, no solo fuerza',
      ],
      variants: [
        {
          slug: 'standard-smash',
          name: 'Remate Estandar',
          description: 'Remate clasico con los pies en el suelo',
          correctForm: {
            base: 'Pies plantados, peso equilibrado',
            contact: 'Punto mas alto con brazo extendido',
          },
          keyDifferences: ['Mayor control', 'Base solida en el suelo'],
        },
        {
          slug: 'jump-smash',
          name: 'Remate con Salto',
          description: 'Remate con impulso vertical para mayor alcance',
          correctForm: {
            jump: 'Impulso vertical con ambas piernas',
            timing: 'Contacto en el punto mas alto del salto',
          },
          keyDifferences: ['Mayor alcance', 'Mas potencia', 'Requiere mejor timing'],
        },
        {
          slug: 'backhand-smash',
          name: 'Remate de Reves',
          description: 'Remate ejecutado del lado no dominante',
          correctForm: {
            rotation: 'Giro de hombros rapido',
            contact: 'Sobre el hombro no dominante',
          },
          keyDifferences: ['Muy dificil', 'Usado como emergencia', 'Menos potencia'],
        },
      ],
    },
    {
      slug: 'dropshot',
      name: 'Dejada',
      description: 'Golpe suave con backspin que cae cerca de la red, requiere toque fino',
      difficulty: 4,
      correctForm: {
        disguise: 'Preparacion identica al groundstroke normal',
        grip: 'Continental para mejor control del slice',
        contact: 'Cara de raqueta abierta, toque suave debajo de la pelota',
        followThrough: 'Minimo, la raqueta "acaricia" la pelota',
        timing: 'Ejecutar cuando el oponente esta atras de la linea de fondo',
      },
      commonErrors: [
        'Preparacion diferente que delata la intencion',
        'Golpear con demasiada fuerza, la pelota pasa la linea de servicio',
        'No abrir suficiente la cara de la raqueta',
        'Intentar la dejada desde una posicion defensiva',
        'Follow-through excesivo que elimina el efecto de backspin',
      ],
      keyPoints: [
        'Disfrazar la preparacion como groundstroke',
        'Cara de raqueta abierta en el contacto',
        'Toque suave, dejar que la raqueta absorba',
        'Usar cuando el oponente esta lejos de la red',
        'Agregar backspin para que la pelota no avance tras botar',
      ],
      variants: [
        {
          slug: 'forehand-dropshot',
          name: 'Dejada de Derecha',
          description: 'Dejada ejecutada del lado dominante',
          correctForm: {
            grip: 'Continental o Eastern',
            disguise: 'Preparacion de derecha normal',
          },
          keyDifferences: ['Mas natural de disfrazar', 'Mayor variedad de angulos'],
        },
        {
          slug: 'backhand-dropshot',
          name: 'Dejada de Reves',
          description: 'Dejada ejecutada del lado no dominante, ideal con slice',
          correctForm: {
            grip: 'Continental',
            disguise: 'Preparacion de slice de reves',
          },
          keyDifferences: ['Se integra bien con slice', 'Mas dificil de leer para el oponente'],
        },
      ],
    },
    {
      slug: 'lob',
      name: 'Globo',
      description: 'Golpe alto por encima del oponente en la red, defensivo u ofensivo',
      difficulty: 3,
      correctForm: {
        preparation: 'Preparacion similar al groundstroke para disfrazar',
        contact: 'Debajo de la pelota con cara abierta',
        trajectory: 'Arco alto que pase sobre el alcance del oponente',
        depth: 'Caer cerca de la linea de fondo para dificultar el remate',
        followThrough: 'Hacia arriba y adelante siguiendo la trayectoria',
      },
      commonErrors: [
        'Globo demasiado corto que permite remate facil',
        'No abrir suficiente la cara de la raqueta',
        'Preparacion diferente que delata la intencion',
        'Golpe demasiado fuerte que sale largo',
        'No considerar el viento o las condiciones',
      ],
      keyPoints: [
        'Profundidad es clave — cerca de la linea de fondo',
        'Disfrazar la preparacion',
        'Abrir la cara de la raqueta para elevar',
        'Usar cuando el oponente esta pegado a la red',
        'Altura suficiente para que no alcance con smash',
      ],
      variants: [
        {
          slug: 'topspin-lob',
          name: 'Globo con Topspin',
          description: 'Globo ofensivo con efecto liftado que cae rapido',
          correctForm: {
            swing: 'De abajo hacia arriba con cepillado',
            spin: 'Topspin pronunciado para caida rapida',
          },
          keyDifferences: ['Cae mas rapido en la cancha', 'Mas agresivo', 'Requiere mas tecnica'],
        },
        {
          slug: 'defensive-lob',
          name: 'Globo Defensivo',
          description: 'Globo alto para ganar tiempo y reposicionarse',
          correctForm: {
            height: 'Muy alto para maximo tiempo',
            depth: 'Profundo para empujar al oponente atras',
          },
          keyDifferences: ['Prioridad: ganar tiempo', 'Muy alto', 'Desde posicion de emergencia'],
        },
        {
          slug: 'offensive-lob',
          name: 'Globo Ofensivo',
          description: 'Globo como arma para ganar el punto directamente',
          correctForm: {
            disguise: 'Identico a un passing shot hasta el ultimo momento',
            placement: 'Justo sobre el alcance del oponente',
          },
          keyDifferences: ['Disfrazado como passing', 'Menos alto, mas rapido', 'Busca winner'],
        },
      ],
    },
    {
      slug: 'halfvolley',
      name: 'Media Volea',
      description: 'Golpe inmediatamente despues del bote, a ras del suelo, requiere timing excepcional',
      difficulty: 5,
      correctForm: {
        positioning: 'Rodillas muy flexionadas, centro de gravedad bajo',
        grip: 'Continental para versatilidad',
        contact: 'Justo despues del bote, raqueta casi toca el suelo',
        racketFace: 'Cara ligeramente abierta para elevar sobre la red',
        followThrough: 'Corto y controlado hacia el objetivo',
      },
      commonErrors: [
        'No bajar suficiente las rodillas',
        'Intentar hacer un swing completo en vez de bloquear',
        'Timing incorrecto — golpear en el bote o demasiado tarde',
        'Muñeca floja que no controla la direccion',
        'No mantener la cabeza de la raqueta firme',
      ],
      keyPoints: [
        'Rodillas muy flexionadas, bajar al nivel de la pelota',
        'Movimiento de bloqueo, no swing completo',
        'Timing preciso: justo despues del bote',
        'Cara de raqueta ligeramente abierta',
        'Mantener raqueta firme con grip Continental',
      ],
      variants: [
        {
          slug: 'forehand-halfvolley',
          name: 'Media Volea de Derecha',
          description: 'Media volea del lado dominante',
          correctForm: {
            grip: 'Continental o Eastern',
            stance: 'Paso adelante con pie contrario',
          },
          keyDifferences: ['Mas natural', 'Mejor control de angulo'],
        },
        {
          slug: 'backhand-halfvolley',
          name: 'Media Volea de Reves',
          description: 'Media volea del lado no dominante',
          correctForm: {
            grip: 'Continental',
            stance: 'Paso adelante con pie del lado dominante',
          },
          keyDifferences: ['Mas dificil', 'Requiere mas fuerza de muñeca'],
        },
      ],
    },
    {
      slug: 'passing',
      name: 'Passing Shot',
      description: 'Golpe que pasa al oponente en la red, requiere precision bajo presion',
      difficulty: 4,
      correctForm: {
        reading: 'Leer la posicion del oponente en la red',
        preparation: 'Preparacion rapida y compacta',
        contact: 'Firme y dirigido al espacio abierto',
        trajectory: 'Baja sobre la red para dificultar la volea',
        variety: 'Alternar entre paralelo y cruzado',
      },
      commonErrors: [
        'Intentar golpear demasiado fuerte bajo presion',
        'Siempre ir al mismo lado (predecible)',
        'Trayectoria alta que facilita la volea',
        'No leer la posicion del oponente antes de golpear',
        'Preparacion tardia por presion del acercamiento',
      ],
      keyPoints: [
        'Leer la posicion del oponente antes de decidir direccion',
        'Trayectoria baja sobre la red',
        'Precision sobre potencia',
        'Variar entre paralelo y cruzado',
        'Considerar el globo como alternativa',
      ],
      variants: [
        {
          slug: 'down-the-line-passing',
          name: 'Passing Paralelo',
          description: 'Passing shot por la linea lateral',
          correctForm: {
            direction: 'Paralelo a la linea lateral',
            timing: 'Golpear cuando el oponente se mueve al centro',
          },
          keyDifferences: ['Menor margen de error', 'Mas sorpresivo', 'Requiere mejor timing'],
        },
        {
          slug: 'crosscourt-passing',
          name: 'Passing Cruzado',
          description: 'Passing shot en diagonal',
          correctForm: {
            direction: 'Cruzado con angulo',
            margin: 'Mayor margen sobre la red (parte mas baja)',
          },
          keyDifferences: ['Mayor margen', 'Mas distancia de cancha', 'Mas seguro'],
        },
        {
          slug: 'topspin-passing',
          name: 'Passing con Topspin',
          description: 'Passing con efecto liftado que baja rapido a los pies del oponente',
          correctForm: {
            spin: 'Topspin pronunciado',
            target: 'A los pies del oponente en la red',
          },
          keyDifferences: ['Cae a los pies', 'Dificil de volear', 'Mayor margen sobre la red'],
        },
      ],
    },
    {
      slug: 'footwork',
      name: 'Trabajo de Pies',
      description: 'Patrones de movimiento fundamentales para posicionarse correctamente',
      difficulty: 2,
      correctForm: {
        readyPosition: 'Rodillas flexionadas, peso en puntas de los pies, pies al ancho de hombros',
        splitStep: 'Pequeño salto de preparacion antes de cada golpe del oponente',
        lateralMovement: 'Pasos laterales rapidos manteniendo el equilibrio',
        recovery: 'Vuelta explosiva al centro despues de cada golpe',
        balance: 'Centro de gravedad bajo y estable durante todo el movimiento',
      },
      commonErrors: [
        'No hacer split step antes de cada golpe',
        'Cruzar los pies durante movimiento lateral',
        'No recuperar al centro despues del golpe',
        'Peso en los talones en vez de las puntas',
        'Posicion demasiado erguida sin flexion de rodillas',
        'Pasos demasiado grandes que desestabilizan',
      ],
      keyPoints: [
        'Split step en cada golpe del oponente',
        'Pasos pequenos y rapidos para ajustes finales',
        'Siempre recuperar al centro',
        'Centro de gravedad bajo',
        'Pies activos, nunca quietos',
        'Primer paso explosivo en la direccion correcta',
      ],
      variants: [
        {
          slug: 'split-step',
          name: 'Split Step',
          description: 'Salto de preparacion que permite reaccionar en cualquier direccion',
          correctForm: {
            timing: 'Justo cuando el oponente hace contacto',
            landing: 'Pies al ancho de hombros, rodillas flexionadas',
          },
          keyDifferences: ['Base de todo movimiento', 'Timing es clave'],
        },
        {
          slug: 'recovery-step',
          name: 'Paso de Recuperacion',
          description: 'Movimiento de vuelta al centro despues de cada golpe',
          correctForm: {
            direction: 'Hacia el centro de la linea de fondo',
            speed: 'Explosivo, no caminar',
          },
          keyDifferences: ['Velocidad de recuperacion define el nivel', 'Siempre al centro'],
        },
        {
          slug: 'crossover-step',
          name: 'Paso Cruzado',
          description: 'Paso donde un pie cruza sobre el otro para cubrir distancia',
          correctForm: {
            technique: 'Pie trasero cruza sobre el pie delantero',
            usage: 'Para cubrir distancias largas lateralmente',
          },
          keyDifferences: ['Cubre mas distancia', 'Mas rapido que shuffle lateral'],
        },
        {
          slug: 'lateral-shuffle',
          name: 'Desplazamiento Lateral',
          description: 'Movimiento lateral sin cruzar los pies',
          correctForm: {
            technique: 'Pasos laterales rapidos sin cruzar',
            usage: 'Para ajustes cortos y movimientos cercanos',
          },
          keyDifferences: ['Mayor equilibrio', 'Para distancias cortas', 'Mejor control'],
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

  // ============================================
  // PADEL SPORT + TECHNIQUES
  // ============================================

  const padel = await prisma.sport.upsert({
    where: { slug: 'padel' },
    update: { isActive: true },
    create: {
      slug: 'padel',
      name: 'Padel',
      description: 'Deporte de raqueta que se juega en parejas en una cancha cerrada con paredes de cristal',
      icon: 'padel',
      isActive: true,
      order: 2,
    },
  })
  console.log('Created sport:', padel.name)

  const padelTechniques = [
    {
      slug: 'bandeja',
      name: 'Bandeja',
      description: 'Golpe defensivo-ofensivo ejecutado por encima de la cabeza con efecto cortado',
      difficulty: 3,
      correctForm: {
        stance: 'De lado a la red, pie contrario adelante',
        grip: 'Continental',
        contact: 'Por encima y ligeramente adelante de la cabeza',
        followThrough: 'Corto, hacia abajo y al frente',
      },
      commonErrors: [
        'Golpear de frente en vez de de lado',
        'Contacto demasiado atras',
        'No cortar la pelota',
      ],
      keyPoints: [
        'Posicion lateral',
        'Grip Continental',
        'Efecto cortado',
        'No retroceder a la pared',
      ],
      variants: [
        {
          slug: 'bandeja-plana',
          name: 'Bandeja Plana',
          description: 'Bandeja con menos corte para mayor velocidad',
          correctForm: { contact: 'Mas plano, menos slice' },
          keyDifferences: ['Mas velocidad', 'Menos control'],
        },
      ],
    },
    {
      slug: 'vibora',
      name: 'Vibora',
      description: 'Golpe agresivo por encima de la cabeza con efecto lateral',
      difficulty: 4,
      correctForm: {
        stance: 'De lado, peso en pierna trasera',
        grip: 'Continental cerrado',
        contact: 'Lateral, cortando de lado',
        followThrough: 'Corto, hacia el lado contrario',
      },
      commonErrors: [
        'No generar efecto lateral suficiente',
        'Golpear demasiado fuerte sacrificando efecto',
      ],
      keyPoints: [
        'Efecto lateral pronunciado',
        'Salida de la pared impredecible',
        'Ideal para ganar la red',
      ],
      variants: [],
    },
    {
      slug: 'chiquita',
      name: 'Chiquita',
      description: 'Golpe suave y bajo que pasa la red con poca altura',
      difficulty: 2,
      correctForm: {
        grip: 'Continental',
        swing: 'Suave, de abajo hacia arriba',
        contact: 'Bajo, a la altura de las rodillas',
        target: 'A los pies de los rivales en la red',
      },
      commonErrors: [
        'Elevar demasiado la pelota',
        'No dirigir a los pies',
      ],
      keyPoints: [
        'Pelota baja sobre la red',
        'Dirigir a los pies',
        'Toque suave',
      ],
      variants: [],
    },
    {
      slug: 'globo-padel',
      name: 'Globo',
      description: 'Golpe alto que pasa por encima de los rivales en la red',
      difficulty: 2,
      correctForm: {
        preparation: 'Identica al golpe normal para disfrazar',
        contact: 'Cara abierta, cepillado ascendente',
        trajectory: 'Alto y profundo al fondo de la pista',
      },
      commonErrors: [
        'Globo corto que permite smash',
        'No disfrazar la intencion',
      ],
      keyPoints: [
        'Profundidad es clave',
        'Disfrazar como golpe normal',
        'Con topspin para que caiga rapido',
      ],
      variants: [
        {
          slug: 'globo-topspin',
          name: 'Globo con Topspin',
          description: 'Globo con efecto liftado que cae rapido',
          correctForm: { spin: 'Cepillado ascendente pronunciado' },
          keyDifferences: ['Cae mas rapido', 'Mas dificil de rematar'],
        },
      ],
    },
    {
      slug: 'pared-padel',
      name: 'Juego de Pared',
      description: 'Golpes que utilizan las paredes de cristal como parte del juego',
      difficulty: 3,
      correctForm: {
        reading: 'Leer el angulo de rebote de la pared',
        positioning: 'Esperar detras del punto de rebote',
        timing: 'Golpear despues del rebote de la pared',
      },
      commonErrors: [
        'Posicionarse demasiado cerca de la pared',
        'No leer el angulo de rebote',
      ],
      keyPoints: [
        'Paciencia para esperar el rebote',
        'Leer angulos de pared lateral y fondo',
        'Posicionarse detras del rebote',
      ],
      variants: [
        {
          slug: 'pared-fondo',
          name: 'Pared de Fondo',
          description: 'Rebote en la pared trasera',
          correctForm: { positioning: 'Esperar a que la pelota pase y rebote' },
          keyDifferences: ['Rebote mas predecible', 'Mas tiempo de reaccion'],
        },
        {
          slug: 'pared-lateral',
          name: 'Pared Lateral',
          description: 'Rebote en la pared del costado',
          correctForm: { positioning: 'Moverse lateralmente con la pelota' },
          keyDifferences: ['Angulo mas cerrado', 'Requiere ajuste rapido'],
        },
      ],
    },
  ]

  for (const tech of padelTechniques) {
    const technique = await prisma.technique.upsert({
      where: { sportId_slug: { sportId: padel.id, slug: tech.slug } },
      update: {
        name: tech.name,
        description: tech.description,
        difficulty: tech.difficulty,
        correctForm: tech.correctForm,
        commonErrors: tech.commonErrors,
        keyPoints: tech.keyPoints,
      },
      create: {
        sportId: padel.id,
        slug: tech.slug,
        name: tech.name,
        description: tech.description,
        difficulty: tech.difficulty,
        correctForm: tech.correctForm,
        commonErrors: tech.commonErrors,
        keyPoints: tech.keyPoints,
      },
    })

    for (const variant of tech.variants) {
      await prisma.variant.upsert({
        where: { techniqueId_slug: { techniqueId: technique.id, slug: variant.slug } },
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
  console.log('Created padel techniques')

  // Placeholder sports
  const futureSports = [
    { slug: 'pickleball', name: 'Pickleball', icon: 'pickleball', order: 3 },
    { slug: 'golf', name: 'Golf', icon: 'golf', order: 4 },
    { slug: 'basketball', name: 'Basketball', icon: 'basketball', order: 5 },
    { slug: 'soccer', name: 'Futbol', icon: 'soccer', order: 6 },
  ]

  for (const sport of futureSports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {},
      create: { ...sport, isActive: false, description: 'Proximamente' },
    })
  }
  console.log('Created placeholder sports')

  // ============================================
  // USER-SPORT ASSOCIATIONS
  // ============================================

  // Link players to their sports
  const userSportPairs = [
    { userId: testUser.id, sportId: tennis.id },
    { userId: proPlayer.id, sportId: tennis.id },
    { userId: elitePlayer.id, sportId: tennis.id },
    { userId: padelPlayer.id, sportId: padel.id },
    { userId: adminUser.id, sportId: tennis.id },
    { userId: adminUser.id, sportId: padel.id },
  ]

  for (const us of userSportPairs) {
    await prisma.userSport.upsert({
      where: { userId_sportId: { userId: us.userId, sportId: us.sportId } },
      update: {},
      create: us,
    })
  }
  console.log('Created user-sport associations')

  // ============================================
  // GAMIFICATION (streaks, badges)
  // ============================================

  // Get player profiles for relations
  const profiles = await prisma.playerProfile.findMany({
    select: { id: true, userId: true },
  })
  const profileByUser = Object.fromEntries(profiles.map(p => [p.userId, p.id]))

  // Streaks
  const streakData = [
    { userId: testUser.id, currentStreak: 3, longestStreak: 7, lastActivityAt: new Date() },
    { userId: proPlayer.id, currentStreak: 12, longestStreak: 30, lastActivityAt: new Date() },
    { userId: elitePlayer.id, currentStreak: 45, longestStreak: 45, lastActivityAt: new Date() },
    { userId: adminUser.id, currentStreak: 5, longestStreak: 15, lastActivityAt: new Date() },
  ]

  for (const s of streakData) {
    await prisma.userStreak.upsert({
      where: { userId: s.userId },
      update: {},
      create: s,
    })
  }
  console.log('Created streaks')

  // Badges
  const badgeData: { userId: string; badgeType: import('@prisma/client').BadgeType }[] = [
    { userId: testUser.id, badgeType: 'FIRST_ANALYSIS' },
    { userId: proPlayer.id, badgeType: 'FIRST_ANALYSIS' },
    { userId: proPlayer.id, badgeType: 'STREAK_7' },
    { userId: proPlayer.id, badgeType: 'FIRST_MATCH' },
    { userId: proPlayer.id, badgeType: 'TIER_PLATA' },
    { userId: elitePlayer.id, badgeType: 'FIRST_ANALYSIS' },
    { userId: elitePlayer.id, badgeType: 'STREAK_7' },
    { userId: elitePlayer.id, badgeType: 'STREAK_30' },
    { userId: elitePlayer.id, badgeType: 'FIRST_MATCH' },
    { userId: elitePlayer.id, badgeType: 'TEN_MATCHES' },
    { userId: elitePlayer.id, badgeType: 'TIER_BRONCE' },
    { userId: elitePlayer.id, badgeType: 'TIER_PLATA' },
    { userId: elitePlayer.id, badgeType: 'TIER_ORO' },
    { userId: elitePlayer.id, badgeType: 'DEDICATION_30' },
    { userId: adminUser.id, badgeType: 'FIRST_ANALYSIS' },
    { userId: adminUser.id, badgeType: 'TIER_DIAMANTE' },
  ]

  for (const b of badgeData) {
    await prisma.userBadge.upsert({
      where: { userId_badgeType: { userId: b.userId, badgeType: b.badgeType } },
      update: {},
      create: b,
    })
  }
  console.log('Created badges')

  // ============================================
  // SOCIAL (follows, feed, clubs)
  // ============================================

  // Follows
  const followPairs = [
    { followerId: profileByUser[proPlayer.id], followingId: profileByUser[elitePlayer.id] },
    { followerId: profileByUser[proPlayer.id], followingId: profileByUser[testUser.id] },
    { followerId: profileByUser[elitePlayer.id], followingId: profileByUser[proPlayer.id] },
    { followerId: profileByUser[testUser.id], followingId: profileByUser[elitePlayer.id] },
    { followerId: profileByUser[padelPlayer.id], followingId: profileByUser[elitePlayer.id] },
  ]

  for (const f of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: f.followerId, followingId: f.followingId } },
      update: {},
      create: f,
    })
  }
  console.log('Created follows')

  // Club
  const club = await prisma.club.upsert({
    where: { slug: 'lima-tennis-club' },
    update: {},
    create: {
      name: 'Lima Tennis Club',
      slug: 'lima-tennis-club',
      description: 'Club de tenis para jugadores competitivos en Lima',
      country: 'PE',
      city: 'Lima',
      ownerId: profileByUser[elitePlayer.id],
      isPublic: true,
      maxMembers: 50,
    },
  })

  // Add club members
  const clubMembers = [profileByUser[elitePlayer.id], profileByUser[proPlayer.id], profileByUser[testUser.id]]
  for (const profileId of clubMembers) {
    await prisma.clubMember.upsert({
      where: { clubId_profileId: { clubId: club.id, profileId } },
      update: {},
      create: {
        clubId: club.id,
        profileId,
        role: profileId === profileByUser[elitePlayer.id] ? 'admin' : 'member',
      },
    })
  }
  console.log('Created club:', club.name)

  // Feed items
  const feedItems = [
    {
      profileId: profileByUser[elitePlayer.id],
      type: 'TIER_PROMOTION' as const,
      title: 'Ascendio a ORO',
      description: 'Maria Fernandez alcanzo el tier Oro en Tenis',
    },
    {
      profileId: profileByUser[proPlayer.id],
      type: 'STREAK_MILESTONE' as const,
      title: 'Racha de 7 dias',
      description: 'Carlos Mendoza lleva 7 dias consecutivos de entrenamiento',
    },
    {
      profileId: profileByUser[testUser.id],
      type: 'ANALYSIS_COMPLETED' as const,
      title: 'Analisis completado',
      description: 'TestPlayer completo un analisis de Saque',
    },
  ]

  for (const fi of feedItems) {
    await prisma.feedItem.create({ data: fi })
  }
  console.log('Created feed items')

  // ============================================
  // COACH-STUDENT RELATIONSHIPS
  // ============================================

  const coachProfile = await prisma.coachProfile.findUnique({
    where: { userId: testCoach.id },
  })

  if (coachProfile) {
    const coachStudentPairs = [
      { coachId: coachProfile.id, studentId: profileByUser[proPlayer.id], status: 'ACTIVE' as const, canViewAnalyses: true, canAssignPlans: true, startedAt: new Date() },
      { coachId: coachProfile.id, studentId: profileByUser[testUser.id], status: 'PENDING_INVITE' as const, canViewAnalyses: true, canAssignPlans: false },
    ]

    for (const cs of coachStudentPairs) {
      await prisma.coachStudent.upsert({
        where: { coachId_studentId: { coachId: cs.coachId, studentId: cs.studentId } },
        update: {},
        create: cs,
      })
    }
    console.log('Created coach-student relationships')
  }

  // ============================================
  // PRODUCTS (SHOP)
  // ============================================

  const products = [
    {
      slug: 'babolat-pure-aero',
      name: 'Babolat Pure Aero 2024',
      description: 'La raqueta preferida de Rafael Nadal. Potencia y spin para jugadores agresivos de fondo.',
      shortDesc: 'Raqueta de potencia con spin',
      category: 'RACKETS' as const,
      brand: 'Babolat',
      model: 'Pure Aero',
      priceCents: 89990,
      comparePriceCents: 99990,
      stock: 15,
      sku: 'BAB-PA-2024',
      attributes: { weight: 300, headSize: 100, stringPattern: '16x19', balance: 320, length: 685 },
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'wilson-blade-v9',
      name: 'Wilson Blade 98 V9',
      description: 'Control y precision para jugadores avanzados. Tecnologia Countervail para absorcion de vibraciones.',
      shortDesc: 'Raqueta de control para avanzados',
      category: 'RACKETS' as const,
      brand: 'Wilson',
      model: 'Blade 98 V9',
      priceCents: 84990,
      stock: 8,
      sku: 'WIL-BL98-V9',
      attributes: { weight: 305, headSize: 98, stringPattern: '18x20', balance: 315, length: 685 },
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'head-extreme-team',
      name: 'Head Extreme Team 2024',
      description: 'Raqueta versatil para jugadores intermedios. Spin y potencia equilibrados.',
      shortDesc: 'Raqueta versatil para intermedios',
      category: 'RACKETS' as const,
      brand: 'Head',
      model: 'Extreme Team',
      priceCents: 54990,
      stock: 20,
      sku: 'HEAD-EXT-2024',
      attributes: { weight: 275, headSize: 100, stringPattern: '16x19', balance: 325, length: 685 },
      isActive: true,
      isFeatured: false,
    },
    {
      slug: 'luxilon-alu-power-125',
      name: 'Luxilon ALU Power 125',
      description: 'Cuerda de poliester de referencia mundial. Control y durabilidad excepcional.',
      shortDesc: 'Cuerda de referencia para control',
      category: 'STRINGS' as const,
      brand: 'Luxilon',
      model: 'ALU Power',
      priceCents: 6990,
      stock: 50,
      sku: 'LUX-ALUP-125',
      attributes: { gauge: '1.25mm', material: 'Co-Polyester', length: '12.2m' },
      isActive: true,
      isFeatured: true,
    },
    {
      slug: 'yonex-poly-tour-pro',
      name: 'Yonex Poly Tour Pro 125',
      description: 'Cuerda de poliester suave con excelente sensacion y spin.',
      shortDesc: 'Cuerda suave con buen spin',
      category: 'STRINGS' as const,
      brand: 'Yonex',
      model: 'Poly Tour Pro',
      priceCents: 5490,
      stock: 35,
      sku: 'YNX-PTP-125',
      attributes: { gauge: '1.25mm', material: 'Polyester', length: '12m' },
      isActive: true,
      isFeatured: false,
    },
    {
      slug: 'wilson-pro-overgrip-3pk',
      name: 'Wilson Pro Overgrip 3-Pack',
      description: 'El overgrip mas popular del mundo. Suave, absorbente y adhesivo.',
      shortDesc: 'Pack de 3 overgrips',
      category: 'GRIPS' as const,
      brand: 'Wilson',
      model: 'Pro Overgrip',
      priceCents: 1990,
      stock: 100,
      sku: 'WIL-POG-3PK',
      attributes: { quantity: 3, thickness: '0.6mm', color: 'Blanco' },
      isActive: true,
      isFeatured: false,
    },
    {
      slug: 'babolat-pure-drive-bag',
      name: 'Babolat Pure Drive Racket Holder x6',
      description: 'Bolso termico para 6 raquetas con compartimento para zapatos.',
      shortDesc: 'Bolso para 6 raquetas',
      category: 'BAGS' as const,
      brand: 'Babolat',
      model: 'Pure Drive Bag',
      priceCents: 29990,
      stock: 10,
      sku: 'BAB-PDB-6',
      attributes: { capacity: '6 rackets', thermoGuard: true },
      isActive: true,
      isFeatured: false,
    },
    {
      slug: 'asics-gel-resolution-9',
      name: 'Asics Gel Resolution 9',
      description: 'Zapatilla de tenis de alto rendimiento. Estabilidad y durabilidad en todas las superficies.',
      shortDesc: 'Zapatilla de alto rendimiento',
      category: 'SHOES' as const,
      brand: 'Asics',
      model: 'Gel Resolution 9',
      priceCents: 59990,
      stock: 12,
      sku: 'ASI-GR9-BK',
      attributes: { sizes: ['7', '8', '9', '10', '11'], surface: 'All Court' },
      isActive: true,
      isFeatured: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }
  console.log('Created products:', products.length)

  // ============================================
  // COURTS
  // ============================================

  const courts = [
    {
      name: 'Club Tennis Las Terrazas',
      description: 'Club con 8 canchas de arcilla y 2 de dura. Zona de descanso y cafeteria.',
      address: 'Av. del Golf 555',
      district: 'San Isidro',
      city: 'Lima',
      country: 'PE',
      phone: '+51 1 421-5678',
      whatsapp: '+51 999 888 777',
      surface: 'CLAY' as const,
      courtType: 'OUTDOOR' as const,
      hourlyRate: 60,
      amenities: ['Vestuarios', 'Duchas', 'Cafeteria', 'Estacionamiento', 'Iluminacion nocturna'],
      isActive: true,
    },
    {
      name: 'Padel Lima Center',
      description: 'Centro de padel con 6 canchas cubiertas de cristal. Tienda y academia.',
      address: 'Calle Los Pinos 123',
      district: 'La Molina',
      city: 'Lima',
      country: 'PE',
      phone: '+51 1 365-4321',
      whatsapp: '+51 988 777 666',
      surface: 'SYNTHETIC' as const,
      courtType: 'COVERED' as const,
      hourlyRate: 80,
      amenities: ['Vestuarios', 'Tienda', 'Academia', 'Estacionamiento'],
      isActive: true,
    },
    {
      name: 'Sport Center Miraflores',
      description: 'Cancha de tenis dura con iluminacion LED. Ideal para partidos nocturnos.',
      address: 'Av. Benavides 1234',
      district: 'Miraflores',
      city: 'Lima',
      country: 'PE',
      phone: '+51 1 445-9876',
      surface: 'HARD' as const,
      courtType: 'OUTDOOR' as const,
      hourlyRate: 45,
      amenities: ['Iluminacion LED', 'Estacionamiento'],
      isActive: true,
    },
    {
      name: 'Tennis Indoor Surco',
      description: 'Cancha techada para jugar sin importar el clima. Superficie sintetica de alta calidad.',
      address: 'Av. Primavera 789',
      district: 'Surco',
      city: 'Lima',
      country: 'PE',
      surface: 'SYNTHETIC' as const,
      courtType: 'INDOOR' as const,
      hourlyRate: 90,
      amenities: ['Aire acondicionado', 'Vestuarios', 'Agua gratis'],
      isActive: true,
    },
  ]

  for (const court of courts) {
    // Use findFirst + create since Court has no unique slug
    const existing = await prisma.court.findFirst({ where: { name: court.name } })
    if (!existing) {
      await prisma.court.create({ data: court })
    }
  }
  console.log('Created courts:', courts.length)

  // ============================================
  // WORKSHOPS (STRINGING)
  // ============================================

  const workshops = [
    {
      name: 'SportTech Workshop Central',
      address: 'Jr. de la Union 456',
      district: 'Cercado de Lima',
      city: 'Lima',
      phone: '+51 1 332-4567',
      isActive: true,
      isPartner: false,
      operatingHours: {
        mon: '9:00-18:00', tue: '9:00-18:00', wed: '9:00-18:00',
        thu: '9:00-18:00', fri: '9:00-18:00', sat: '9:00-13:00',
      },
    },
    {
      name: 'Encordados Pro - Miraflores',
      address: 'Calle Schell 234',
      district: 'Miraflores',
      city: 'Lima',
      phone: '+51 1 445-0011',
      isActive: true,
      isPartner: true,
      operatingHours: {
        mon: '10:00-19:00', tue: '10:00-19:00', wed: '10:00-19:00',
        thu: '10:00-19:00', fri: '10:00-19:00', sat: '10:00-14:00',
      },
    },
  ]

  for (const ws of workshops) {
    const existing = await prisma.workshop.findFirst({ where: { name: ws.name } })
    if (!existing) {
      await prisma.workshop.create({ data: ws })
    }
  }
  console.log('Created workshops:', workshops.length)

  // ============================================
  // TOURNAMENT
  // ============================================

  const tournament = await prisma.tournament.upsert({
    where: { slug: 'torneo-lima-open-2026' },
    update: {},
    create: {
      name: 'Lima Open 2026',
      slug: 'torneo-lima-open-2026',
      description: 'Torneo abierto de tenis para jugadores de nivel Plata en adelante. 16 participantes.',
      organizerId: profileByUser[elitePlayer.id],
      clubId: club.id,
      format: 'SINGLE_ELIMINATION',
      maxPlayers: 16,
      status: 'REGISTRATION',
      minTier: 'PLATA',
      country: 'PE',
      registrationEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      venue: 'Club Tennis Las Terrazas',
      city: 'Lima',
    },
  })

  // Register participants
  const participants = [profileByUser[elitePlayer.id], profileByUser[proPlayer.id]]
  for (const profileId of participants) {
    await prisma.tournamentParticipant.upsert({
      where: { tournamentId_profileId: { tournamentId: tournament.id, profileId } },
      update: {},
      create: { tournamentId: tournament.id, profileId },
    })
  }
  console.log('Created tournament:', tournament.name)

  // ============================================
  // NOTIFICATIONS
  // ============================================

  const notifications = [
    { userId: proPlayer.id, type: 'BADGE_EARNED' as const, title: 'Nuevo badge!', body: 'Has ganado el badge Racha de 7 dias' },
    { userId: proPlayer.id, type: 'COACH_INVITATION' as const, title: 'Invitacion de coach', body: 'Test Coach te ha invitado a ser su alumno' },
    { userId: elitePlayer.id, type: 'TIER_PROMOTION' as const, title: 'Ascenso de tier!', body: 'Has subido al tier ORO' },
    { userId: elitePlayer.id, type: 'NEW_FOLLOWER' as const, title: 'Nuevo seguidor', body: 'Carlos Mendoza te sigue ahora' },
    { userId: testUser.id, type: 'CHALLENGE_RECEIVED' as const, title: 'Nuevo desafio', body: 'Carlos Mendoza te ha desafiado a un partido' },
  ]

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif })
  }
  console.log('Created notifications:', notifications.length)

  // ============================================
  // DONE
  // ============================================

  console.log('')
  console.log('=== Seeding complete! ===')
  console.log('')
  console.log('Test credentials (password: test1234):')
  console.log('  Admin:          admin@sporttech.pe')
  console.log('  Player FREE:    test@sporttech.pe')
  console.log('  Player PRO:     pro@sporttech.pe')
  console.log('  Player ELITE:   elite@sporttech.pe')
  console.log('  Player Padel:   padel@sporttech.pe')
  console.log('  New User:       nuevo@sporttech.pe')
  console.log('  Coach Verified: coach@sporttech.pe')
  console.log('  Coach Pending:  coach2@sporttech.pe')
  console.log('  Coach Rejected: coach3@sporttech.pe')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
