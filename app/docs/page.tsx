'use client'

import { useState } from 'react'
import {
  Target,
  Settings,
  Briefcase,
  Eye,
  AlertTriangle,
  Lightbulb,
  Heart,
  Users,
  Video,
  Dumbbell,
  Trophy,
  Swords,
  Flag,
  Medal,
  ShoppingBag,
  Wrench,
  MapPin,
  GraduationCap,
  Database,
  Code,
  Palette,
  Link,
  Shield,
  Smartphone,
  BarChart3,
  Rocket,
  Search,
  TrendingUp,
  Map,
  ChevronRight,
  ChevronDown,
  Flame,
  Zap,
  Globe,
  DollarSign,
  Menu,
  X,
} from 'lucide-react'

// ============================================
// TABLE OF CONTENTS DATA
// ============================================

const sections = [
  {
    id: 'producto',
    icon: Target,
    label: 'Producto',
    color: 'text-blue-500',
    items: [
      { id: 'vision', label: '1. Visión y Misión' },
      { id: 'problema', label: '2. El Problema' },
      { id: 'solucion', label: '3. Nuestra Solución' },
      { id: 'propuesta', label: '4. Propuesta de Valor' },
      { id: 'publico', label: '5. Público Objetivo' },
      { id: 'funcionalidades', label: '6. Funcionalidades' },
      { id: 'flujos', label: '7. Flujos de Usuario' },
      { id: 'precios', label: '8. Precios' },
    ],
  },
  {
    id: 'tecnico',
    icon: Settings,
    label: 'Técnico',
    color: 'text-emerald-500',
    items: [
      { id: 'arquitectura', label: '9. Arquitectura' },
      { id: 'stack', label: '10. Stack Tecnológico' },
      { id: 'database', label: '11. Base de Datos' },
      { id: 'api', label: '12. API Reference' },
      { id: 'diseno', label: '13. Sistema de Diseño' },
      { id: 'integraciones', label: '14. Integraciones' },
      { id: 'seguridad', label: '15. Seguridad' },
      { id: 'pwa', label: '16. PWA y Performance' },
    ],
  },
  {
    id: 'negocio',
    icon: Briefcase,
    label: 'Negocio',
    color: 'text-amber-500',
    items: [
      { id: 'canvas', label: '17. Business Model Canvas' },
      { id: 'ingresos', label: '18. Modelo de Ingresos' },
      { id: 'gtm', label: '19. Go-to-Market' },
      { id: 'competencia', label: '20. Análisis Competitivo' },
      { id: 'kpis', label: '21. KPIs' },
      { id: 'roadmap', label: '22. Roadmap' },
    ],
  },
]

// ============================================
// SIDEBAR COMPONENT
// ============================================

