import Link from 'next/link'
import { ArrowRight, Video, Brain, Target, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SportTech</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Perfecciona tu tecnica deportiva con{' '}
            <span className="text-primary">Inteligencia Artificial</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sube un video de tu tecnica, obtiene un analisis detallado de errores
            y recibe un plan de entrenamiento personalizado para mejorar.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-lg"
            >
              Comenzar gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#como-funciona"
              className="border border-border px-6 py-3 rounded-lg hover:bg-secondary transition-colors text-lg"
            >
              Ver como funciona
            </Link>
          </div>
        </div>

        {/* Features */}
        <section id="como-funciona" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Sube tu video</h3>
              <p className="text-muted-foreground">
                Graba tu tecnica desde diferentes angulos y sube el video a la plataforma.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Analisis con IA</h3>
              <p className="text-muted-foreground">
                Nuestra IA analiza tu movimiento e identifica errores especificos en tu tecnica.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Mejora con un plan</h3>
              <p className="text-muted-foreground">
                Recibe ejercicios personalizados para corregir cada error y perfecciona tu tecnica.
              </p>
            </div>
          </div>
        </section>

        {/* Sports */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-4">Deportes disponibles</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Comenzamos con tenis y pronto agregaremos mas deportes
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <span className="text-4xl">🎾</span>
              </div>
              <p className="font-medium">Tenis</p>
              <p className="text-sm text-muted-foreground">Disponible</p>
            </div>
            <div className="text-center opacity-50">
              <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <span className="text-4xl">⛳</span>
              </div>
              <p className="font-medium">Golf</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
            <div className="text-center opacity-50">
              <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <span className="text-4xl">🏀</span>
              </div>
              <p className="font-medium">Basketball</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 SportTech. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
