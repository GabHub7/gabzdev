import { useRef } from 'react';
import TestimonialWaterfall from '../components/TestimonialWaterfall';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FadeUp from '../components/fx/FadeUp';
import { useView } from '../context/ViewContext';
import { useTranslation } from '../lib/i18n';
import { useSocial, useSocialIcons, useProfile, useTestimonials } from '../lib/queries';
import { SocialGlyph } from '../lib/socialIcon';
import { BUILD_VERSION } from '../lib/buildInfo';

/**
 * Heading kontak — versi profesional (ganti dari flicker font "Order" yang
 * lama, sekarang teksnya juga bukan "Order? Contact Us." lagi). Pola
 * teksnya "<pertanyaan>? <ajakan>" di kedua bahasa, jadi di-split di
 * tanda tanya pertama: bagian pertanyaan tetep warna gelap biasa, bagian
 * ajakan penutup (CONTACT ME / HUBUNGI SAYA) di-bold + warna biru brand.
 * Animasinya cuma sekali muncul (fade + naik dikit) pas discroll ke sini,
 * bukan animasi jalan terus — biar kesannya tenang/profesional.
 */
function ContactHeading({ text }: { text: string }) {
  const qIdx = text.indexOf('?');
  if (qIdx === -1) return <>{text}</>;
  const question = text.slice(0, qIdx + 1);
  const cta = text.slice(qIdx + 1).trim();

  return (
    <>
      {question}
      {cta && (
        <>
          {' '}
          <span
            className="inline-block"
            style={{
              color: '#3B5FE3',
              animation: 'contactCtaIn 700ms cubic-bezier(0.16,1,0.3,1) both',
              animationDelay: '150ms',
            }}
          >
            {cta}
          </span>
        </>
      )}
    </>
  );
}

/**
 * Contact + Testimoni digabung jadi satu section (referensi: "Order?
 * Contact Us." dari gendesignid.web.id). Ganti dari form isian manual jadi
 * baris ikon kontak langsung (klik = buka WA/Instagram/dll), dan testimoni
 * yang tadinya section terpisah sekarang jadi panel kecil di sampingnya.
 *
 * Fungsi rahasia dari Footer lama TETAP dipertahankan: klik nama di bottom
 * bar 3x cepat = buka login admin diam-diam.
 */
export default function Footer() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { setView } = useView();
  const { t } = useTranslation();

  const social = useSocial();
  const socialIcons = useSocialIcons('gabzdev');
  const { profile } = useProfile();
  const { testimonials } = useTestimonials('gabzdev');

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameSecret = () => {
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const waHref = social.whatsapp
    ? `https://wa.me/${social.whatsapp.replace(/^0/, '62')}?text=${encodeURIComponent('Halo GabzDev, saya tertarik dengan jasa pembuatan website.')}`
    : null;

  return (
    <footer id="contact" className="relative" style={{ background: '#FFFFFF' }}>
      <div
        ref={ref}
        className={`relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-24 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-9'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          {/* KIRI — headline besar + ikon kontak */}
          <div>
            <FadeUp threshold={0.2}>
              <p className="text-sm font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#3B5FE3' }}>
                {t.contact.label}
              </p>
            </FadeUp>
            <FadeUp threshold={0.2} delay={80}>
              <h2
                className="font-bold mb-3"
                style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', lineHeight: 1.05, color: '#0F172A' }}
              >
                <ContactHeading text={t.contact.title} />
              </h2>
            </FadeUp>
            <FadeUp threshold={0.2} delay={160}>
              <p className="text-sm mb-8" style={{ color: '#64748B' }}>
                {t.contact.clickToOrder}
              </p>
            </FadeUp>

            <FadeUp threshold={0.2} delay={240}>
              <div className="flex flex-wrap gap-3">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="btn-bounce flex flex-col items-center justify-center gap-2 w-24 h-24 focus-ring"
                    style={{ border: '1px solid #0F172A', borderRadius: 18 }}
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={22} style={{ color: '#0F172A' }} />
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>WhatsApp</span>
                  </a>
                )}
                {socialIcons.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="btn-bounce flex flex-col items-center justify-center gap-2 w-24 h-24 focus-ring"
                    style={{ border: '1px solid #0F172A', borderRadius: 18 }}
                    aria-label={s.label}
                  >
                    <SocialGlyph label={s.label} iconUrl={s.icon_url} size={22} color="#0F172A" />
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{s.label}</span>
                  </a>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* KANAN — panel testimoni: ngalir otomatis ke bawah (air terjun),
              bisa di-scroll & di-swipe vertikal, loop tanpa ujung. */}
          <TestimonialWaterfall items={testimonials} label={t.contact.testimonialsLabel} />
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid #E2E8F0' }}
        >
          <p className="text-xs text-center sm:text-left" style={{ color: '#94A3B8' }}>
            &copy; 2026{' '}
            <span onClick={handleNameSecret} style={{ cursor: 'default', userSelect: 'none' }}>
              {profile.name}
            </span>
            {' '}{t.footer.rights}
          </p>

          <div className="flex items-center gap-4">
            {/* Penanda versi build — buat verifikasi cepat apakah situs udah
                jalanin kode terbaru atau masih build lama yang belum
                di-redeploy. Sengaja kecil & pudar, nggak ganggu desain. */}
            <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{BUILD_VERSION}</span>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110 focus-ring"
              style={{ border: '1px solid #0F172A', borderRadius: 18 }}
              aria-label="Scroll to top"
            >
              <ArrowUp size={15} style={{ color: '#0F172A' }} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
