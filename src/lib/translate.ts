// ============================================================
// AUTO-TRANSLATE HELPER
// Dipakai untuk menerjemahkan konten dinamis (dari Supabase, biasanya
// ditulis dalam Bahasa Indonesia) ke Bahasa Inggris secara otomatis
// saat pengunjung memilih bahasa Inggris. Memakai MyMemory Translation
// API (gratis, tanpa API key) dan di-cache di localStorage supaya tidak
// memanggil ulang teks yang sama berkali-kali.
// ============================================================

const CACHE_KEY = 'gz_translate_cache_v1';
const MAX_CACHE_ENTRIES = 500;

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE_ENTRIES) {
      // Buang entri paling lama supaya cache tidak membengkak
      const toDrop = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
      toDrop.forEach((k) => delete cache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage penuh / tidak tersedia — abaikan, tidak fatal
  }
}

/**
 * Terjemahkan teks dari satu bahasa ke bahasa lain.
 * Mengembalikan teks asli apabila gagal (offline, rate-limit, dll)
 * supaya UI tidak pernah kosong/error hanya karena translate gagal.
 */
export async function translateText(
  text: string,
  from: 'id' | 'en',
  to: 'id' | 'en'
): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed || from === to) return text;

  const cache = loadCache();
  const cacheKey = `${from}|${to}|${trimmed}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated: string | undefined = data?.responseData?.translatedText;
    if (translated && typeof translated === 'string' && !translated.startsWith('QUERY LENGTH')) {
      cache[cacheKey] = translated;
      saveCache(cache);
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}
