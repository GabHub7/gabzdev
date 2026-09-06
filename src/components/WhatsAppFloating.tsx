import { MessageCircle } from 'lucide-react';
import { useSocial } from '../lib/queries';
import { useTranslation } from '../lib/i18n';
import Magnetic from './fx/Magnetic';

/**
 * Tombol WhatsApp floating di kanan bawah halaman (persis pola gabzstore.web.id).
 * Nomornya diambil dari data `social` di Supabase (bisa diedit dari admin dashboard).
 * Kalau nomor belum diisi, tombolnya nggak muncul sama sekali — nggak ngasih
 * link mati yang menyesatkan.
 *
 * Catatan teknis: posisi `fixed` sengaja ditaro di wrapper LUAR (bukan di
 * elemen yang dibungkus Magnetic), karena Magnetic pakai CSS `transform`
 * buat efek magnetnya — dan `transform` di ancestor bikin child `position:
 * fixed` jadi ngikutin ancestor itu, bukan viewport lagi. Jadi urutannya:
 * fixed wrapper (posisi) -> Magnetic (efek hover) -> tombol asli.
 */
export default function WhatsAppFloating() {
  const { t } = useTranslation();
  const social = useSocial();
  const number = (social?.whatsapp || '').replace(/[^0-9]/g, '');
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(t.whatsappFloating.defaultMessage)}`;

  return (
    <div className="fixed z-[999]" style={{ right: 'clamp(16px, 3vw, 32px)', bottom: 'clamp(16px, 3vw, 32px)' }}>
      <Magnetic strength={0.25}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsappFloating.aria}
          className="btn-bounce inline-flex items-center gap-2 font-semibold text-sm text-white rounded-full shadow-lg focus-ring"
          style={{
            background: 'var(--wa-green)',
            padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--wa-green-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--wa-green)')}
        >
          <MessageCircle size={18} strokeWidth={2.2} />
          <span className="hidden sm:inline">{t.whatsappFloating.label}</span>
        </a>
      </Magnetic>
    </div>
  );
}
