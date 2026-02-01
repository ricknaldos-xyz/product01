'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Menu, X } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassNavbar } from '@/components/ui/glass-navbar'

const navLinks = [
  { href: '#features', label: 'Ecosistema' },
  { href: '#how-it-works', label: 'Como funciona' },
  { href: '#ranking', label: 'Rankings' },
  { href: '#coaches', label: 'Coaches' },
  { href: '#pricing', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
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
    <GlassNavbar>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="glass-primary border-glass rounded-xl p-2">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">SportTek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all duration-[var(--duration-normal)] text-sm font-medium rounded-xl hover:glass-ultralight"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <GlassButton variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar sesion</Link>
            </GlassButton>
            <GlassButton variant="solid" size="sm" asChild>
              <Link href="/register">Comenzar gratis</Link>
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <GlassButton
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </GlassButton>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-glass mt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-muted-foreground hover:text-foreground transition-all duration-[var(--duration-normal)] py-3 px-4 rounded-xl hover:glass-ultralight"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-glass my-2" />
              <GlassButton variant="ghost" asChild className="justify-start">
                <Link href="/login">Iniciar sesion</Link>
              </GlassButton>
              <GlassButton variant="solid" asChild>
                <Link href="/register">Comenzar gratis</Link>
              </GlassButton>
            </div>
          </div>
        )}
      </nav>
    </GlassNavbar>
  )
}
