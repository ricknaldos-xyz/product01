'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Menu, X, ArrowUpRight, Search } from 'lucide-react'

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
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Pill */}
          <Link
            href="/"
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg transition-all hover:shadow-xl"
          >
            <Target className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">SportTek</span>
          </Link>

          {/* Desktop Navigation — Individual Pills */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-5 py-2.5 bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-all text-sm font-medium rounded-full shadow-md hover:shadow-lg"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth — Pills with arrow button */}
          <div className="hidden md:flex items-center gap-2">
            <button
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:bg-white"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4 text-foreground" />
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-all text-sm font-medium rounded-full shadow-md hover:shadow-lg"
            >
              Iniciar sesion
            </Link>
            <div className="flex items-center">
              <Link
                href="/register"
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-l-full shadow-md hover:bg-primary/90 transition-all"
              >
                Comenzar gratis
              </Link>
              <Link
                href="/register"
                className="w-10 h-10 bg-primary text-white rounded-r-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-all border-l border-white/20"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-3xl shadow-xl p-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-foreground hover:bg-secondary transition-all py-3 px-4 rounded-full text-center font-medium"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-border/40 my-2" />
              <Link
                href="/login"
                className="text-foreground hover:bg-secondary transition-all py-3 px-4 rounded-full text-center font-medium"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white py-3 px-4 rounded-full text-center font-medium"
              >
                Comenzar gratis
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
