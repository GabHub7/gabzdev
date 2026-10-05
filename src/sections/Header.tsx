import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Globe, ArrowUpRight } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import type { Lang } from '../context/LanguageContext';
import Magnetic from '../components/fx/Magnetic';


function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const pick = (l: Lang) => setLanguage(l);

  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.08)' }}
      role="group"
      aria-label="Language switcher"
    >
      <Globe size={13} style={{ color: '#3B5FE3', marginLeft: 6 }} />
      {(['en', 'id'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          className="text-xs font-semibold px-2.5 py-1.5 transition-all duration-200 focus-ring"
          style={{
            background: language === l ? '#3B5FE3' : 'transparent',
            color: language === l ? '#FFFFFF' : '#334155',
            borderRadius: 9999,
          }}
          aria-pressed={language === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
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

  // Drawer kanan: body dikunci nggak bisa scroll selama drawer kebuka
  // (poin 12 validation: "Pastikan body tidak scroll ketika drawer
  // terbuka"), dan bisa ditutup pake tombol Escape buat aksesibilitas.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

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
      {/* Sticky, always-visible solid navbar. Nav labels (About/Packages/
          Portfolio/Contact) sengaja dipertahankan sama kayak GabzStore
          karena itu section yang BENERAN ada di situs ini — CTA & badge
          gayanya di-refresh biar konsisten sama Hero (pill biru). */}
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
            <img
              src="/images/logo.png"
              alt="GabzDev"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
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
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3B5FE3')}
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
                style={{ background: '#3B5FE3', color: '#FFFFFF', padding: '11px 22px', borderRadius: 9999 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#304DBA')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#3B5FE3')}
              >
                {t.nav.letsTalk} <ArrowUpRight size={14} />
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop — nutupin sisa halaman (tetep KELIHATAN di
                belakangnya, bukan ke-cover solid), klik di sini = tutup
                drawer. */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[1001] md:hidden"
              style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />

            {/* Drawer — panel kanan, TINGGI PENUH viewport, lebar
                78-85vw dibatasin max 320px biar di tablet-portrait pun
                nggak kelebaran. Sisi kiri halaman tetep kelihatan di
                belakang backdrop (bukan modal fullscreen lagi). */}
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 bottom-0 z-[1002] md:hidden flex flex-col"
              style={{
                width: 'min(82vw, 320px)',
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px) saturate(120%)',
                WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                borderLeft: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '-16px 0 48px rgba(15,23,42,0.18)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            >
              <div className="flex items-center justify-between px-5" style={{ height: 66, borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                <span className="brand-wordmark text-base" style={{ userSelect: 'none', fontWeight: 700 }}>
                  <span style={{ color: '#3B5FE3' }}>gabz</span>
                  <span style={{ color: '#0F172A' }}>dev</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 focus-ring"
                  style={{ color: '#0F172A' }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col px-5 pt-4 pb-5 gap-0.5 overflow-y-auto">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-base font-semibold py-3 transition-colors duration-200 focus-ring"
                    style={{ color: '#0F172A', borderBottom: '1px solid rgba(15,23,42,0.05)' }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto px-5 pb-6 pt-3 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }}>
                <LanguageSwitcher />
                <a
                  href="#footer"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); scrollToAnchor('#footer'); }}
                  className="btn-bounce inline-flex items-center justify-center gap-1.5 text-sm font-semibold focus-ring"
                  style={{ background: '#3B5FE3', color: '#FFFFFF', padding: '12px 20px', borderRadius: 9999 }}
                >
                  {t.nav.letsTalk} <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
