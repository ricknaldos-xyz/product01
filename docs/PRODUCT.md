# SportTek — Documentación Completa de Producto

> Plataforma de análisis deportivo con inteligencia artificial

---

## Tabla de Contenidos

### 🎯 Producto
1. [Visión y Misión](#1-visión-y-misión)
2. [El Problema](#2-el-problema)
3. [Nuestra Solución](#3-nuestra-solución)
4. [Propuesta de Valor](#4-propuesta-de-valor)
5. [Público Objetivo](#5-público-objetivo)
6. [Funcionalidades](#6-funcionalidades)
7. [Flujos de Usuario](#7-flujos-de-usuario)
8. [Modelo de Suscripción y Precios](#8-modelo-de-suscripción-y-precios)

### ⚙️ Técnico
9. [Arquitectura del Sistema](#9-arquitectura-del-sistema)
10. [Stack Tecnológico](#10-stack-tecnológico)
11. [Base de Datos](#11-base-de-datos)
12. [API Reference](#12-api-reference)
13. [Sistema de Diseño — Liquid Glass](#13-sistema-de-diseño--liquid-glass)
14. [Integraciones](#14-integraciones)
15. [Seguridad](#15-seguridad)
16. [PWA y Performance](#16-pwa-y-performance)

### 💼 Negocio
17. [Business Model Canvas](#17-business-model-canvas)
18. [Modelo de Ingresos](#18-modelo-de-ingresos)
19. [Go-to-Market Strategy](#19-go-to-market-strategy)
20. [Análisis Competitivo](#20-análisis-competitivo)
21. [Métricas Clave (KPIs)](#21-métricas-clave-kpis)
22. [Roadmap](#22-roadmap)

---

# 🎯 PRODUCTO

---

## 1. Visión y Misión

### Visión
Ser la plataforma líder en Latinoamérica para el desarrollo deportivo impulsado por inteligencia artificial, democratizando el acceso a análisis técnico profesional para jugadores de todos los niveles.

### Misión
Empoderar a deportistas amateur y semi-profesionales con herramientas de análisis de video con IA, planes de entrenamiento personalizados, y una comunidad competitiva — todo lo que antes solo estaba disponible para atletas de élite con entrenadores privados.

### Valores del Producto
- **Accesibilidad**: Herramientas profesionales al alcance de todos, desde plan gratuito
- **Inteligencia**: IA como motor central de análisis y recomendaciones
- **Comunidad**: Competencia sana y crecimiento colectivo
- **Progresión**: Cada interacción contribuye al desarrollo del jugador
- **Multi-deporte**: Una plataforma, múltiples deportes

---

## 2. El Problema

### Contexto del mercado
El mercado de deportes de raqueta en Latinoamérica está creciendo aceleradamente. Solo en Perú, el tenis y el pádel han visto un aumento significativo de canchas y practicantes en los últimos 5 años. Sin embargo, la mayoría de jugadores enfrenta barreras críticas:

### Problemas identificados

| Problema | Impacto | Afectados |
|----------|---------|-----------|
| **Sin acceso a análisis técnico** | Jugadores no saben qué corregir | 90% de amateur |
| **Entrenadores caros e inaccesibles** | 1 hora de clase = S/80-200 | Clase media/baja |
| **Sin métricas de progreso** | No saben si están mejorando | Todos los niveles |
| **Comunidad fragmentada** | Difícil encontrar rivales del mismo nivel | Jugadores independientes |
| **Información dispersa** | YouTube, libros, foros — sin personalización | Autodidactas |
| **Equipamiento sin guía** | No saben qué raqueta/cuerda elegir | Principiantes |

### El dolor principal
> "Quiero mejorar mi tenis pero no tengo un coach que me diga qué estoy haciendo mal, no tengo con quién jugar de mi nivel, y no sé si estoy progresando."

---

## 3. Nuestra Solución

SportTek es una plataforma integral que combina:

```
┌─────────────────────────────────────────────────┐
│                  SPORTTECH                       │
│                                                  │
│  📹 Análisis con IA    🏋️ Planes de Entrenamiento │
│  Sube tu video →       IA genera plan de 4+      │
│  Gemini analiza →      semanas basado en tus     │
│  Score + Issues →      problemas detectados      │
│  Correcciones          Ejercicios + Videos        │
│                                                  │
│  🏆 Competencia        👥 Comunidad               │
│  Rankings por tier     Feed social               │
│  Matchmaking ELO       Clubes                    │
│  Desafíos 1v1          Seguir jugadores          │
│  Torneos               Comentarios               │
│                                                  │
│  🎓 Marketplace        🛍️ E-Commerce              │
│  Encuentra coaches     Tienda de equipamiento    │
│  Verificados           Servicio de encordado     │
│  Reviews reales        Reserva de canchas        │
│                                                  │
│  🎯 Gamificación       📊 Progresión              │
│  Streaks diarios       Scores por técnica        │
│  24 tipos de badges    Tiers: Bronce→Diamante    │
│  XP y actividad        Comparación temporal      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Diferenciador clave
No somos una app de tracking ni una red social deportiva. Somos el **coach virtual con IA** que analiza tu técnica real, te dice exactamente qué corregir, te genera un plan personalizado, y te conecta con rivales de tu nivel.

---

## 4. Propuesta de Valor

### Para Jugadores (User)
- **Análisis profesional instantáneo**: Sube un video de 30 segundos, recibe análisis detallado con score, problemas detectados y correcciones específicas
- **Planes de entrenamiento personalizados**: Generados por IA basados en tus debilidades reales
- **Progresión medible**: Score numérico por técnica, tiers de habilidad, rankings
- **Comunidad competitiva**: Encuentra rivales de tu nivel, participa en torneos, sube en el ranking

### Para Coaches
- **Herramienta de gestión**: Administra alumnos, asigna planes, monitorea progreso
- **Marketplace**: Visibilidad ante miles de jugadores buscando coach
- **IA como asistente**: La IA hace el análisis técnico; el coach aporta la estrategia y motivación

### Para Administradores
- **Gestión integral**: Canchas, tienda, encordado, documentos de conocimiento
- **Analytics**: Métricas de uso, ventas, inventario
- **Knowledge Base**: Sube documentos PDF que alimentan la IA con conocimiento especializado (RAG)

---

## 5. Público Objetivo

### Persona 1: El Jugador Amateur Comprometido
- **Nombre**: Carlos, 28 años, Lima
- **Perfil**: Juega tenis 2-3 veces por semana, nivel intermedio
- **Dolor**: Siente que llegó a un techo técnico, no puede pagar un coach fijo
- **Motivación**: Quiere mejorar su revés y subir en rankings locales
- **Uso**: Sube videos semanales, sigue su plan de entrenamiento, juega partidos por matchmaking
- **Plan**: Pro (S/24.90/mes)

### Persona 2: El Principiante Entusiasta
- **Nombre**: María, 35 años, Arequipa
- **Perfil**: Empezó tenis hace 6 meses, juega 1 vez por semana
- **Dolor**: No sabe si su grip es correcto, no tiene referencia técnica
- **Motivación**: Quiere aprender correctamente desde el inicio
- **Uso**: Análisis ocasionales, ejercicios básicos, busca canchas cercanas
- **Plan**: Free (5 análisis/mes)

### Persona 3: El Coach Independiente
- **Nombre**: Roberto, 45 años, Lima
- **Perfil**: 15 años de experiencia, 8-10 alumnos activos
- **Dolor**: Difícil captar nuevos alumnos, no tiene herramienta de seguimiento digital
- **Motivación**: Escalar su negocio de coaching, diferenciarse con tecnología
- **Uso**: Marketplace para captación, dashboard de alumnos, asignación de planes
- **Plan**: Pro o Elite

### Persona 4: El Competidor Social
- **Nombre**: Diego, 22 años, Lima
- **Perfil**: Jugador universitario, nivel avanzado
- **Dolor**: No encuentra rivales de su nivel fuera de su club
- **Motivación**: Competir, subir en rankings, ganar torneos
- **Uso**: Matchmaking activo, torneos semanales, desafíos
- **Plan**: Pro (S/24.90/mes)

---

## 6. Funcionalidades

### 6.1 Análisis con IA

| Feature | Descripción | Tier |
|---------|-------------|------|
| Upload de video/imagen | Videos hasta 100MB, imágenes hasta 10MB | Todos |
| Detección automática de técnica | IA identifica qué técnica se ejecuta | Todos |
| Selección manual de técnica | Elegir deporte → técnica → variante | Todos |
| Análisis con Gemini 2.5 Flash | Score 0-10, issues por severidad, correcciones | Todos |
| Comparación de progreso | Compara con análisis anterior de la misma técnica | Pro+ |
| Verificación de autenticidad | Sistema de peer-review para validar videos | Todos |
| Retry de análisis fallidos | Reintentar procesamiento si falla | Todos |
| Límite mensual | 3/mes (Free), ilimitado (Pro/Elite) | Variable |

**Severidad de Issues detectados:**
- `LOW`: Detalle menor, no afecta el juego significativamente
- `MEDIUM`: Área de mejora que impacta consistencia
- `HIGH`: Problema técnico que limita el rendimiento
- `CRITICAL`: Error fundamental que puede causar lesión

### 6.2 Planes de Entrenamiento

| Feature | Descripción | Tier |
|---------|-------------|------|
| Generación automática | IA crea plan de 4+ semanas desde análisis | Todos |
| Ejercicios estructurados | Nombre, instrucciones, sets, reps, duración | Todos |
| Videos demostrativos | YouTube embebido para cada ejercicio | Pro+ |
| Progresión diaria | Día a día con dificultad incremental (15%/semana) | Todos |
| Tracking de completado | Registrar ejercicios hechos, feedback de dificultad | Todos |
| RAG-augmented | Conocimiento de PDFs subidos enriquece los planes | Pro+ |
| Límite de planes activos | 1 (Free), ilimitado (Pro/Elite) | Variable |

### 6.3 Gamificación

**Streaks:**
- Racha de días consecutivos activos (análisis o ejercicio)
- Racha más larga almacenada
- 1 freeze disponible para no perder la racha
- Alerta por email cuando la racha está en riesgo

**24 Tipos de Badges:**

| Categoría | Badges |
|-----------|--------|
| Análisis | FIRST_ANALYSIS, IMPROVEMENT |
| Entrenamiento | WEEK_PERFECT, PLAN_COMPLETED, DEDICATION_30 |
| Streaks | STREAK_7, STREAK_30, STREAK_100 |
| Competencia | FIRST_CHALLENGE, FIRST_MATCH, TEN_MATCHES, FIFTY_MATCHES |
| Torneos | FIRST_TOURNAMENT, TOURNAMENT_WINNER, TOURNAMENT_FINALIST |
| Categorias | TIER_QUINTA, TIER_CUARTA, TIER_TERCERA, TIER_SEGUNDA, TIER_PRIMERA |
| Rankings | TOP_100_COUNTRY, TOP_10_COUNTRY, NUMBER_ONE_COUNTRY |
| Social | FIRST_FOLLOWER, CLUB_FOUNDER, COACH_CERTIFIED |

**Activity Heatmap:**
- Calendario estilo GitHub con actividad diaria
- Últimos 365 días
- Conteo de análisis y ejercicios por día

### 6.4 Rankings y Leaderboards

| Dimensión | Descripción |
|-----------|-------------|
| GLOBAL | Ranking mundial |
| COUNTRY | Ranking por país (default: Perú) |
| SKILL_TIER | Ranking dentro de cada tier |
| AGE_GROUP | Ranking por grupo de edad |

| Período | Descripción |
|---------|-------------|
| WEEKLY | Ranking semanal (reset cada lunes) |
| MONTHLY | Ranking mensual |
| ALL_TIME | Ranking histórico |

**Skill Tiers:**
```
UNRANKED → 5ta B → 5ta A → 4ta B → 4ta A → 3ra B → 3ra A → 2da B → 2da A → 1ra B → 1ra A
```

**Cálculo de Score:**
- Composite score = promedio ponderado de technique scores
- Effective score = composite score ajustado por historial de partidos
- ELO rating (para matchmaking) = sistema ELO estándar, inicio en 1200

### 6.5 Matchmaking y Desafíos

| Feature | Descripción |
|---------|-------------|
| Discover Players | Búsqueda por ubicación, tier, distancia (GPS) |
| Enviar desafío | Proponer fecha, hora, lugar, mensaje |
| Aceptar/Rechazar | El retado responde con mensaje opcional |
| Registrar resultado | Ambos jugadores confirman score set por set |
| ELO ajuste | Rating ELO se actualiza automáticamente |
| Calificar rival | Sportsmanship, puntualidad, precisión de nivel (1-5) |
| Expiración automática | Desafíos no respondidos expiran vía cron job |

**Disponibilidad:**
- Configurar horarios disponibles por día de la semana
- Rango de viaje máximo (default: 25km)

### 6.6 Torneos

| Feature | Descripción |
|---------|-------------|
| Crear torneo | Nombre, formato, fechas, sede, restricciones de tier/edad |
| Formatos | Eliminación simple, doble eliminación, round robin |
| Inscripción | Registro con período de inscripción definido |
| Brackets | Generación y seguimiento automático de llaves |
| Seeding | Semillas basadas en ranking |
| Máximo jugadores | Configurable (default: 16) |
| Filtros | Por tier mínimo/máximo, grupo de edad, país |
| Clubes | Torneos pueden estar asociados a un club |

### 6.7 Social y Comunidad

| Feature | Descripción |
|---------|-------------|
| Follow/Unfollow | Seguir a otros jugadores |
| Activity Feed | Feed personalizado de jugadores seguidos |
| Comentarios | Comentar en análisis y otros contenidos |
| Clubes | Crear/unirse a clubes con límite de miembros |
| Notificaciones | 11 tipos de notificaciones in-app |
| Bloquear usuarios | Bloqueo bidireccional, previene interacciones |
| Reportar | 5 razones de reporte con sistema de moderación |

**Feed Items:**
- Análisis completado (con score)
- Badge ganado
- Promoción de tier
- Partido jugado
- Milestone de racha
- Milestone de ranking

### 6.8 Coach Marketplace

| Feature | Descripción |
|---------|-------------|
| Perfil de coach | Headline, bio, certificaciones, especialidades |
| Verificación | Upload de documentos, status: PENDING → VERIFIED/REJECTED |
| Tarifa por hora | En soles peruanos (PEN) |
| Rating y reviews | Calificación 1-5 con comentarios |
| Invitar alumnos | Coach envía invitación, alumno acepta |
| Dashboard de alumnos | Ver análisis de alumnos, asignar planes |
| Recomendaciones IA | Motor de recomendación de coaches según perfil |

**Relación Coach-Alumno:**
- Status: PENDING_INVITE → ACTIVE → PAUSED/ENDED
- Permisos configurables: ver análisis, asignar planes
- Coach puede tener múltiples alumnos

### 6.9 Tienda (E-Commerce)

| Feature | Descripción |
|---------|-------------|
| Catálogo | 7 categorías: Raquetas, Cuerdas, Grips, Bolsos, Zapatillas, Ropa, Accesorios |
| Búsqueda | Full-text search con filtros por categoría, marca, precio |
| Carrito | Carrito persistente por usuario |
| Checkout | Pago con Culqi (tarjeta de crédito/débito) |
| Reviews | Calificación 1-5 con verificación de compra |
| Pedidos | Tracking de status: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED |
| Stock | Gestión de inventario con alerta de stock bajo |
| Admin | CRUD completo de productos, imágenes, pedidos |

**Precios en centimos** (PEN cents) para precisión monetaria.

### 6.10 Servicio de Encordado

| Servicio | Precio | Turnaround |
|----------|--------|------------|
| Estándar | S/25 | 24-48 horas |
| Express | S/45 | Mismo día |

| Delivery | Fee | Descripción |
|----------|-----|-------------|
| Recojo a domicilio | S/15 | Recogemos y entregamos en tu dirección |
| Dejar en taller | Gratis | Tú llevas y recoges en el workshop |

**Flujo:**
1. Seleccionar servicio (estándar/express)
2. Datos de raqueta (marca, modelo)
3. Seleccionar cuerda y tensión (lbs)
4. Elegir delivery mode
5. Pagar con Culqi
6. Tracking de orden: 10 estados posibles

### 6.11 Canchas

| Feature | Descripción |
|---------|-------------|
| Directorio | Listado de canchas con filtros |
| Detalles | Superficie, tipo, amenidades, horarios, tarifa |
| GPS | Coordenadas y mapa |
| Reservas | Booking por fecha y horario |
| Contacto | Teléfono, WhatsApp, sitio web |
| Admin | CRUD completo de canchas y reservas |

**Superficies:** HARD, CLAY, GRASS, SYNTHETIC
**Tipos:** INDOOR, OUTDOOR, COVERED

### 6.12 Objetivos de Mejora

| Tipo | Descripción |
|------|-------------|
| TECHNIQUE | Mejorar técnica específica |
| SCORE_TARGET | Alcanzar un score objetivo (0-10) |
| TIER_TARGET | Alcanzar una categoria especifica (5ta B→1ra A) |

- Tracking de baseline → current → target
- Porcentaje de progreso calculado automáticamente
- Roadmap generado por IA con pasos
- Vinculación automática con análisis y planes relevantes
- Límite de goals activos según tier de suscripción

---

## 7. Flujos de Usuario

### 7.1 Registro → Onboarding

```
Registro (email + password)
    ↓
Verificación de email (token 24h)
    ↓
Selección de cuenta (Player / Coach)
    ↓
Selección de deporte(s)
    ↓
Completar perfil (nombre, ubicación, nivel)
    ↓
Dashboard principal
    ↓
Checklist de onboarding:
  □ Primer análisis
  □ Primer plan de entrenamiento
  □ Seleccionar deporte
```

### 7.2 Análisis → Entrenamiento (Loop Principal)

```
Subir video/imagen (hasta 100MB)
    ↓
Seleccionar deporte → técnica → variante (opcional)
    ↓
IA procesa (Gemini 2.5 Flash)
    ↓
Resultado: Score + Issues + Correcciones
    ↓
Generar plan de entrenamiento automático
    ↓
Plan de 4+ semanas con ejercicios diarios
    ↓
Completar ejercicios → Log progress
    ↓
Subir nuevo video de la misma técnica
    ↓
Comparar con análisis anterior → Medir progreso
```

### 7.3 Competencia

```
Discover Players (filtro por ubicación, tier, distancia)
    ↓
Enviar desafío (fecha, hora, lugar)
    ↓
Rival acepta
    ↓
Jugar partido
    ↓
Ambos confirman resultado (set por set)
    ↓
ELO se actualiza
    ↓
Calificar rival (sportsmanship, puntualidad)
    ↓
Rankings se recalculan (cron semanal)
    ↓
Feed: "Diego jugó un partido contra Carlos"
```

### 7.4 Coaching

```
Coach se registra como COACH
    ↓
Completa perfil (certificaciones, tarifa)
    ↓
Sube documento de verificación
    ↓
Admin verifica → VERIFIED
    ↓
Aparece en marketplace
    ↓
Invita alumnos por email/usuario
    ↓
Alumno acepta invitación
    ↓
Coach ve análisis del alumno
    ↓
Coach asigna plan personalizado con notas
    ↓
Alumno recibe y completa plan
    ↓
Alumno deja review del coach
```

### 7.5 Compra en Tienda

```
Navegar catálogo → Filtrar por categoría/marca
    ↓
Ver detalle del producto
    ↓
Agregar al carrito
    ↓
Ver carrito → Ajustar cantidades
    ↓
Checkout → Datos de envío
    ↓
Pagar con tarjeta (Culqi tokenización)
    ↓
Orden confirmada → Tracking de envío
    ↓
Entregado → Dejar review (opcional)
```

---

## 8. Modelo de Suscripción y Precios

### Planes

| | Free | Pro | Elite |
|--|------|-----|-------|
| **Precio** | S/0 | S/24.90/mes | S/39.90/mes |
| **Análisis/mes** | 5 | Ilimitados | Ilimitados |
| **Planes activos** | 1 | Ilimitados | Ilimitados |
| **Deportes** | 1 | Todos | Todos |
| **Historial** | Limitado | Completo | Completo |
| **Video HD** | — | — | ✓ |
| **Comparación avanzada** | — | — | ✓ |
| **Export PDF** | — | — | ✓ |
| **Coaching virtual** | — | — | ✓ |
| **Soporte** | Email | Prioritario | 24/7 |

### Add-ons
- **Deporte adicional**: Suscripción separada por deporte (para usuarios que quieren más de un deporte sin ser Pro)

### Moneda
- Soles peruanos (PEN / S/)
- Procesador: Culqi (gateway peruano)
- Precios internos en centimos para precisión

---

# ⚙️ TÉCNICO

---

## 9. Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE                            │
│                                                      │
│  Next.js 16 (React 19)    PWA (Service Worker)       │
│  Tailwind CSS 4            Framer Motion              │
│  TanStack Query            Zustand (state)            │
│  Liquid Glass UI           Recharts                   │
│                                                      │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│                 EDGE / MIDDLEWARE                     │
│                                                      │
│  NextAuth JWT          Route Protection               │
│  Role-based Access     CORS Headers                   │
│  CSP Headers           Rate Limiting (Upstash)        │
│                                                      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              API ROUTES (120+ endpoints)              │
│                                                      │
│  /api/analyze/*        /api/training-plans/*          │
│  /api/player/*         /api/coach/*                   │
│  /api/challenges/*     /api/tournaments/*             │
│  /api/social/*         /api/rankings/*                │
│  /api/shop/*           /api/stringing/*               │
│  /api/courts/*         /api/goals/*                   │
│  /api/gamification/*   /api/admin/*                   │
│  /api/culqi/*          /api/cron/*                    │
│                                                      │
└───┬──────┬──────┬──────┬──────┬──────┬──────────────┘
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
┌──────┐┌─────┐┌─────┐┌─────┐┌─────┐┌──────┐
│Prisma││Gemini││Culqi││Resend││Blob ││Redis │
│  ORM ││ AI  ││Pagos││Email ││Files││Cache │
└──┬───┘└─────┘└─────┘└─────┘└─────┘└──────┘
   │
   ▼
┌──────────────────────────────────────────┐
│          PostgreSQL (Neon)                │
│                                          │
│  25+ modelos    19 enums                 │
│  pgvector       Full-text search         │
│  Connection pooling                      │
└──────────────────────────────────────────┘
```

### Patrón de Arquitectura
- **Monolito modular**: Next.js full-stack con API routes como backend
- **Server-side rendering**: Páginas del dashboard con SSR
- **Client-side state**: TanStack Query para server state, Zustand para UI state
- **AI pipeline**: Asíncrono — upload → queue → process → notify

---

## 10. Stack Tecnológico

### Core

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 16.1.4 | Framework full-stack (SSR + API routes) |
| React | 19.2.3 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Prisma | 6.11.1 | ORM + migrations |
| PostgreSQL | — | Database (Neon hosted) |
| pnpm | 10.28.0 | Package manager |

### AI y Contenido

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| @google/generative-ai | 0.24.1 | Gemini 2.5 Flash — análisis de video, planes, embeddings |
| pdf-parse | 2.4.5 | Parsing de PDFs para knowledge base |
| pgvector | — | Embeddings vectoriales (768-dim) para RAG |

### Autenticación y Seguridad

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| next-auth | 5.0.0-beta.30 | JWT sessions, credentials provider |
| @auth/prisma-adapter | 2.11.1 | Prisma adapter para NextAuth |
| bcryptjs | 3.0.3 | Password hashing |
| zod | 4.3.6 | Schema validation |
| @upstash/ratelimit | 2.0.8 | Rate limiting distribuido |
| @upstash/redis | 1.36.1 | Redis para rate limits |

### Pagos

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| culqi-node | 2.1.0 | Gateway de pagos peruano |

### UI y Diseño

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| tailwindcss | 4.1.18 | Utility-first CSS |
| @radix-ui/* | latest | Primitivos accesibles (dropdown, label, slot) |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| clsx | 2.1.1 | Conditional classNames |
| tailwind-merge | 3.4.0 | Merge inteligente de clases |
| lucide-react | 0.563.0 | Iconos (18+ íconos en navegación) |
| framer-motion | 12.29.2 | Animaciones |
| recharts | 3.7.0 | Gráficos (líneas, barras) |
| canvas-confetti | 1.9.4 | Efectos de celebración |
| sonner | 2.0.7 | Toast notifications |

### State Management

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| @tanstack/react-query | 5.90.20 | Server state (cache, refetch, mutations) |
| zustand | 5.0.10 | Client state (UI, preferences) |

### Servicios Externos

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| resend | 6.8.0 | Email transaccional (6 templates) |
| @vercel/blob | 2.0.1 | File storage (videos, imágenes, PDFs) |
| @sentry/nextjs | 10.38.0 | Error monitoring |

### Dev & Testing

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| vitest | 4.0.18 | Unit/integration testing |
| @vitejs/plugin-react | 5.1.2 | Vitest React plugin |
| eslint | 9.39.2 | Linting |
| sharp | 0.34.5 | Image optimization |
| tsx | 4.21.0 | TypeScript execution (seeds) |

---

## 11. Base de Datos

### Overview
- **Motor**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 6.11.1
- **Extensiones**: pgvector (embeddings 768-dim)
- **Modelos**: 40+
- **Enums**: 26

### Diagrama de Dominio

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│    User      │────▶│  Analysis   │────▶│ TrainingPlan │
│  (central)   │     │  (IA core)  │     │ (exercises)  │
└──────┬───────┘     └──────┬──────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐    ┌──────────────┐
│PlayerProfile │    │    Issue     │
│ (score/tier) │    │ (problemas)  │
└──────┬───────┘    └──────────────┘
       │
       ├──▶ TechniqueScore (scores por técnica)
       ├──▶ Ranking (leaderboards)
       ├──▶ Challenge → Match → MatchRating
       ├──▶ Follow / Block / Report
       ├──▶ FeedItem / Comment
       ├──▶ Club → ClubMember
       ├──▶ Tournament → Participant → Bracket
       └──▶ CoachStudent → CoachProfile
```

### Modelos por Dominio

#### User & Auth (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `User` | email, password, role (USER/COACH/ADMIN), subscription (FREE/PRO/ELITE), culqiCustomerId | analyses, trainingPlans, playerProfile, coachProfile, cart, shopOrders |
| `UserSport` | userId, sportId, level, yearsExp | user, sport |
| `VerificationToken` | token, type (PASSWORD_RESET/EMAIL_VERIFICATION), expiresAt | user |

#### Sports Catalog (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Sport` | slug, name, isActive, configSchema | techniques, users, sportProfiles, rankings |
| `Technique` | sportId, slug, name, difficulty, correctForm, commonErrors, keyPoints, weight | variants, analyses, techniqueScores |
| `Variant` | techniqueId, slug, name, correctForm, keyDifferences | analyses |

#### Analysis & AI (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Analysis` | userId, techniqueId, status, overallScore, aiResponse, summary, strengths, priorityFocus | mediaItems, issues, trainingPlan, verification |
| `MediaItem` | analysisId, type (VIDEO/IMAGE), url, filename, fileSize, duration, angle | analysis |
| `Issue` | analysisId, category, title, description, severity, correction, drills | exercises |

#### Training (4 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `TrainingPlan` | userId, analysisId, title, durationDays, difficulty, status | exercises, progressLogs, coachAssignment |
| `Exercise` | trainingPlanId, name, instructions, dayNumber, sets, reps, durationMins, videoUrl | targetIssues, progressLogs |
| `ExerciseIssue` | exerciseId, issueId | (junction table) |
| `ProgressLog` | userId, trainingPlanId, exerciseId, date, completed, difficulty | user, trainingPlan, exercise |

#### Gamification (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `UserStreak` | userId, currentStreak, longestStreak, freezesAvailable, lastActivityAt | user |
| `UserBadge` | userId, badgeType (24 types), earnedAt | user |
| `ActivityLog` | userId, date, analysisCount, exerciseCount | user |

#### Player Profiles & Scoring (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `PlayerProfile` | userId, displayName, country, compositeScore, skillTier, matchElo, visibility | sportProfiles, techniqueScores, rankings, challenges, matches, follows |
| `TechniqueScore` | profileId, techniqueId, bestScore, averageScore, analysisCount, scoreHistory | profile, technique |
| `SportProfile` | profileId, sportId, compositeScore, skillTier, matchElo | profile, sport, techniqueScores |

#### Rankings (1 modelo)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Ranking` | profileId, sportId, category, period, country, rank, previousRank, effectiveScore | profile, sport |

#### Matchmaking (4 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `PlayerAvailability` | profileId, day, startTime, endTime | profile |
| `Challenge` | challengerId, challengedId, status, proposedDate, expiresAt | challenger, challenged, match |
| `Match` | player1Id, player2Id, score, sets, player1EloChange | challenge, ratings, tournamentBracket |
| `MatchRating` | matchId, raterId, ratedId, sportsmanship, punctuality, skillAccuracy | match, rater, rated |

#### Community (6 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Follow` | followerId, followingId | follower, following |
| `FeedItem` | profileId, type, title, referenceId, metadata | profile |
| `Comment` | authorId, targetId, targetType, content, isHidden | author |
| `Notification` | userId, type (11 types), title, read | user |
| `Block` | blockerId, blockedId | blocker, blocked |
| `Report` | reporterId, targetId, reason, resolved | reporter, target |

#### Clubs (2 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Club` | name, slug, ownerId, isPublic, maxMembers | owner, members, tournaments |
| `ClubMember` | clubId, profileId, role | club, profile |

#### Tournaments (3 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Tournament` | name, organizerId, format, maxPlayers, status, registrationEnd | organizer, club, participants, brackets |
| `TournamentParticipant` | tournamentId, profileId, seed, eliminated, finalPosition | tournament, profile |
| `TournamentBracket` | tournamentId, round, position, matchId, winnerId | tournament, match |

#### Coach (4 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `CoachProfile` | userId, headline, verificationStatus, hourlyRate, averageRating | students, reviews, assignedPlans |
| `CoachStudent` | coachId, studentId, status, canViewAnalyses, canAssignPlans | coach, student |
| `CoachAssignedPlan` | coachId, studentId, trainingPlanId, notes | coach, trainingPlan |
| `CoachReview` | coachId, reviewerId, rating, comment | coach, reviewer |

#### Shop (5 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Product` | slug, name, category (7 tipos), priceCents, stock, attributes (JSON) | cartItems, orderItems, reviews |
| `ProductReview` | productId, userId, rating, isVerifiedPurchase | product, user |
| `Cart` | userId | items |
| `CartItem` | cartId, productId, quantity | cart, product |
| `ShopOrder` | userId, orderNumber, status (7 estados), totalCents, shipping address | items |
| `ShopOrderItem` | orderId, productId, quantity, priceCents (snapshot) | order, product |

#### Stringing (2 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Workshop` | name, address, district, isPartner, operatingHours | stringingOrders |
| `StringingOrder` | userId, orderNumber, status (10 estados), serviceType, deliveryMode, racketBrand, stringName, tensionMain | user, workshop |

#### Courts (2 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Court` | name, address, surface (4 tipos), courtType (3 tipos), hourlyRate, amenities | bookings |
| `CourtBooking` | courtId, userId, date, startTime, endTime, status | court, user |

#### Goals (4 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `ImprovementGoal` | userId, type (3 tipos), targetScore, baselineScore, currentScore, progressPercent, roadmap | techniques, trainingPlans, analyses |
| `GoalTechnique` | goalId, techniqueId | (junction) |
| `GoalTrainingPlan` | goalId, trainingPlanId | (junction) |
| `GoalAnalysis` | goalId, analysisId, scoreDelta | (junction) |

#### Verification (2 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `AnalysisVerification` | analysisId, status, verificationScore, videoFingerprint, isDuplicate | peerReviews |
| `PeerReview` | verificationId, reviewerId, approved, comment | verification |

#### RAG Knowledge Base (2 modelos)
| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Document` | filename, fileUrl, sportSlug, status, pageCount, language | chunks |
| `DocumentChunk` | documentId, content, chunkIndex, category, technique, tokenCount + embedding (vector 768) | document |

#### Otros (3 modelos)
| Modelo | Campos clave |
|--------|-------------|
| `ExerciseTemplate` | slug, name, category, targetAreas, sportSlugs, defaults |
| `SportAddon` | userId, sportId, active, culqiSubscriptionId |
| `CronLock` | id, lockedAt, expiresAt |

### Enums Completos (26)

| Enum | Valores |
|------|---------|
| UserRole | USER, COACH, ADMIN |
| AccountType | PLAYER, COACH |
| SubscriptionTier | FREE, PRO, ELITE |
| AnalysisStatus | PENDING, PROCESSING, COMPLETED, FAILED |
| Severity | LOW, MEDIUM, HIGH, CRITICAL |
| PlanStatus | ACTIVE, PAUSED, COMPLETED, ABANDONED |
| MediaType | VIDEO, IMAGE |
| TokenType | PASSWORD_RESET, EMAIL_VERIFICATION |
| BadgeType | 24 valores (ver sección Gamificación) |
| SkillTier | UNRANKED, QUINTA_B, QUINTA_A, CUARTA_B, CUARTA_A, TERCERA_B, TERCERA_A, SEGUNDA_B, SEGUNDA_A, PRIMERA_B, PRIMERA_A |
| ProfileVisibility | PUBLIC, FRIENDS_ONLY, PRIVATE |
| RankingPeriod | WEEKLY, MONTHLY, ALL_TIME |
| RankingCategory | GLOBAL, COUNTRY, SKILL_TIER, AGE_GROUP |
| ChallengeStatus | PENDING, ACCEPTED, DECLINED, CANCELLED, COMPLETED, EXPIRED |
| MatchResultType | WIN, LOSS, NO_SHOW |
| AvailabilityDay | MONDAY — SUNDAY |
| NotificationType | 11 valores (ver sección Social) |
| FeedItemType | 6 valores (ver sección Social) |
| ReportReason | SPAM, INAPPROPRIATE, HARASSMENT, FAKE_PROFILE, OTHER |
| TournamentStatus | REGISTRATION, IN_PROGRESS, COMPLETED, CANCELLED |
| TournamentFormat | SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN |
| CoachVerificationStatus | PENDING_VERIFICATION, VERIFIED, REJECTED |
| CoachStudentStatus | PENDING_INVITE, ACTIVE, PAUSED, ENDED |
| VerificationStatus | UNVERIFIED, PENDING_REVIEW, VERIFIED, FLAGGED, REJECTED_VERIFICATION |
| DocumentStatus | UPLOADING, PROCESSING, COMPLETED, FAILED |
| ProductCategory | RACKETS, STRINGS, GRIPS, BAGS, SHOES, APPAREL, ACCESSORIES |
| OrderStatus | PENDING_PAYMENT, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED |
| StringingOrderStatus | 10 estados (PENDING_PAYMENT → DELIVERED) |
| DeliveryMode | HOME_PICKUP_DELIVERY, WORKSHOP_DROP_PICKUP |
| StringingServiceType | STANDARD, EXPRESS |
| ChunkCategory | THEORY, EXERCISE, TRAINING_PLAN, GENERAL |
| CourtSurface | HARD, CLAY, GRASS, SYNTHETIC |
| CourtType | INDOOR, OUTDOOR, COVERED |
| BookingStatus | PENDING, CONFIRMED, CANCELLED |
| GoalType | TECHNIQUE, SCORE_TARGET, TIER_TARGET |
| GoalStatus | ACTIVE, COMPLETED, ABANDONED |

---

## 12. API Reference

### Autenticación (6 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/api/auth/reset-password` | Completar reset con token |
| POST | `/api/auth/send-verification` | Enviar email de verificación |
| POST | `/api/auth/verify-email` | Verificar email con token |

### Análisis (7 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/analyze` | Crear nuevo análisis |
| GET | `/api/analyze` | Listar análisis del usuario (paginado) |
| POST | `/api/analyze/[id]/process` | Procesar con Gemini AI |
| POST | `/api/analyze/[id]/retry` | Reintentar análisis fallido |
| POST | `/api/analyze/[id]/verify` | Verificar autenticidad |
| POST | `/api/analyze/[id]/peer-review` | Peer review de verificación |
| POST | `/api/analyze/detect-technique` | Auto-detectar técnica de imagen |

### Planes de Entrenamiento (4 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/training-plans` | Crear plan desde análisis |
| GET | `/api/training-plans` | Listar planes del usuario |
| POST | `/api/training-plans/[id]/complete` | Marcar plan como completado |
| POST | `/api/training-plans/recommend` | Recomendaciones IA |

### Perfil del Jugador (8 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/player/profile` | Perfil del usuario |
| POST | `/api/player/profile/setup` | Setup de onboarding |
| GET | `/api/player/profile/[userId]` | Perfil público |
| GET/POST | `/api/player/sports` | Gestionar deportes favoritos |
| GET/POST | `/api/player/sport-profile` | Perfil por deporte |
| GET/POST | `/api/player/skill-score` | Scores de habilidad |
| POST | `/api/player/skill-score/recalculate` | Recalcular scores |
| GET/POST | `/api/player/availability` | Disponibilidad para matchmaking |

### Coach (7 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/coach/profile` | Perfil de coach |
| GET | `/api/coach/students` | Lista de alumnos |
| POST | `/api/coach/students/invite` | Invitar alumno |
| POST | `/api/coach/students/accept-invite` | Aceptar invitación |
| GET/POST | `/api/coach/students/[id]` | Detalle de alumno |
| POST | `/api/coach/students/[id]/analyses` | Ver análisis del alumno |
| POST | `/api/coach/students/[id]/assign-plan` | Asignar plan |

### Marketplace de Coaches (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/marketplace/coaches` | Directorio de coaches |
| GET | `/api/marketplace/coaches/[id]` | Perfil de coach |
| POST | `/api/marketplace/coaches/recommend` | Recomendaciones |

### Matchmaking y Desafíos (7 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/challenges` | Listar/crear desafíos |
| GET/POST | `/api/challenges/[id]` | Detalle/responder desafío |
| GET/POST | `/api/matches` | Historial de partidos |
| POST | `/api/matches/[id]/confirm` | Confirmar resultado |
| POST | `/api/matches/[id]/rate` | Calificar rival |
| GET | `/api/matchmaking/discover` | Descubrir jugadores |

### Torneos (6 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tournaments` | Lista de torneos |
| POST | `/api/tournaments` | Crear torneo |
| GET | `/api/tournaments/[id]` | Detalle de torneo |
| POST | `/api/tournaments/[id]/register` | Inscribirse |
| POST | `/api/tournaments/[id]/start` | Iniciar torneo |
| GET | `/api/tournaments/[id]/bracket` | Estado del bracket |

### Rankings (4 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/rankings` | Rankings globales |
| GET | `/api/rankings/my-position` | Mi posición |
| GET | `/api/rankings/countries` | Rankings por país |
| POST | `/api/cron/compute-rankings` | Recalcular rankings (cron) |

### Social y Comunidad (8 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/social/follow/[profileId]` | Seguir/dejar de seguir |
| POST | `/api/social/block/[profileId]` | Bloquear usuario |
| GET | `/api/social/feed` | Feed de actividad |
| GET/POST | `/api/social/comments/[targetType]/[targetId]` | Comentarios |
| POST | `/api/social/report` | Reportar usuario |
| GET | `/api/notifications` | Notificaciones |
| POST | `/api/notifications/read` | Marcar como leídas |

### Clubes (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/clubs` | Listar/crear clubes |
| GET | `/api/clubs/[slug]` | Detalle de club |
| POST | `/api/clubs/[slug]/join` | Unirse al club |

### Tienda (9 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/shop/products` | Catálogo de productos |
| GET | `/api/shop/products/[slug]` | Detalle de producto |
| GET/POST | `/api/shop/products/[slug]/reviews` | Reviews |
| GET/POST | `/api/shop/cart` | Carrito |
| GET/POST | `/api/shop/cart/items` | Items del carrito |
| DELETE | `/api/shop/cart/items/[id]` | Eliminar del carrito |
| GET | `/api/shop/orders` | Historial de pedidos |
| GET | `/api/shop/orders/[id]` | Detalle de pedido |
| POST | `/api/shop/checkout` | Procesar pedido |

### Encordado (6 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/stringing/orders` | Crear orden de encordado |
| GET | `/api/stringing/orders` | Historial de encordado |
| GET | `/api/stringing/orders/[id]` | Detalle de orden |
| GET | `/api/stringing/workshops` | Talleres disponibles |
| GET | `/api/stringing/coverage` | Cobertura del servicio |
| POST | `/api/stringing/checkout` | Procesar pago |

### Canchas (4 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/courts` | Lista de canchas |
| GET | `/api/courts/[id]` | Detalle de cancha |
| GET | `/api/courts/bookings` | Mis reservas |
| POST | `/api/courts/[id]/book` | Reservar cancha |

### Objetivos (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/goals` | Listar/crear objetivos |
| GET/POST | `/api/goals/[id]` | Detalle de objetivo |
| GET | `/api/goals/templates` | Templates de objetivos |

### Gamificación (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/gamification/streak` | Info de racha |
| GET | `/api/gamification/badges` | Badges ganados |
| POST | `/api/gamification/activity` | Registrar actividad |

### Pagos — Culqi (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/culqi/subscribe` | Crear suscripción |
| POST | `/api/culqi/portal` | Portal de cliente Culqi |
| POST | `/api/culqi/webhook` | Webhook de pagos |

### Admin (11 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/admin/documents` | Gestionar knowledge base |
| POST | `/api/admin/documents/[id]/process` | Procesar documento |
| POST | `/api/admin/documents/reprocess-all` | Reprocesar todos |
| GET/POST | `/api/admin/shop/products` | Gestionar productos |
| POST | `/api/admin/shop/products/[id]/images` | Subir imágenes |
| GET/POST | `/api/admin/shop/orders` | Gestionar pedidos |
| GET/POST | `/api/admin/stringing/orders` | Gestionar encordado |
| GET/POST | `/api/admin/stringing/workshops` | Gestionar talleres |
| GET/POST | `/api/admin/courts` | Gestionar canchas |

### Cron Jobs (3 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cron/expire-challenges` | Expirar desafíos pendientes |
| GET | `/api/cron/check-stale-analyses` | Marcar análisis estancados como fallidos |
| POST | `/api/cron/compute-rankings` | Recalcular rankings |

### Utilidades (6 endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/stats` | Estadísticas de la plataforma |
| GET | `/api/sports` | Catálogo de deportes |
| GET | `/api/sports/[sportId]/techniques` | Técnicas por deporte |
| GET | `/api/stats` | Estadísticas del usuario |
| POST | `/api/user/settings` | Configuración de usuario |
| POST | `/api/user/password` | Cambiar contraseña |
| POST | `/api/upload` | Subir archivo a Vercel Blob |

---

## 13. Sistema de Diseño — Liquid Glass

### Filosofía
El diseño "Liquid Glass" crea una interfaz luminosa, aérea y premium usando glass morphism (fondos translúcidos + blur) como elemento central. Construido sobre Tailwind CSS 4 con tokens CSS custom.

### Paleta de Colores (OKLCH)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | oklch(51.3% 0.214 259) | Botones, links, estados activos |
| `--color-background` | oklch(100% 0 0) | Fondo principal (blanco) |
| `--color-foreground` | oklch(14.5% 0 0) | Texto principal (casi negro) |
| `--color-muted-foreground` | oklch(55.6% 0 0) | Texto secundario |
| `--color-success` | oklch(72.3% 0.219 149.6) | Estados positivos (verde) |
| `--color-warning` | oklch(79.5% 0.184 86.0) | Alertas (naranja) |
| `--color-destructive` | oklch(57.7% 0.245 27.3) | Errores, eliminar (rojo) |
| `--color-border` | oklch(91.4% 0 0) | Bordes estándar |

### Glass Tokens

**Opacidad (5 niveles):**

| Token | Valor | Uso |
|-------|-------|-----|
| `--glass-opacity-ultralight` | 0.03 | Fondos sutiles, skeletons |
| `--glass-opacity-light` | 0.08 | Cards estándar |
| `--glass-opacity-medium` | 0.15 | Headers, elementos elevados |
| `--glass-opacity-heavy` | 0.25 | Modals, overlays |
| `--glass-opacity-solid` | 0.40 | Elementos opacos |

**Blur (5 niveles):**

| Token | Valor | Mobile |
|-------|-------|--------|
| `--glass-blur-subtle` | 8px | 8px |
| `--glass-blur-soft` | 16px | 16px |
| `--glass-blur-medium` | 24px | 12px |
| `--glass-blur-strong` | 40px | 20px |
| `--glass-blur-intense` | 64px | 32px |

**Bordes glass:**

| Clase | Valor |
|-------|-------|
| `.border-glass` | 1px oklch(100% 0 0 / 0.2) |
| `.border-glass-strong` | 1px oklch(100% 0 0 / 0.3) |

**Sombras:**

| Clase | Valor |
|-------|-------|
| `.shadow-glass` | 0 4px 16px oklch(0% 0 0 / 0.06) |
| `.shadow-glass-lg` | 0 8px 32px oklch(0% 0 0 / 0.08) |
| `.shadow-glass-glow` | shadow-lg + 0 0 40px primary/15 |

### Componentes UI

#### GlassButton (`components/ui/glass-button.tsx`)

| Variante | Descripción |
|----------|-------------|
| `default` | Glass medium + borde fuerte |
| `primary` | Glass primary + glow |
| `solid` | Fondo sólido primary |
| `ghost` | Ultra-light, borde transparente |
| `outline` | Glass light + borde fuerte |
| `destructive` | Fondo rojo claro + borde rojo |

Tamaños: `sm` (44px), `default` (44px), `lg` (48px), `xl` (56px), `icon` (44px²)

#### GlassCard (`components/ui/glass-card.tsx`)

| Intensity | Hover |
|-----------|-------|
| `ultralight` | `none` |
| `light` (default) | `lift` (translate -2px) |
| `medium` | `glow` (shadow primary) |
| `heavy` | `scale` (102%) |
| `primary` | — |

Padding: `none`, `sm` (12px), `md` (16px), `lg` (24px, default), `xl` (32px)

#### GlassBadge (`components/ui/glass-badge.tsx`)

Variantes: `default`, `primary`, `success`, `warning`, `destructive`, `outline`
Tamaños: `sm`, `default`, `lg`

#### GlassInput (`components/ui/glass-input.tsx`)

- Height: 44px, border-radius: 12px
- Focus: glass-medium + primary border glow
- Transición: 250ms liquid easing

#### GlassNavbar (`components/ui/glass-navbar.tsx`)

- Glass medium background, sticky, z-50
- Borde inferior glass

### Animaciones

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-liquid` | cubic-bezier(0.4, 0, 0.2, 1) | Default suave |
| `--ease-bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) | Rebote |
| `--ease-spring` | cubic-bezier(0.25, 0.8, 0.25, 1) | Resorte suave |
| `--duration-instant` | 100ms | Micro-interactions |
| `--duration-fast` | 150ms | Feedback rápido |
| `--duration-normal` | 250ms | Default |
| `--duration-slow` | 400ms | Transiciones de estado |
| `--duration-slower` | 600ms | Animaciones prominentes |

### Tipografía

- **Fuente**: Inter (Google Fonts)
- **Feature settings**: `rlig 1, calt 1`
- **Escala**: text-xs (11px) → text-2xl (24px)

### Responsive

| Breakpoint | Ancho | Uso |
|-----------|-------|-----|
| `sm` | 640px | Phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | **Desktop (layout switch)** |
| `xl` | 1280px | Wide desktop |

**Layout:**
- Mobile: BottomNav visible, Sidebar oculto, SportSelector en Header
- Desktop (lg+): Sidebar visible (256px), BottomNav oculto, SportSelector en Sidebar

### Accesibilidad

- `prefers-reduced-motion`: Todas las animaciones se reducen a 0.01ms
- Safe area insets para notch/home indicator
- Focus rings en todos los interactivos (2px ring, 2px offset)

---

## 14. Integraciones

### Google Gemini AI

| Aspecto | Detalle |
|---------|---------|
| **Modelo** | gemini-2.5-flash |
| **SDK** | @google/generative-ai 0.24.1 |
| **Embeddings** | text-embedding-004 (768 dimensiones) |
| **Usos** | Análisis de video, generación de planes, detección de técnica, roadmaps, embeddings RAG |
| **Safety** | Todas las categorías de daño en BLOCK_NONE (dominio deportivo) |

**Pipeline de Análisis:**
1. Usuario sube video/imagen
2. Media se almacena en Vercel Blob
3. Gemini recibe media + prompt deportivo + contexto RAG
4. Respuesta estructurada: score, issues, correcciones, drills
5. Resultados se almacenan en DB

**RAG Pipeline:**
1. Admin sube PDF (libro de técnica, manual de ejercicios)
2. pdf-parse extrae texto
3. Texto se divide en chunks (~500 tokens)
4. Gemini genera embeddings (768-dim) por chunk
5. Embeddings se almacenan con pgvector
6. Al generar planes, se hace similarity search para inyectar contexto relevante

### Culqi (Pagos)

| Aspecto | Detalle |
|---------|---------|
| **SDK** | culqi-node 2.1.0 |
| **Tipo** | Gateway de pagos peruano |
| **Flujo** | Frontend tokeniza tarjeta → Backend crea cargo/suscripción |
| **Moneda** | PEN (Soles peruanos), almacenado en centimos |
| **Webhook** | Notificaciones de pago en `/api/culqi/webhook` |

**Usos:**
- Suscripciones mensuales (Pro: S/24.90, Elite: S/39.90)
- Checkout de tienda (productos deportivos)
- Pago de encordado (servicio + delivery)

### Resend (Email)

| Aspecto | Detalle |
|---------|---------|
| **SDK** | resend 6.8.0 |
| **Templates** | 6 tipos de email |

**Templates:**
1. Welcome (onboarding)
2. Analysis Complete (score report)
3. Training Reminder (daily motivation)
4. Password Reset (link, expira 1h)
5. Email Verification (link, expira 24h)
6. Streak at Risk (alerta de racha)

### Vercel Blob (Storage)

| Aspecto | Detalle |
|---------|---------|
| **SDK** | @vercel/blob 2.0.1 |
| **Límites** | Video: 100MB, Imagen: 10MB |
| **Usos** | Videos de análisis, imágenes, PDFs de knowledge base, avatares |

### Sentry (Monitoring)

| Aspecto | Detalle |
|---------|---------|
| **SDK** | @sentry/nextjs 10.38.0 |
| **Environments** | Server, Client, Edge |
| **Sample rate** | 10% de traces |
| **Source maps** | Upload + delete after deploy |
| **PII** | Deshabilitado |

### Upstash Redis (Rate Limiting)

| Aspecto | Detalle |
|---------|---------|
| **SDK** | @upstash/ratelimit 2.0.8, @upstash/redis 1.36.1 |
| **Algoritmo** | Sliding window |
| **Fallback** | In-memory en desarrollo |

---

## 15. Seguridad

### Autenticación

| Medida | Implementación |
|--------|---------------|
| Password hashing | bcryptjs (salt rounds default) |
| Sessions | JWT con refresh cada 5 minutos |
| Password requirements | Min 8 chars, uppercase, lowercase, número |
| Email verification | Token de 24 horas |
| Password reset | Token de 1 hora |
| Brute force | 5 intentos / 60s (rate limiter) |

### Headers de Seguridad

| Header | Valor |
|--------|-------|
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' checkout.culqi.com; etc. |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| X-DNS-Prefetch-Control | on |
| X-Powered-By | Disabled |

### Rate Limiting

| Limiter | Límite | Ventana |
|---------|--------|---------|
| authLimiter | 5 | 60s |
| registerLimiter | 3 | 60s |
| forgotPasswordLimiter | 3 | 300s |
| analyzeLimiter | 10 | 60s |
| reportLimiter | 5 | 300s |
| uploadLimiter | 10 | 60s |
| checkoutLimiter | 5 | 60s |
| tournamentLimiter | 5 | 60s |
| challengeLimiter | 10 | 60s |

### Middleware

- Todas las rutas del dashboard requieren autenticación
- Rutas de admin requieren role ADMIN
- Rutas públicas explícitamente listadas
- Redirect automático: login → dashboard si ya autenticado

### Validación de Entorno

Variables requeridas (fail-fast al inicio):
- `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_AI_API_KEY`, `CULQI_SECRET_KEY`
- `CULQI_WEBHOOK_SECRET`, `CRON_SECRET`

### Otras medidas
- Input validation con Zod en endpoints
- Cron jobs protegidos con CRON_SECRET
- Distributed cron locks para evitar ejecución concurrente
- Video fingerprinting para detección de duplicados
- User blocking bidireccional

---

## 16. PWA y Performance

### Progressive Web App
- Service worker para cache offline
- Manifest con íconos generados
- Viewport configurado para mobile
- Safe area insets (notch, home indicator)

### Performance
- Next.js Image optimization (sharp)
- Server-side rendering para dashboard
- TanStack Query cache y deduplication
- Connection pooling en PostgreSQL (Neon)
- Vercel Blob CDN para archivos estáticos
- Body limit 20MB para server actions

### Testing
- **Framework**: Vitest 4.0.18
- **Scripts**: `pnpm test` (run), `pnpm test:watch` (watch mode)
- **Cobertura**: Paths críticos (auth, análisis, pagos)

---

# 💼 NEGOCIO

---

## 17. Business Model Canvas

```
┌─────────────────┬──────────────────┬─────────────────┐
│  KEY PARTNERS   │  KEY ACTIVITIES  │  VALUE PROP     │
│                 │                  │                 │
│ • Google (AI)   │ • Desarrollo     │ Coach virtual   │
│ • Culqi (pagos) │   de IA/ML      │ con IA que      │
│ • Neon (DB)     │ • Contenido      │ analiza tu      │
│ • Vercel (infra)│   deportivo      │ técnica real,   │
│ • Clubes de     │ • Comunidad      │ te entrena, y   │
│   tenis/padel   │   management     │ te conecta con  │
│ • Academias     │ • Soporte al     │ rivales de tu   │
│ • Coaches       │   usuario        │ nivel.          │
│   verificados   │ • Partnerships   │                 │
│ • Resend (email)│   con clubes     │ Accesible desde │
│ • Upstash (cache)│                 │ S/0 (gratis)    │
│                 │                  │                 │
├─────────────────┼──────────────────┼─────────────────┤
│  KEY RESOURCES  │                  │  CUSTOMER REL.  │
│                 │                  │                 │
│ • Modelo Gemini │                  │ • Self-service  │
│ • Knowledge base│                  │ • Comunidad     │
│ • Base de datos │                  │ • Gamificación  │
│   de técnicas   │                  │ • Email nurture │
│ • Equipo dev    │                  │ • Coaches como  │
│ • Marca         │                  │   embajadores   │
│                 │                  │                 │
├─────────────────┴──────────────────┼─────────────────┤
│  CHANNELS                          │  CUSTOMER SEG.  │
│                                    │                 │
│ • Web app (PWA)                    │ • Jugadores     │
│ • SEO / Content marketing          │   amateur       │
│ • Redes sociales                   │   (18-45 años)  │
│ • Clubes y academias               │ • Principiantes │
│ • Word of mouth (referrals)        │ • Coaches       │
│ • Google Ads (PPC)                 │   independientes│
│                                    │ • Clubes        │
├────────────────────────────────────┼─────────────────┤
│  COST STRUCTURE                    │  REVENUE        │
│                                    │                 │
│ • Google AI API (por uso)          │ • Suscripciones │
│ • Infraestructura (Vercel, Neon)   │   (SaaS)       │
│ • Desarrollo y mantenimiento       │ • E-commerce    │
│ • Marketing y adquisición          │   (tienda)     │
│ • Soporte al cliente               │ • Servicios     │
│ • Operaciones (encordado, envíos)  │   (encordado)  │
│                                    │ • Marketplace   │
│                                    │   (comisión     │
│                                    │   coaches)      │
└────────────────────────────────────┴─────────────────┘
```

---

## 18. Modelo de Ingresos

### 4 Fuentes de Ingreso

#### 1. Suscripciones SaaS (Revenue principal)

| Plan | Precio | Target | Margen |
|------|--------|--------|--------|
| Free | S/0 | Adquisición, prueba | N/A |
| Pro | S/24.90/mes | Jugadores serios | ~85% |
| Elite | S/39.90/mes | Profesionales, coaches | ~90% |

**Métricas objetivo:**
- Conversión Free → Pro: 5-8%
- Conversión Pro → Elite: 15-20%
- Churn mensual: <5%

#### 2. E-Commerce (Tienda deportiva)

| Categoría | Margen estimado |
|-----------|----------------|
| Raquetas | 15-25% |
| Cuerdas | 30-40% |
| Grips | 40-50% |
| Accesorios | 35-45% |

**Ventaja**: Recomendaciones contextuales post-análisis ("tu raqueta actual pesa mucho para tu swing, considera X").

#### 3. Servicios (Encordado)

| Servicio | Precio | Margen |
|----------|--------|--------|
| Estándar | S/25 | ~60% |
| Express | S/45 | ~65% |
| Pickup/Delivery | S/15 | ~40% |

**Modelo**: Propios workshops + partners comisionados.

#### 4. Marketplace de Coaches (futuro)

| Modelo | Comisión |
|--------|---------|
| Conexión coach-alumno | 10-15% de primera sesión |
| Suscripción premium coach | S/39.90/mes (visibilidad prioritaria) |

---

## 19. Go-to-Market Strategy

### Fase 1: Lanzamiento Perú (Meses 1-6)

**Mercado**: Lima, Perú
**Deporte**: Tenis (foco inicial)

**Canales de adquisición:**
1. **Clubes de tenis de Lima**: Partnerships con 5-10 clubes principales
   - Ofrecer plan Pro gratis a miembros por 1 mes
   - QR codes en canchas y vestidores
   - Demo en eventos del club

2. **Coaches como embajadores**: Onboardear 20-30 coaches verificados
   - Plan Elite gratis para coaches
   - Comisión por alumnos referidos
   - Herramienta de gestión gratuita

3. **SEO y contenido**: Blog con tips de tenis, técnica, equipamiento
   - Optimizar para: "mejorar revés tenis", "clases de tenis Lima", etc.
   - YouTube: Videos cortos de "antes vs después" del análisis IA

4. **Redes sociales**: Instagram, TikTok
   - Videos de análisis IA en tiempo real
   - Transformaciones de jugadores
   - Rankings y torneos locales

**Objetivos Fase 1:**
- 1,000 usuarios registrados
- 100 usuarios Pro
- 10 coaches verificados
- 50 análisis/día
- Net Promoter Score > 40

### Fase 2: Expansión deportiva (Meses 7-12)

**Agregar deportes**: Pádel (Perú boom), Pickleball
**Mercado**: Expandir a Arequipa, Trujillo, Cusco

**Estrategia:**
- Pádel tiene crecimiento exponencial en Perú
- Reusar toda la infraestructura técnica
- Nuevas técnicas y prompts para Gemini
- Partnerships con canchas de pádel

### Fase 3: Regional LATAM (Meses 13-24)

**Mercados**: Colombia, Chile, Argentina, México
**Deportes**: Tenis, Pádel, Fútbol

**Estrategia:**
- Localización (ya en español)
- Integración con gateways de pago locales
- Partnerships con federaciones deportivas
- Programa de afiliados regional

---

## 20. Análisis Competitivo

### Competidores directos

| Competidor | Fortaleza | Debilidad | Diferenciador SportTek |
|-----------|-----------|-----------|-------------------------|
| **SwingVision** | Tracking de tenis en tiempo real | Solo iOS, solo tenis, caro ($150/año) | Multi-deporte, accesible, comunidad |
| **HomeCourt** | Detección de shots por IA | Sin planes de entrenamiento, sin comunidad | Ciclo completo: análisis → plan → progreso |
| **Technique** | Análisis de video slow-mo | Manual, sin IA, sin scoring | IA automática con scoring objetivo |
| **TennisONE** | Contenido educativo | Sin análisis personalizado | Personalización total basada en TU video |

### Competidores indirectos

| Competidor | Overlap | Diferenciador SportTek |
|-----------|---------|-------------------------|
| YouTube tutorials | Contenido gratuito | Personalización vs genérico |
| Coach particular | Análisis experto | Costo (S/30/mes vs S/200/hora) |
| Clubes deportivos | Comunidad | Digital + IA vs solo presencial |
| Strava / Nike Run Club | Gamificación | Deportes de raqueta vs running |

### Ventajas competitivas

1. **Precio**: Desde gratis, Pro a S/24.90/mes vs $150+/año de competidores
2. **Multi-deporte**: Una sola plataforma para tenis, pádel, pickleball
3. **Ciclo completo**: Análisis → Entrenamiento → Competencia → Progresión
4. **Localización**: Diseñado para Latinoamérica (español, PEN, Culqi, ubicaciones peruanas)
5. **Comunidad**: Rankings, matchmaking, torneos, clubes, feed social
6. **E-Commerce integrado**: Tienda + encordado + canchas en la misma plataforma

---

## 21. Métricas Clave (KPIs)

### Producto

| KPI | Descripción | Objetivo M6 |
|-----|-------------|-------------|
| MAU | Monthly Active Users | 1,000 |
| DAU/MAU | Stickiness ratio | >30% |
| Análisis/usuario/mes | Engagement con core feature | >2 |
| Streak promedio | Días consecutivos activos | >5 |
| Tasa de completado de planes | % planes terminados vs creados | >40% |
| NPS | Net Promoter Score | >40 |

### Revenue

| KPI | Descripción | Objetivo M6 |
|-----|-------------|-------------|
| MRR | Monthly Recurring Revenue | S/3,000 |
| ARPU | Average Revenue Per User | S/15 |
| Free → Pro conversion | % free que pasan a Pro | 5-8% |
| Churn mensual | % Pro/Elite que cancelan | <5% |
| LTV | Lifetime Value | S/300+ |
| CAC | Customer Acquisition Cost | <S/30 |
| LTV/CAC | Ratio saludable | >3x |

### Engagement

| KPI | Descripción | Objetivo M6 |
|-----|-------------|-------------|
| Sesiones/semana | Frecuencia de uso | >3 |
| Matchmaking conversion | % discover → challenge sent | >10% |
| Partidos/semana | Actividad competitiva | >20 |
| Coach marketplace conversion | % vista → contacto | >5% |
| Tienda conversion | % visit → compra | >2% |

---

## 22. Roadmap

### Q1 2026 — Lanzamiento (ACTUAL)

- [x] Análisis de video con Gemini 2.5 Flash
- [x] Planes de entrenamiento IA
- [x] Gamificación (streaks, badges, actividad)
- [x] Rankings y leaderboards
- [x] Matchmaking y desafíos
- [x] Torneos con brackets
- [x] Comunidad (feed, follow, clubes, comentarios)
- [x] Coach marketplace
- [x] Tienda e-commerce
- [x] Servicio de encordado
- [x] Canchas (directorio + reservas)
- [x] Objetivos de mejora
- [x] Pagos con Culqi
- [x] PWA
- [x] Liquid Glass design system
- [x] SEO (sitemap, robots, OG images)
- [x] Security hardening (rate limits, CSP, HSTS)
- [x] Sentry monitoring
- [x] Logger estructurado

### Q2 2026 — Crecimiento

- [ ] Pádel como segundo deporte
- [ ] Notificaciones push (PWA)
- [ ] Chat directo entre jugadores
- [ ] Video comparison (side-by-side antes/después)
- [ ] Dark mode
- [ ] Programa de referidos
- [ ] Dashboard analytics para coaches
- [ ] API pública (v1)

### Q3 2026 — Expansión

- [ ] Pickleball como tercer deporte
- [ ] App nativa (React Native o Capacitor)
- [ ] Integración con wearables (Apple Watch, Garmin)
- [ ] Live scoring de partidos
- [ ] Liga de competencia semanal
- [ ] Marketplace de coaches con pagos
- [ ] Expansión a Colombia y Chile

### Q4 2026 — Madurez

- [ ] Fútbol (cuarto deporte)
- [ ] Análisis en tiempo real (live camera)
- [ ] IA coach personalizado (chatbot)
- [ ] Team features (dobles, equipos)
- [ ] Corporate plans (empresas con canchas)
- [ ] White-label para academias
- [ ] Expansión a México y Argentina

---

## Apéndice

### A. Variables de Entorno

**Requeridas (la app no inicia sin estas):**
```
DATABASE_URL
AUTH_SECRET
NEXTAUTH_URL
GOOGLE_AI_API_KEY
CULQI_SECRET_KEY
CULQI_WEBHOOK_SECRET
CRON_SECRET
```

**Requeridas para funcionalidad completa:**
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_CULQI_PUBLIC_KEY
RESEND_API_KEY
FROM_EMAIL
BLOB_READ_WRITE_TOKEN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

**Opcionales (degradan gracefully):**
```
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
YOUTUBE_API_KEY
CULQI_PRO_PLAN_ID / CULQI_ELITE_PLAN_ID
NEXT_PUBLIC_SENTRY_DSN / SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN
POSTGRES_URL_NON_POOLING
```

### B. Scripts de Desarrollo

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # ESLint
pnpm test             # Vitest (run)
pnpm test:watch       # Vitest (watch)
pnpm db:generate      # Prisma generate
pnpm db:push          # Push schema a DB
pnpm db:migrate       # Migrations
pnpm db:studio        # Prisma Studio
pnpm db:seed          # Seed data
```

### C. Estructura de Archivos

```
product01/
├── app/
│   ├── (auth)/           # Login, register, forgot-password
│   ├── (dashboard)/      # Dashboard, analyses, training, goals, etc.
│   ├── (landing)/        # Landing page pública
│   ├── api/              # 120+ API routes
│   ├── globals.css       # Liquid Glass tokens + utilities
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Glass components (button, card, badge, input, navbar)
│   ├── layout/           # Sidebar, Header, BottomNav, SportSelector
│   ├── analysis/         # Componentes de análisis
│   ├── gamification/     # Streak, badges, activity heatmap
│   ├── charts/           # Recharts visualizations
│   └── shared/           # EmptyState, etc.
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── culqi.ts          # Culqi client + plan definitions
│   ├── gemini/           # AI client + fallbacks
│   ├── training/         # Plan generation + enrichment
│   ├── rag/              # RAG pipeline (retriever, embeddings, chunker)
│   ├── email.ts          # Resend templates
│   ├── rate-limit.ts     # Upstash rate limiters
│   ├── env.ts            # Environment validation
│   ├── logger.ts         # Structured logger
│   └── ...               # 55+ utility files
├── prisma/
│   ├── schema.prisma     # 40+ models, 26 enums
│   └── seed.ts           # Seed data
├── public/               # Static assets, PWA icons
├── docs/                 # This documentation
└── tests/                # Vitest tests
```

---

*Última actualización: Enero 2026*
*Versión del producto: 1.0.0*
