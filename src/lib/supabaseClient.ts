import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set. ' +
    'Copy .env.example ke .env dan isi dengan kredensial project Supabase kamu ' +
    '(atau di Vercel: Project Settings > Environment Variables).'
  );
}

// PENTING: createClient() dipanggil di top-level module (bukan di dalam
// function/komponen), jadi kalau dikasih URL kosong/invalid dia THROW
// SECARA SINKRON saat file ini pertama kali di-import — sebelum React
// sempat render apapun sama sekali. Hasilnya: layar putih blank total,
// tanpa error yang kelihatan di UI, padahal build Vite-nya sendiri sukses
// (karena build nggak ngejalanin kode browser ini). Fallback ke URL
// placeholder yang VALID (bukan string kosong) di sini mencegah crash itu
// — query ke Supabase tetap gagal kalau env var beneran belum diisi,
// tapi minimal situsnya tetap render, bukan blank total.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'public-anon-key-placeholder';

export const supabase = createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** Nama bucket storage yang dipakai untuk semua upload (foto, gambar proyek, CV). */
export const MEDIA_BUCKET = 'gabz-media';

/** Upload file ke storage, return public URL-nya. */
export async function uploadMedia(file: File, folder: 'profile' | 'projects' | 'cv' | 'packages' | 'social' | 'skills' | 'trusted'): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
