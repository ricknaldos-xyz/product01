import Link from 'next/link'
import { Target } from 'lucide-react'

const footerLinks = {
  producto: [
    { label: 'Caracteristicas', href: '#features' },
    { label: 'Precios', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  cuenta: [
    { label: 'Iniciar sesion', href: '/login' },
    { label: 'Crear cuenta', href: '/register' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">SportTech</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Mejora tu tecnica deportiva con inteligencia artificial.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              {footerLinks.producto.map((link) => (
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

          {/* Account Links */}
          <div>
            <h4 className="font-semibold mb-4">Cuenta</h4>
            <ul className="space-y-2">
              {footerLinks.cuenta.map((link) => (
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
          <p>&copy; 2026 SportTech. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
