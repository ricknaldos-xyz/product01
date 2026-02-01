import Link from 'next/link'
import { Target } from 'lucide-react'

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
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plataforma integral para tu desarrollo en tenis, padel y pickleball. Analisis IA, rankings, torneos, coaches y comunidad.
            </p>
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

          {/* Community Links */}
          <div>
            <h4 className="font-semibold mb-4">Unete</h4>
            <ul className="space-y-2">
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
