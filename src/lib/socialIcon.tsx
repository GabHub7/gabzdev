import { Github, Instagram, Music2, Mail, Linkedin, Dribbble, ArrowUpRight } from 'lucide-react';

/**
 * Resolver ikon sosmed terpusat — dipakai Hero.tsx & Footer.tsx supaya
 * konsisten. SEBELUMNYA Footer.tsx cuma ngandelin `icon_url` (upload/link
 * manual dari admin) — kalau field itu kosong, yang muncul cuma huruf
 * pertama label (bukan ikon beneran, kadang kelihatan kayak "ikon nggak
 * muncul"). Sekarang: ikon lucide otomatis ke-pilih dari nama platform di
 * `label`, dan `icon_url` cuma jadi override OPSIONAL kalau admin mau pasang
 * logo custom (mis. logo brand yang nggak ada di lucide).
 *
 * Ikonnya langsung dirender lewat if/else (bukan disimpan ke variabel terus
 * dipanggil `<Icon />`), biar nggak kena warning lint "component created
 * during render".
 */
export function SocialGlyph({
  label,
  iconUrl,
  size = 16,
  color = '#3B5FE3',
}: {
  label: string;
  iconUrl?: string | null;
  size?: number;
  color?: string;
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        className="object-contain shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Kalau link/upload custom gagal dimuat, sembunyikan <img> yang
          // gagal daripada nampilin ikon patah/kosong.
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  const l = label.toLowerCase();
  if (l.includes('github')) return <Github size={size} style={{ color }} />;
  if (l.includes('instagram')) return <Instagram size={size} style={{ color }} />;
  if (l.includes('tiktok')) return <Music2 size={size} style={{ color }} />;
  if (l.includes('linkedin')) return <Linkedin size={size} style={{ color }} />;
  if (l.includes('dribbble')) return <Dribbble size={size} style={{ color }} />;
  if (l.includes('mail') || l.includes('gmail') || l.includes('email')) return <Mail size={size} style={{ color }} />;
  if (l.includes('behance')) {
    return (
      <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: size, color, lineHeight: 1 }}>
        Bē
      </span>
    );
  }
  return <ArrowUpRight size={size} style={{ color }} />;
}
