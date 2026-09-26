import { useEffect } from 'react';
import type { ProfileData } from '../lib/storage';

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

    const title = `${profile.name} (GabzDev) | ${profile.headline || 'Full-Stack Developer Portfolio'}`;
    document.title = title;

    const desc = profile.bio
      ? `${profile.name}, known online as GabzDev / GabzStore. ${profile.bio}`
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
