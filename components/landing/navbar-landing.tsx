'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/motion';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#secteurs', label: 'Secteurs' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#communaute', label: 'Communauté' },
];

export function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
          background: scrolled ? 'rgba(7,16,10,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(196,146,58,0.12)' : 'transparent'}`,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            padding: '0 1.5rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
              <Image
                src="/logo.png"
                alt="AgriIntel360"
                fill
                sizes="36px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: '1.125rem',
                color: '#E4DBC8',
                letterSpacing: '-0.01em',
              }}
            >
              Agri<span style={{ color: '#C4923A' }}>Intel360</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            className="navbar-desktop-nav"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div
            style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}
            className="navbar-desktop-cta"
          >
            <Link
              href="/login"
              style={{
                color: '#5E7A68',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '0.5rem 0.875rem',
                borderRadius: '6px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#C4923A')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#5E7A68')}
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              style={{
                background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                color: '#07100A',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.375rem 1rem',
                height: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '6px',
                boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
                transition: 'filter 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.filter = 'brightness(1.1)';
                el.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.filter = 'brightness(1)';
                el.style.transform = 'translateY(0)';
              }}
            >
              Commencer
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            className="navbar-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5E7A68',
              padding: '0.375rem',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .navbar-desktop-nav { display: flex !important; }
            .navbar-desktop-cta { display: flex !important; }
            .navbar-hamburger { display: none !important; }
          }
          @media (max-width: 767px) {
            .navbar-desktop-nav { display: none !important; }
            .navbar-desktop-cta { display: none !important; }
            .navbar-hamburger { display: flex !important; }
          }
        `}</style>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 49,
              background: '#07100A',
              borderBottom: '1px solid rgba(196,146,58,0.15)',
              padding: '1rem 1.5rem 1.25rem',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      display: 'block',
                      color: '#E4DBC8',
                      fontSize: '1.125rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      padding: '0.75rem 0.5rem',
                      borderBottom: '1px solid rgba(196,146,58,0.08)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = '#C4923A')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = '#E4DBC8')
                    }
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: NAV_LINKS.length * 0.08,
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                marginTop: '1.25rem',
              }}
            >
              <Link
                href="/login"
                onClick={closeMenu}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#5E7A68',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(196,146,58,0.15)',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = '#C4923A';
                  el.style.borderColor = 'rgba(196,146,58,0.35)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = '#5E7A68';
                  el.style.borderColor = 'rgba(196,146,58,0.15)';
                }}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                  color: '#07100A',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
                }}
              >
                Commencer
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative',
        color: '#5E7A68',
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        padding: '0.5rem 0.875rem',
        borderRadius: '6px',
        transition: 'color 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = '#C4923A';
        const underline = el.querySelector('.nav-underline') as HTMLElement | null;
        if (underline) {
          underline.style.transform = 'scaleX(1)';
          underline.style.opacity = '1';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = '#5E7A68';
        const underline = el.querySelector('.nav-underline') as HTMLElement | null;
        if (underline) {
          underline.style.transform = 'scaleX(0)';
          underline.style.opacity = '0';
        }
      }}
    >
      {children}
      <span
        className="nav-underline"
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '0.875rem',
          right: '0.875rem',
          height: '2px',
          background: '#C4923A',
          borderRadius: '1px',
          transform: 'scaleX(0)',
          opacity: 0,
          transition: 'transform 0.2s, opacity 0.2s',
          transformOrigin: 'left center',
        }}
      />
    </Link>
  );
}
