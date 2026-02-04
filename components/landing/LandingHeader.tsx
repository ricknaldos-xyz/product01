'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Menu, X, ArrowRight } from 'lucide-react'

const navLinks = [
  { href: '#features', label: 'Ecosistema' },
  { href: '#services', label: 'Servicios' },
  { href: '#pricing', label: 'Precios' },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">SportTek</span>
        </Link>

        {/* Desktop Navigation — Central Pill */}
        <div className="hidden md:flex items-center bg-secondary rounded-full px-2 py-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-background"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
          >
            Comenzar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-foreground hover:bg-secondary transition-colors py-3 px-4 rounded-xl text-center font-medium"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border/50 my-2" />
            <Link
              href="/login"
              className="text-foreground hover:bg-secondary transition-colors py-3 px-4 rounded-xl text-center font-medium"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="bg-foreground text-background py-3 px-4 rounded-full text-center font-medium mt-2"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
