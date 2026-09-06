import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Globe, Send } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import type { Lang } from '../context/LanguageContext';
import Magnetic from '../components/fx/Magnetic';


function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const pick = (l: Lang) => setLanguage(l);

  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 shrink-0"
      style={{ background: 'rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.08)' }}
      role="group"
      aria-label="Language switcher"
    >
      <Globe size={13} style={{ color: '#4F7FE0', marginLeft: 6 }} />
      {(['en', 'id'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          className="text-xs font-semibold px-2.5 py-1.5 transition-all duration-200 focus-ring"
          style={{
            background: language === l ? '#4F7FE0' : 'transparent',
            color: language === l ? '#FFFFFF' : '#334155',
          }}
          aria-pressed={language === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Header({ hideWordmark = false }: { hideWordmark?: boolean }) {
  const { view, setView } = useView();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.packages, href: '#packages' },
    { label: t.nav.portfolio, href: '#portfolio' },
    { label: t.nav.contact, href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAnchor = (href: string) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (view !== 'portfolio') {
      setView('portfolio');
      setTimeout(() => scrollToAnchor(href), 180);
      return;
    }
    scrollToAnchor(href);
  };

  const handleBrandSecret = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setView('login');
      return;
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 900);
  };

  return (
    <>
      {/* Sticky, always-visible solid navbar — matches GabzStore's real header exactly */}
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px) saturate(120%)',
          WebkitBackdropFilter: 'blur(10px) saturate(120%)',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
          boxShadow: scrolled ? '0 6px 24px rgba(15,23,42,0.06)' : 'none',
        }}
      >
        <div
          className="flex items-center justify-between gap-6 md:gap-8 px-6 md:px-10 lg:px-16 mx-auto"
          style={{ maxWidth: 1320, height: scrolled ? 66 : 74, transition: 'height 300ms ease' }}
        >
          <button
            onClick={handleBrandSecret}
            className="flex items-center gap-2 shrink-0 focus-ring"
            style={{ cursor: 'default', background: 'none', border: 'none', padding: 0 }}
            aria-label="GabzStore home"
          >
            {/* layoutId="brand-logo" sama dengan logo di LoadingScreen →
                Framer Motion nge-animate posisi + ukuran logo dari tengah
                loading ke sini (pojok kiri header) begitu intro selesai.
                Efek "logo terbang" ke navbar. Selama intro masih tampil,
                logo di sini disembunyikan supaya nggak ada 2 layoutId sama
                di DOM bareng (bikin animasi kacau). */}
            {!hideWordmark && (
              <motion.img
                layoutId="brand-logo"
                src="/images/logo.png"
                alt="GabzStore"
                width={28}
                height={28}
                style={{ objectFit: 'contain' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span
              className="brand-wordmark text-lg"
              style={{ userSelect: 'none', fontWeight: 700 }}
            >
              <span style={{ color: '#3B5FE3' }}>gabz</span>
              <span style={{ color: '#0F172A' }}>dev</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="relative text-sm font-medium transition-colors duration-300 focus-ring"
                style={{ color: '#334155' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4F7FE0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <LanguageSwitcher />
            <Magnetic>
              <a
                href="#footer"
                onClick={(e) => { e.preventDefault(); scrollToAnchor('#footer'); }}
                className="btn-bounce inline-flex items-center gap-1.5 text-sm font-semibold focus-ring"
                style={{ background: '#0E1424', color: '#FFFFFF', padding: '11px 22px' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1E293B')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0E1424')}
              >
                <Send size={13} />
                {t.nav.letsTalk}
              </a>
            </Magnetic>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 transition-colors focus-ring shrink-0"
            style={{ color: '#0F172A' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1001] flex flex-col items-center justify-center gap-8"
          style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)' }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 focus-ring"
            style={{ color: '#0F172A' }}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-2xl font-semibold transition-colors duration-300 focus-ring"
              style={{ color: '#0F172A' }}
            >
              {link.label}
            </a>
          ))}
          <LanguageSwitcher />
          <a
            href="#footer"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); scrollToAnchor('#footer'); }}
            className="btn-bounce mt-4 inline-flex items-center gap-1.5 text-sm font-semibold focus-ring"
            style={{ background: '#0E1424', color: '#FFFFFF', padding: '12px 24px' }}
          >
            <Send size={14} />
            {t.nav.letsTalk}
          </a>
        </div>
      )}
    </>
  );
}
