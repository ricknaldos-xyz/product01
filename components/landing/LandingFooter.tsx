'use client'

import Link from 'next/link'
import { Target, ArrowRight } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'

const footerLinks = {
  plataforma: [
    { label: 'Ecosistema', href: '#features' },
    { label: 'Como funciona', href: '#how-it-works' },
    { label: 'Precios', href: '#pricing' },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Torneos', href: '/tournaments' },
    { label: 'FAQ', href: '#faq' },
  ],
  servicios: [
    { label: 'Coach Marketplace', href: '/coaches' },
    { label: 'Tienda', href: '/tienda' },
    { label: 'Encordado', href: '/encordado' },
    { label: 'Canchas', href: '/courts' },
    { label: 'Documentacion', href: '/docs' },
  ],
  comunidad: [
    { label: 'Registrarme como jugador', href: '/register?type=player' },
    { label: 'Registrarme como coach', href: '/register?type=coach' },
    { label: 'Aplicar como proveedor', href: '/register?type=provider' },
    { label: 'Iniciar sesion', href: '/login' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">SportTek</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              La plataforma integral para tu desarrollo en tenis y padel. Analisis IA, rankings, torneos, coaches y comunidad.
            </p>
            <GlassButton variant="default" size="sm" asChild>
              <Link href="/register">
                Unete
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </GlassButton>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {footerLinks.plataforma.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Recibe tips, torneos y novedades cada semana.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 min-w-0 h-10 px-4 rounded-full border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <GlassButton type="submit" variant="default" size="icon-circle" className="flex-shrink-0 h-10 w-10">
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </form>
            <ul className="space-y-2 mt-6">
              {footerLinks.comunidad.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 SportTek. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
