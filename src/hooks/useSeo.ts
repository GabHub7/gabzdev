import { useEffect } from 'react';
import type { ProfileData } from '../lib/storage';

/** Nama lengkap buat hasil pencarian Google. Dipakai biar judul/description yang
 * di-update lewat JS (setelah data Supabase kebaca) NGGAK nimpa nama lengkap
 * yang udah ada di index.html jadi cuma "Gabriel Gonzales". */
const SEO_FULL_NAME = 'Gabriel Lalchand Ghonzales';

/**
 * Sinkronkan <title> dan meta description dengan data profile dari Supabase.
 * index.html sudah punya default statis yang bagus (untuk first paint /
 * crawler yang gak jalanin JS), hook ini cuma nge-update begitu data asli
 * kepanggil — jadi kalau nama/headline diganti dari dashboard, tab browser
 * dan preview link ikut berubah tanpa perlu edit index.html manual.
 */
export function useSeo(profile: ProfileData) {
  useEffect(() => {
    if (!profile.name) return;

    const alias = profile.name && !profile.name.includes('Lalchand') ? ` (${profile.name})` : '';
    const title = `${SEO_FULL_NAME}${alias} | ${profile.headline || 'Web Developer & AI Engineer'} - GabzDev`;
    document.title = title;

    const desc = profile.bio
      ? `${SEO_FULL_NAME}${alias}, known online as GabzDev. ${profile.bio}`
      : undefined;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    if (desc) {
      setMeta('meta[name="description"]', 'content', desc);
      setMeta('meta[property="og:description"]', 'content', desc);
      setMeta('meta[name="twitter:description"]', 'content', desc);
    }
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[name="twitter:title"]', 'content', title);
  }, [profile.name, profile.headline, profile.bio]);
}