function DocsSidebar({
  activeSection,
  mobileOpen,
  onClose,
}: {
  activeSection: string
  mobileOpen: boolean
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    producto: true,
    tecnico: true,
    negocio: true,
  })

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 glass-light border-r border-glass z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:z-30`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">SportTek</h2>
              <p className="text-xs text-muted-foreground">Documentación v1.0</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:glass-light" aria-label="Cerrar menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-4">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                  }
                  className="flex items-center gap-2 w-full text-left font-semibold text-sm mb-1"
                >
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                  <span>{section.label}</span>
                  {expanded[section.id] ? (
                    <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  )}
                </button>
                {expanded[section.id] && (
                  <ul className="ml-6 space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={onClose}
                          className={`block text-xs py-1.5 px-2 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'glass-primary text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:glass-ultralight'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl glass-primary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-light border-glass rounded-2xl p-6 ${className}`}>{children}</div>
  )
}

function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | React.ReactNode)[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-glass/50">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="glass-ultralight border-glass rounded-xl p-4 overflow-x-auto text-xs font-mono">
      {children}
    </pre>
  )
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' }) {
  const colors = {
    default: 'glass-light border-glass',
    primary: 'bg-primary/10 border border-primary/20 text-primary',
    success: 'bg-green-500/10 border border-green-500/20 text-green-600',
    warning: 'bg-amber-500/10 border border-amber-500/20 text-amber-600',
    destructive: 'bg-red-500/10 border border-red-500/20 text-red-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  )
}

function SectionDivider({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-light border-glass ${color}`}>
        <Icon className="h-5 w-5" />
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-border via-border to-transparent" />
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('vision')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden glass-medium border-b border-glass">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:glass-light"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-sm">SportTek Docs</span>
          <div className="w-9" />
        </div>
      </div>

      {/* Sidebar */}
      <DocsSidebar
        activeSection={activeSection}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="lg:ml-72 pt-16 lg:pt-8 pb-20 px-4 lg:px-12 max-w-4xl">
        {/* Hero */}
        <div className="mb-12">
          <div className="glass-primary border-glass rounded-3xl p-8 lg:p-12">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">SportTek</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Plataforma de análisis deportivo con inteligencia artificial
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Next.js 16</Badge>
              <Badge variant="primary">Gemini AI</Badge>
              <Badge variant="primary">Multi-deporte</Badge>
              <Badge variant="success">v1.0.0</Badge>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 🎯 PRODUCTO */}
        {/* ============================================ */}

        <SectionDivider icon={Target} label="Producto" color="text-blue-500" />

        {/* 1. Visión y Misión */}
        <Section id="vision" icon={Eye} title="1. Visión y Misión">
          <Card>
            <h3 className="font-semibold mb-2">Visión</h3>
            <p className="text-sm text-muted-foreground">
              Ser la plataforma líder en Latinoamérica para el desarrollo deportivo impulsado por
              inteligencia artificial, democratizando el acceso a análisis técnico profesional
              para jugadores de todos los niveles.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Misión</h3>
            <p className="text-sm text-muted-foreground">
              Empoderar a deportistas amateur y semi-profesionales con herramientas de análisis de
              video con IA, planes de entrenamiento personalizados, y una comunidad competitiva —
              todo lo que antes solo estaba disponible para atletas de élite con entrenadores
              privados.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Valores del Producto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Globe, label: 'Accesibilidad', desc: 'Herramientas profesionales al alcance de todos' },
                { icon: Zap, label: 'Inteligencia', desc: 'IA como motor central de análisis' },
                { icon: Users, label: 'Comunidad', desc: 'Competencia sana y crecimiento colectivo' },
                { icon: TrendingUp, label: 'Progresión', desc: 'Cada interacción contribuye al desarrollo' },
              ].map((v) => (
                <div key={v.label} className="flex items-start gap-3 p-3 rounded-xl glass-ultralight">
                  <v.icon className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{v.label}</p>
                    <p className="text-xs text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 2. El Problema */}
        <Section id="problema" icon={AlertTriangle} title="2. El Problema">
          <Card>
            <p className="text-sm text-muted-foreground mb-4">
              El mercado de deportes de raqueta en Latinoamérica crece aceleradamente. Sin embargo,
              la mayoría de jugadores enfrenta barreras críticas:
            </p>
            <Table
              headers={['Problema', 'Impacto', 'Afectados']}
              rows={[
                ['Sin acceso a análisis técnico', 'No saben qué corregir', '90% amateur'],
                ['Entrenadores caros', '1h = S/80-200', 'Clase media/baja'],
                ['Sin métricas de progreso', 'No miden mejora', 'Todos los niveles'],
                ['Comunidad fragmentada', 'Sin rivales de su nivel', 'Independientes'],
                ['Info dispersa', 'YouTube, foros sin personalización', 'Autodidactas'],
                ['Equipamiento sin guía', 'No saben qué elegir', 'Principiantes'],
              ]}
            />
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <p className="text-sm italic text-muted-foreground">
              &quot;Quiero mejorar mi tenis pero no tengo un coach que me diga qué estoy haciendo mal,
              no tengo con quién jugar de mi nivel, y no sé si estoy progresando.&quot;
            </p>
          </Card>
        </Section>

        {/* 3. Nuestra Solución */}
        <Section id="solucion" icon={Lightbulb} title="3. Nuestra Solución">
          <Card>
            <p className="text-sm text-muted-foreground mb-4">
              SportTek es una plataforma integral que combina análisis con IA, entrenamiento
              personalizado, competencia, y comunidad.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Video, label: 'Análisis con IA', desc: 'Sube video → Score + Issues' },
                { icon: Dumbbell, label: 'Entrenamiento', desc: 'Planes de 4+ semanas por IA' },
                { icon: Trophy, label: 'Competencia', desc: 'Rankings, ELO, Torneos' },
                { icon: Users, label: 'Comunidad', desc: 'Feed, Clubes, Follow' },
                { icon: GraduationCap, label: 'Marketplace', desc: 'Coaches verificados' },
                { icon: ShoppingBag, label: 'Tienda', desc: 'Equipamiento deportivo' },
                { icon: Wrench, label: 'Encordado', desc: 'Servicio con delivery' },
                { icon: Flame, label: 'Gamificación', desc: 'Streaks, 24 badges, tiers' },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-xl glass-ultralight text-center">
                  <f.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-xs">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <h3 className="font-semibold text-sm mb-1">Diferenciador clave</h3>
            <p className="text-sm text-muted-foreground">
              No somos una app de tracking ni una red social deportiva. Somos el coach virtual con
              IA que analiza tu técnica real, te dice qué corregir, te genera un plan
              personalizado, y te conecta con rivales de tu nivel.
            </p>
          </Card>
        </Section>

        {/* 4. Propuesta de Valor */}
        <Section id="propuesta" icon={Heart} title="4. Propuesta de Valor">
          <div className="grid gap-4">
            {[
              {
                title: 'Para Jugadores',
                items: [
                  'Análisis profesional instantáneo: sube un video de 30s, recibe score + correcciones',
                  'Planes personalizados generados por IA basados en tus debilidades',
                  'Progresión medible: score por técnica, tiers, rankings',
                  'Comunidad competitiva: rivales de tu nivel, torneos, desafíos',
                ],
              },
              {
                title: 'Para Coaches',
                items: [
                  'Herramienta de gestión de alumnos y planes',
                  'Marketplace con visibilidad ante miles de jugadores',
                  'IA como asistente: la IA analiza, el coach aporta estrategia',
                ],
              },
              {
                title: 'Para Administradores',
                items: [
                  'Gestión integral: canchas, tienda, encordado, knowledge base',
                  'RAG: sube PDFs que alimentan la IA con conocimiento especializado',
                ],
              },
            ].map((p) => (
              <Card key={p.title}>
                <h3 className="font-semibold text-sm mb-3">{p.title}</h3>
                <ul className="space-y-2">
                  {p.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        {/* 5. Público Objetivo */}
        <Section id="publico" icon={Users} title="5. Público Objetivo">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: 'Carlos, 28', city: 'Lima', profile: 'Intermedio, juega 2-3x/semana', plan: 'Pro', pain: 'Techo técnico, sin coach fijo' },
              { name: 'María, 35', city: 'Arequipa', profile: 'Principiante, 6 meses', plan: 'Free', pain: 'No sabe si su grip es correcto' },
              { name: 'Roberto, 45', city: 'Lima', profile: 'Coach, 15 años exp', plan: 'Elite', pain: 'Difícil captar nuevos alumnos' },
              { name: 'Diego, 22', city: 'Lima', profile: 'Avanzado, universitario', plan: 'Pro', pain: 'No encuentra rivales de su nivel' },
            ].map((p) => (
              <Card key={p.name}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full glass-primary flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.city}</p>
                  </div>
                  <Badge variant="primary">{p.plan}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1"><strong>Perfil:</strong> {p.profile}</p>
                <p className="text-xs text-muted-foreground"><strong>Dolor:</strong> {p.pain}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* 6. Funcionalidades */}
        <Section id="funcionalidades" icon={Zap} title="6. Funcionalidades">
          {/* Analysis */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">6.1 Análisis con IA</h3>
            </div>
            <Table
              headers={['Feature', 'Descripción', 'Tier']}
              rows={[
                ['Upload video/imagen', 'Videos hasta 100MB, imágenes hasta 10MB', 'Todos'],
                ['Detección automática', 'IA identifica técnica ejecutada', 'Todos'],
                ['Análisis Gemini 2.5', 'Score 0-10, issues por severidad, correcciones', 'Todos'],
                ['Comparación de progreso', 'Compara con análisis anterior', 'Pro+'],
                ['Verificación de autenticidad', 'Peer-review para validar videos', 'Todos'],
                ['Límite mensual', '3/mes (Free), ilimitado (Pro/Elite)', 'Variable'],
              ]}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="success">LOW</Badge>
              <Badge variant="warning">MEDIUM</Badge>
              <Badge variant="destructive">HIGH</Badge>
              <Badge variant="destructive">CRITICAL</Badge>
            </div>
          </Card>

          {/* Training */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">6.2 Planes de Entrenamiento</h3>
            </div>
            <Table
              headers={['Feature', 'Descripción']}
              rows={[
                ['Generación automática', 'IA crea plan de 4+ semanas desde análisis'],
                ['Ejercicios estructurados', 'Sets, reps, duración, instrucciones paso a paso'],
                ['Videos demostrativos', 'YouTube embebido para cada ejercicio'],
                ['Progresión diaria', 'Dificultad incremental 15%/semana'],
                ['RAG-augmented', 'Conocimiento de PDFs enriquece los planes'],
              ]}
            />
          </Card>

          {/* Gamification */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">6.3 Gamificación</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <div className="p-3 rounded-xl glass-ultralight">
                <p className="font-medium text-xs">Streaks</p>
                <p className="text-xs text-muted-foreground">Racha diaria + 1 freeze</p>
              </div>
              <div className="p-3 rounded-xl glass-ultralight">
                <p className="font-medium text-xs">24 Badges</p>
                <p className="text-xs text-muted-foreground">Análisis, competencia, social</p>
              </div>
              <div className="p-3 rounded-xl glass-ultralight">
                <p className="font-medium text-xs">Activity Heatmap</p>
                <p className="text-xs text-muted-foreground">Calendario estilo GitHub</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Skill Tiers (Categorías):</strong> UNRANKED → 5ta B → 5ta A → 4ta B → 4ta A → 3ra B → 3ra A → 2da B → 2da A → 1ra B → 1ra A
            </p>
          </Card>

          {/* Competition */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">6.4 Competencia</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Search, label: 'Matchmaking', desc: 'Descubre rivales por ubicación, tier, distancia' },
                { icon: Flag, label: 'Desafíos', desc: 'Envía desafíos 1v1 con fecha, hora, lugar' },
                { icon: Trophy, label: 'Rankings', desc: 'Global, país, tier, edad — semanal/mensual/histórico' },
                { icon: Medal, label: 'Torneos', desc: 'Eliminación simple/doble, round robin' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-2 p-3 rounded-xl glass-ultralight">
                  <c.icon className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Services */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">6.5 Servicios y E-Commerce</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl glass-ultralight">
                <ShoppingBag className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-xs">Tienda</p>
                <p className="text-xs text-muted-foreground">7 categorías, carrito, checkout con Culqi</p>
              </div>
              <div className="p-3 rounded-xl glass-ultralight">
                <Wrench className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-xs">Encordado</p>
                <p className="text-xs text-muted-foreground">Estándar S/25, Express S/45, delivery S/15</p>
              </div>
              <div className="p-3 rounded-xl glass-ultralight">
                <MapPin className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-xs">Canchas</p>
                <p className="text-xs text-muted-foreground">Directorio + reservas, 4 superficies</p>
              </div>
            </div>
          </Card>
        </Section>

        {/* 7. Flujos de Usuario */}
        <Section id="flujos" icon={Map} title="7. Flujos de Usuario">
          <Card>
            <h3 className="font-semibold text-sm mb-3">Loop Principal: Análisis → Entrenamiento</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                'Subir video',
                'Seleccionar técnica',
                'IA procesa (Gemini)',
                'Score + Issues',
                'Generar plan',
                'Completar ejercicios',
                'Nuevo análisis',
                'Comparar progreso',
              ].map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded-lg glass-ultralight font-medium">{step}</span>
                  {i < 7 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Flujo Competitivo</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                'Discover Players',
                'Enviar desafío',
                'Rival acepta',
                'Jugar partido',
                'Confirmar resultado',
                'ELO se actualiza',
                'Rankings recalculan',
              ].map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded-lg glass-ultralight font-medium">{step}</span>
                  {i < 6 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </span>
              ))}
            </div>
          </Card>
        </Section>

        {/* 8. Precios */}
        <Section id="precios" icon={DollarSign} title="8. Modelo de Suscripción y Precios">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                name: 'Free',
                price: 'S/0',
                features: ['5 análisis/mes', '1 plan activo', '1 deporte', 'Soporte email'],
                highlight: false,
              },
              {
                name: 'Pro',
                price: 'S/24.90',
                features: ['Análisis ilimitados', 'Planes ilimitados', 'Todos los deportes', 'Historial completo', 'Soporte prioritario'],
                highlight: true,
              },
              {
                name: 'Elite',
                price: 'S/39.90',
                features: ['Todo en Pro', 'Video HD', 'Comparación avanzada', 'Export PDF', 'Coaching virtual', 'Soporte 24/7'],
                highlight: false,
              },
            ].map((plan) => (
              <Card key={plan.name} className={plan.highlight ? 'ring-2 ring-primary/30' : ''}>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  {plan.price}
                  {plan.price !== 'S/0' && <span className="text-sm font-normal text-muted-foreground">/mes</span>}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        {/* ============================================ */}
        {/* ⚙️ TÉCNICO */}
        {/* ============================================ */}

        <SectionDivider icon={Settings} label="Técnico" color="text-emerald-500" />

        {/* 9. Arquitectura */}
        <Section id="arquitectura" icon={Code} title="9. Arquitectura del Sistema">
          <Card>
            <CodeBlock>{`┌───────────────────────────────────────────┐
│              CLIENTE                       │
│  Next.js 16 (React 19)   PWA              │
│  Tailwind CSS 4           Framer Motion    │
│  TanStack Query           Zustand          │
│  Liquid Glass UI          Recharts         │
└──────────────────┬────────────────────────┘
                   │ HTTPS
┌──────────────────▼────────────────────────┐
│           EDGE / MIDDLEWARE                │
│  NextAuth JWT    Route Protection          │
│  Role-based      CSP Headers              │
│  Rate Limiting   (Upstash Redis)          │
└──────────────────┬────────────────────────┘
                   │
┌──────────────────▼────────────────────────┐
│        API ROUTES (120+ endpoints)         │
│  /api/analyze/*     /api/training-plans/*  │
│  /api/player/*      /api/coach/*           │
│  /api/challenges/*  /api/tournaments/*     │
│  /api/social/*      /api/rankings/*        │
│  /api/shop/*        /api/stringing/*       │
│  /api/courts/*      /api/goals/*           │
│  /api/culqi/*       /api/admin/*           │
└──┬────┬────┬────┬────┬────┬───────────────┘
   │    │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼    ▼
Prisma Gemini Culqi Resend Blob Redis
 ORM    AI   Pagos Email  Files Cache
   │
   ▼
┌──────────────────────────────────────┐
│        PostgreSQL (Neon)              │
│  40+ modelos    26 enums             │
│  pgvector       Connection pooling   │
└──────────────────────────────────────┘`}</CodeBlock>
          </Card>
        </Section>

        {/* 10. Stack */}
        <Section id="stack" icon={Code} title="10. Stack Tecnológico">
          <Card>
            <h3 className="font-semibold text-sm mb-3">Core</h3>
            <Table
              headers={['Tecnología', 'Versión', 'Propósito']}
              rows={[
                ['Next.js', '16.1.4', 'Framework full-stack (SSR + API routes)'],
                ['React', '19.2.3', 'UI library'],
                ['TypeScript', '5.9.3', 'Type safety'],
                ['Prisma', '6.11.1', 'ORM + migrations'],
                ['PostgreSQL', 'Neon', 'Database serverless'],
                ['pnpm', '10.28.0', 'Package manager'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">AI, Pagos y Servicios</h3>
            <Table
              headers={['Tecnología', 'Versión', 'Propósito']}
              rows={[
                ['@google/generative-ai', '0.24.1', 'Gemini 2.5 Flash — análisis, planes, embeddings'],
                ['culqi-node', '2.1.0', 'Gateway de pagos peruano'],
                ['resend', '6.8.0', 'Email transaccional (6 templates)'],
                ['@vercel/blob', '2.0.1', 'File storage (videos, imágenes, PDFs)'],
                ['@sentry/nextjs', '10.38.0', 'Error monitoring'],
                ['@upstash/ratelimit', '2.0.8', 'Rate limiting distribuido'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">UI y State</h3>
            <Table
              headers={['Tecnología', 'Versión', 'Propósito']}
              rows={[
                ['tailwindcss', '4.1.18', 'Utility-first CSS + Liquid Glass'],
                ['@tanstack/react-query', '5.90.20', 'Server state (cache, refetch)'],
                ['zustand', '5.0.10', 'Client state (UI, preferences)'],
                ['recharts', '3.7.0', 'Gráficos y visualizaciones'],
                ['framer-motion', '12.29.2', 'Animaciones'],
                ['lucide-react', '0.563.0', 'Iconos (18+ en navegación)'],
              ]}
            />
          </Card>
        </Section>

        {/* 11. Database */}
        <Section id="database" icon={Database} title="11. Base de Datos">
          <Card>
            <p className="text-sm text-muted-foreground mb-4">
              PostgreSQL (Neon serverless) con Prisma ORM. 40+ modelos, 26 enums, extensión pgvector
              para embeddings de 768 dimensiones.
            </p>
            <h3 className="font-semibold text-sm mb-3">Modelos por Dominio</h3>
            <Table
              headers={['Dominio', 'Modelos', 'Key Models']}
              rows={[
                ['User & Auth', '3', 'User, UserSport, VerificationToken'],
                ['Sports Catalog', '3', 'Sport, Technique, Variant'],
                ['Analysis & AI', '3', 'Analysis, MediaItem, Issue'],
                ['Training', '4', 'TrainingPlan, Exercise, ProgressLog, ExerciseIssue'],
                ['Gamification', '3', 'UserStreak, UserBadge, ActivityLog'],
                ['Player Profiles', '3', 'PlayerProfile, TechniqueScore, SportProfile'],
                ['Rankings', '1', 'Ranking (multi-dimensión)'],
                ['Matchmaking', '4', 'Challenge, Match, MatchRating, PlayerAvailability'],
                ['Community', '6', 'Follow, FeedItem, Comment, Notification, Block, Report'],
                ['Clubs', '2', 'Club, ClubMember'],
                ['Tournaments', '3', 'Tournament, TournamentParticipant, TournamentBracket'],
                ['Coach', '4', 'CoachProfile, CoachStudent, CoachAssignedPlan, CoachReview'],
                ['Shop', '6', 'Product, ProductReview, Cart, CartItem, ShopOrder, ShopOrderItem'],
                ['Stringing', '2', 'Workshop, StringingOrder'],
                ['Courts', '2', 'Court, CourtBooking'],
                ['Goals', '4', 'ImprovementGoal, GoalTechnique, GoalTrainingPlan, GoalAnalysis'],
                ['RAG', '2', 'Document, DocumentChunk (+ vector 768)'],
                ['Verification', '2', 'AnalysisVerification, PeerReview'],
                ['Other', '3', 'ExerciseTemplate, SportAddon, CronLock'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Enums Principales (26)</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'UserRole', 'SubscriptionTier', 'AnalysisStatus', 'Severity', 'BadgeType',
                'SkillTier', 'ChallengeStatus', 'MatchResultType', 'NotificationType',
                'FeedItemType', 'TournamentFormat', 'OrderStatus', 'StringingOrderStatus',
                'ProductCategory', 'CourtSurface', 'GoalType', 'GoalStatus',
              ].map((e) => (
                <Badge key={e}>{e}</Badge>
              ))}
            </div>
          </Card>
        </Section>

        {/* 12. API */}
        <Section id="api" icon={Code} title="12. API Reference">
          <Card>
            <p className="text-sm text-muted-foreground mb-4">
              120+ endpoints organizados por dominio. Todos protegidos por autenticación JWT
              excepto rutas públicas explícitas.
            </p>
            <Table
              headers={['Dominio', 'Endpoints', 'Rutas principales']}
              rows={[
                ['Auth', '6', '/api/auth/register, forgot-password, verify-email'],
                ['Análisis', '7', '/api/analyze, /api/analyze/[id]/process'],
                ['Training', '4', '/api/training-plans, recommend'],
                ['Player', '8', '/api/player/profile, sports, skill-score'],
                ['Coach', '7', '/api/coach/profile, students, assign-plan'],
                ['Challenges', '7', '/api/challenges, /api/matches, matchmaking/discover'],
                ['Tournaments', '6', '/api/tournaments, register, bracket'],
                ['Rankings', '4', '/api/rankings, my-position, countries'],
                ['Social', '8', '/api/social/follow, feed, comments, report'],
                ['Clubs', '3', '/api/clubs, [slug]/join'],
                ['Shop', '9', '/api/shop/products, cart, checkout, orders'],
                ['Stringing', '6', '/api/stringing/orders, workshops, checkout'],
                ['Courts', '4', '/api/courts, [id]/book'],
                ['Goals', '3', '/api/goals, templates'],
                ['Gamification', '3', '/api/gamification/streak, badges, activity'],
                ['Culqi', '3', '/api/culqi/subscribe, portal, webhook'],
                ['Admin', '11', '/api/admin/documents, shop, stringing, courts'],
                ['Cron', '3', '/api/cron/expire-challenges, compute-rankings'],
              ]}
            />
          </Card>
        </Section>

        {/* 13. Diseño */}
        <Section id="diseno" icon={Palette} title="13. Sistema de Diseño — Liquid Glass">
          <Card>
            <p className="text-sm text-muted-foreground mb-4">
              Design system propietario basado en glass morphism con 5 niveles de opacidad,
              5 niveles de blur, colores en espacio OKLCH, y componentes con variantes tipadas (CVA).
            </p>
            <h3 className="font-semibold text-sm mb-3">Glass Tokens</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-2">Opacidad</p>
                {['ultralight (3%)', 'light (8%)', 'medium (15%)', 'heavy (25%)', 'solid (40%)'].map((o) => (
                  <p key={o} className="text-xs text-muted-foreground">• {o}</p>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium mb-2">Blur</p>
                {['subtle (8px)', 'soft (16px)', 'medium (24px → 12px mobile)', 'strong (40px → 20px mobile)', 'intense (64px → 32px mobile)'].map((b) => (
                  <p key={b} className="text-xs text-muted-foreground">• {b}</p>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Componentes UI</h3>
            <Table
              headers={['Componente', 'Variantes', 'Tamaños']}
              rows={[
                ['GlassButton', 'default, primary, solid, ghost, outline, destructive', 'sm, default, lg, xl, icon'],
                ['GlassCard', 'ultralight, light, medium, heavy, primary', 'none, sm, md, lg, xl'],
                ['GlassBadge', 'default, primary, success, warning, destructive, outline', 'sm, default, lg'],
                ['GlassInput', '(single variant)', 'h-11 (44px)'],
                ['GlassNavbar', 'sticky / non-sticky', '(full width)'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Animaciones</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-2">Easing</p>
                <p className="text-xs text-muted-foreground">• liquid: cubic-bezier(0.4, 0, 0.2, 1)</p>
                <p className="text-xs text-muted-foreground">• bounce: cubic-bezier(0.34, 1.56, 0.64, 1)</p>
                <p className="text-xs text-muted-foreground">• spring: cubic-bezier(0.25, 0.8, 0.25, 1)</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-2">Duración</p>
                <p className="text-xs text-muted-foreground">• instant: 100ms</p>
                <p className="text-xs text-muted-foreground">• fast: 150ms</p>
                <p className="text-xs text-muted-foreground">• normal: 250ms (default)</p>
                <p className="text-xs text-muted-foreground">• slow: 400ms</p>
              </div>
            </div>
          </Card>
        </Section>

        {/* 14. Integraciones */}
        <Section id="integraciones" icon={Link} title="14. Integraciones">
          <div className="grid gap-4">
            {[
              { name: 'Google Gemini AI', desc: 'Modelo 2.5-flash para análisis de video, generación de planes, detección de técnica, embeddings RAG (768-dim, text-embedding-004)' },
              { name: 'Culqi', desc: 'Gateway de pagos peruano. Suscripciones mensuales, checkout de tienda, pago de encordado. Frontend tokeniza → Backend crea cargo.' },
              { name: 'Resend', desc: '6 templates de email: welcome, analysis complete, training reminder, password reset, email verification, streak at risk.' },
              { name: 'Vercel Blob', desc: 'Storage CDN para videos (100MB), imágenes (10MB), PDFs de knowledge base, avatares.' },
              { name: 'Sentry', desc: 'Error monitoring en server, client, y edge. 10% traces sample rate. Source maps con delete after upload.' },
              { name: 'Upstash Redis', desc: '9 rate limiters preconfigurados: auth (5/60s), register (3/60s), analyze (10/60s), checkout (5/60s), etc.' },
            ].map((i) => (
              <Card key={i.name}>
                <h3 className="font-semibold text-sm">{i.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{i.desc}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* 15. Seguridad */}
        <Section id="seguridad" icon={Shield} title="15. Seguridad">
          <Card>
            <h3 className="font-semibold text-sm mb-3">Headers de Seguridad</h3>
            <Table
              headers={['Header', 'Valor']}
              rows={[
                ['Content-Security-Policy', "default-src 'self'; script-src 'self' checkout.culqi.com; ..."],
                ['X-Frame-Options', 'DENY'],
                ['X-Content-Type-Options', 'nosniff'],
                ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
                ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
                ['X-Powered-By', 'Disabled'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Rate Limiting</h3>
            <Table
              headers={['Limiter', 'Límite', 'Ventana']}
              rows={[
                ['authLimiter', '5', '60s'],
                ['registerLimiter', '3', '60s'],
                ['analyzeLimiter', '10', '60s'],
                ['checkoutLimiter', '5', '60s'],
                ['challengeLimiter', '10', '60s'],
                ['forgotPasswordLimiter', '3', '300s'],
              ]}
            />
          </Card>
        </Section>

        {/* 16. PWA */}
        <Section id="pwa" icon={Smartphone} title="16. PWA y Performance">
          <Card>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Service Worker', desc: 'Cache offline para assets estáticos' },
                { label: 'Image Optimization', desc: 'Next.js Image + Sharp' },
                { label: 'Safe Area', desc: 'Soporte para notch y home indicator' },
                { label: 'Body Limit', desc: '20MB para server actions (uploads)' },
                { label: 'Testing', desc: 'Vitest 4.0.18 para paths críticos' },
                { label: 'Monitoring', desc: 'Sentry 10% sample rate en producción' },
              ].map((p) => (
                <div key={p.label} className="p-3 rounded-xl glass-ultralight">
                  <p className="font-medium text-xs">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ============================================ */}
        {/* 💼 NEGOCIO */}
        {/* ============================================ */}

        <SectionDivider icon={Briefcase} label="Negocio" color="text-amber-500" />

        {/* 17. Canvas */}
        <Section id="canvas" icon={Briefcase} title="17. Business Model Canvas">
          <Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {[
                { title: 'Key Partners', items: ['Google (AI)', 'Culqi (pagos)', 'Neon (DB)', 'Vercel (infra)', 'Clubes de tenis/padel', 'Coaches verificados'] },
                { title: 'Key Activities', items: ['Desarrollo de IA/ML', 'Contenido deportivo', 'Community management', 'Partnerships con clubes'] },
                { title: 'Value Proposition', items: ['Coach virtual con IA', 'Análisis de técnica real', 'Planes personalizados', 'Comunidad competitiva', 'Accesible desde S/0'] },
                { title: 'Customer Relations', items: ['Self-service', 'Comunidad + gamificación', 'Email nurture', 'Coaches como embajadores'] },
                { title: 'Customer Segments', items: ['Jugadores amateur (18-45)', 'Principiantes', 'Coaches independientes', 'Clubes deportivos'] },
                { title: 'Revenue Streams', items: ['Suscripciones (SaaS)', 'E-commerce (tienda)', 'Servicios (encordado)', 'Marketplace (coaches)'] },
                { title: 'Channels', items: ['Web app (PWA)', 'SEO / Content marketing', 'Clubes y academias', 'Redes sociales', 'Google Ads'] },
                { title: 'Key Resources', items: ['Modelo Gemini AI', 'Knowledge base (RAG)', 'Base de técnicas', 'Equipo dev'] },
                { title: 'Cost Structure', items: ['Google AI API', 'Infraestructura', 'Desarrollo', 'Marketing', 'Operaciones encordado'] },
              ].map((block) => (
                <div key={block.title} className="p-3 rounded-xl glass-ultralight">
                  <p className="font-semibold mb-2">{block.title}</p>
                  <ul className="space-y-1">
                    {block.items.map((item) => (
                      <li key={item} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 18. Ingresos */}
        <Section id="ingresos" icon={DollarSign} title="18. Modelo de Ingresos">
          <Card>
            <h3 className="font-semibold text-sm mb-3">4 Fuentes de Ingreso</h3>
            <Table
              headers={['Fuente', 'Tipo', 'Ejemplo', 'Margen Est.']}
              rows={[
                ['Suscripciones', 'SaaS recurrente', 'Pro S/24.90/mes, Elite S/39.90/mes', '~85-90%'],
                ['Tienda', 'E-commerce', 'Raquetas, cuerdas, accesorios', '15-50%'],
                ['Encordado', 'Servicios', 'Estándar S/25, Express S/45', '~60%'],
                ['Marketplace', 'Comisión', '10-15% primera sesión coach', 'Futuro'],
              ]}
            />
          </Card>
        </Section>

        {/* 19. GTM */}
        <Section id="gtm" icon={Rocket} title="19. Go-to-Market Strategy">
          <div className="grid gap-4">
            {[
              {
                phase: 'Fase 1: Lanzamiento Perú (M1-6)',
                items: [
                  'Partnerships con 5-10 clubes de tenis en Lima',
                  'Onboardear 20-30 coaches verificados (plan Elite gratis)',
                  'SEO: blog con tips de tenis + keywords',
                  'Social: Instagram, TikTok — videos de análisis IA',
                  'Objetivo: 1,000 usuarios, 100 Pro, 50 análisis/día',
                ],
              },
              {
                phase: 'Fase 2: Expansión deportiva (M7-12)',
                items: [
                  'Agregar Pádel (boom en Perú)',
                  'Expandir a Arequipa, Trujillo, Cusco',
                  'Pickleball como tercer deporte',
                ],
              },
              {
                phase: 'Fase 3: Regional LATAM (M13-24)',
                items: [
                  'Colombia, Chile, Argentina, México',
                  'Integración con gateways locales',
                  'Programa de afiliados regional',
                ],
              },
            ].map((p) => (
              <Card key={p.phase}>
                <h3 className="font-semibold text-sm mb-3">{p.phase}</h3>
                <ul className="space-y-2">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        {/* 20. Competencia */}
        <Section id="competencia" icon={Search} title="20. Análisis Competitivo">
          <Card>
            <Table
              headers={['Competidor', 'Fortaleza', 'Debilidad', 'Diferenciador SportTek']}
              rows={[
                ['SwingVision', 'Tracking en tiempo real', 'Solo iOS, solo tenis, $150/año', 'Multi-deporte, accesible, comunidad'],
                ['HomeCourt', 'Detección de shots', 'Sin planes ni comunidad', 'Ciclo completo: análisis→plan→progreso'],
                ['Technique', 'Slow-mo video', 'Sin IA, sin scoring', 'IA automática con scoring objetivo'],
                ['Coach particular', 'Análisis experto', 'S/200/hora', 'S/30/mes vs S/200/hora'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Ventajas competitivas</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Precio', desc: 'Desde gratis vs $150+/año de competidores' },
                { label: 'Multi-deporte', desc: 'Una plataforma para tenis, pádel, pickleball' },
                { label: 'Ciclo completo', desc: 'Análisis → Entrenamiento → Competencia → Progresión' },
                { label: 'Localización', desc: 'Diseñado para LATAM (español, PEN, Culqi)' },
                { label: 'Comunidad', desc: 'Rankings, matchmaking, torneos, clubes' },
                { label: 'E-Commerce integrado', desc: 'Tienda + encordado + canchas' },
              ].map((v) => (
                <div key={v.label} className="p-3 rounded-xl glass-ultralight">
                  <p className="font-medium text-xs">{v.label}</p>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 21. KPIs */}
        <Section id="kpis" icon={BarChart3} title="21. Métricas Clave (KPIs)">
          <Card>
            <h3 className="font-semibold text-sm mb-3">Producto</h3>
            <Table
              headers={['KPI', 'Descripción', 'Objetivo M6']}
              rows={[
                ['MAU', 'Monthly Active Users', '1,000'],
                ['DAU/MAU', 'Stickiness ratio', '>30%'],
                ['Análisis/usuario/mes', 'Engagement core feature', '>2'],
                ['Streak promedio', 'Días consecutivos activos', '>5'],
                ['NPS', 'Net Promoter Score', '>40'],
              ]}
            />
          </Card>
          <Card>
            <h3 className="font-semibold text-sm mb-3">Revenue</h3>
            <Table
              headers={['KPI', 'Descripción', 'Objetivo M6']}
              rows={[
                ['MRR', 'Monthly Recurring Revenue', 'S/3,000'],
                ['ARPU', 'Average Revenue Per User', 'S/15'],
                ['Free→Pro', 'Conversión', '5-8%'],
                ['Churn', 'Mensual', '<5%'],
                ['LTV/CAC', 'Ratio saludable', '>3x'],
              ]}
            />
          </Card>
        </Section>

        {/* 22. Roadmap */}
        <Section id="roadmap" icon={Map} title="22. Roadmap">
          <div className="grid gap-4">
            {[
              {
                quarter: 'Q1 2026 — Lanzamiento',
                status: 'done' as const,
                items: [
                  'Análisis con Gemini 2.5 Flash',
                  'Planes de entrenamiento IA',
                  'Gamificación (streaks, badges)',
                  'Rankings, matchmaking, torneos',
                  'Comunidad (feed, clubes)',
                  'Tienda, encordado, canchas',
                  'Pagos con Culqi',
                  'PWA + Liquid Glass',
                  'Security hardening + Sentry',
                ],
              },
              {
                quarter: 'Q2 2026 — Crecimiento',
                status: 'next' as const,
                items: [
                  'Pádel como segundo deporte',
                  'Notificaciones push',
                  'Chat directo entre jugadores',
                  'Video comparison (side-by-side)',
                  'Dark mode',
                  'Programa de referidos',
                ],
              },
              {
                quarter: 'Q3 2026 — Expansión',
                status: 'future' as const,
                items: [
                  'Pickleball como tercer deporte',
                  'App nativa (React Native)',
                  'Integración con wearables',
                  'Liga semanal',
                  'Marketplace de coaches con pagos',
                  'Expansión a Colombia y Chile',
                ],
              },
              {
                quarter: 'Q4 2026 — Madurez',
                status: 'future' as const,
                items: [
                  'Fútbol (cuarto deporte)',
                  'Análisis en tiempo real',
                  'IA coach chatbot',
                  'Team features (dobles)',
                  'White-label para academias',
                  'Expansión a México y Argentina',
                ],
              },
            ].map((q) => (
              <Card key={q.quarter}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sm">{q.quarter}</h3>
                  {q.status === 'done' && <Badge variant="success">Completado</Badge>}
                  {q.status === 'next' && <Badge variant="primary">Próximo</Badge>}
                  {q.status === 'future' && <Badge>Planificado</Badge>}
                </div>
                <ul className="grid sm:grid-cols-2 gap-1">
                  {q.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {q.status === 'done' ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-muted-foreground/40">○</span>
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-glass text-center">
          <p className="text-xs text-muted-foreground">
            SportTek v1.0.0 — Documentación generada en Enero 2026
          </p>
        </div>
      </main>
    </div>
  )
}
