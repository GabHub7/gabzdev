import { supabase } from './supabaseClient';

export type SiteKey = 'gabzdev' | 'gabzstore';

// ============================================================
// ERROR TRACKING — supaya panel admin bisa nunjukin pesan error
// asli dari Supabase ke pengguna, bukan cuma dugaan generik.
// ============================================================
let lastSupabaseError: string | null = null;

function trackError(context: string, message: string) {
  lastSupabaseError = `[${context}] ${message}`;
  console.error(lastSupabaseError);
}

export function getLastSupabaseError(): string | null {
  return lastSupabaseError;
}

// ============================================================
// TYPES
// ============================================================
export interface DashProject {
  id: number;
  site: SiteKey;
  title: string;
  /** @deprecated dipertahankan buat kompatibilitas data lama — pakai `categories`. */
  category: string;
  /** Sampai 3 label kategori, mis. ["School Project", "Client Project"]. */
  categories: string[];
  description: string;
  link: string;
  image_url: string | null;
  sort_order: number;
  /** Kalau true, proyek ini ditampilkan di dashboard/portofolio utama. */
  is_pinned: boolean;
  /** Stack teknologi, mis. ['Next.js', 'TypeScript']. Kosong = nggak nampil. */
  tags: string[];
  /** Angka/statistik singkat, mis. ['39 endpoint', '3 role']. Kosong = nggak nampil. */
  highlights: string[];
  /** Link repository. null/kosong = tombol "Repository" nggak nampil. */
  repo_url: string | null;
  /** Link live demo. null/kosong = tombol "Live Demo" nggak nampil. */
  demo_url: string | null;
}

export interface DashTestimonial {
  id: number;
  site: SiteKey;
  name: string;
  designation: string;
  quote: string;
  rating: number;
  sort_order: number;
  /** Foto profil custom (opsional). Kalau kosong, tampilkan inisial nama. */
  photo_url: string | null;
  /** Nomor WA (format 62xxx tanpa +) — kalau diisi, testimoni bisa diklik untuk chat WA orang ini. */
  whatsapp: string | null;
}

export interface DashSkill {
  id: number;
  site: SiteKey;
  name: string;
  logo_url: string | null;
  sort_order: number;
}

/** Logo brand/klien di section "Dipercaya Oleh". */
export interface TrustedBrand {
  id: number;
  site: SiteKey;
  name: string;
  logo_url: string | null;
  /** Opsional — kalau diisi, logo jadi link ke website klien. */
  url: string | null;
  sort_order: number;
}

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  tiktok: string;
  github: string;
  gmail: string;
}

export interface ProfileData {
  name: string;
  headline: string;
  bio: string;
  photo_url: string | null;
  cv_url: string | null;
  cv_filename: string | null;
}

export interface PackageFeature {
  icon: string;
  text: string;
}

export interface GabzstorePackage {
  id: string;
  title: string;
  badge: string;
  badge_class: string;
  rating: string;
  price: number;
  description: string;
  features: PackageFeature[];
  includes: string[];
  image_url: string | null;
  is_popular: boolean;
  sort_order: number;
}

export interface SocialIcon {
  id: number;
  site: SiteKey;
  label: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
}

export interface GabzstoreSettings {
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  github: string;
  jam_operasional: string;
}

// ============================================================
// DEFAULTS (dipakai kalau data belum sempat termuat / offline)
// ============================================================
export const DEFAULT_SOCIAL: SocialLinks = {
  whatsapp: '08811494688',
  instagram: 'gabzstoreid',
  tiktok: 'gabzstore77',
  github: 'GabHub7',
  gmail: 'gabzstoreid@gmail.com',
};

export const DEFAULT_PROFILE: ProfileData = {
  name: 'Gabriel Gonzales',
  headline: 'Full-Stack Developer & Fullstack Website Builder',
  bio: 'I build production-ready web apps — e-commerce, payment integrations, and internal tools — on Next.js, Supabase, and Firebase. I have shipped projects for clients across Indonesia and abroad, communicate async in English, and ship fast using AI-assisted workflows without cutting corners.',
  photo_url: null,
  cv_url: null,
  cv_filename: null,
};

export const DEFAULT_GABZSTORE_SETTINGS: GabzstoreSettings = {
  whatsapp: '628811494688',
  email: 'gabzstoreid@gmail.com',
  instagram: 'gabzstoreid',
  tiktok: 'gabzstoreid',
  github: 'GabHub7',
  jam_operasional: 'Senin - Minggu: 08.00 - 22.00 WIB',
};

// ============================================================
// PROJECTS
// ============================================================
export async function fetchProjects(site: SiteKey): Promise<DashProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('site', site)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    trackError('fetchProjects', error.message);
    return [];
  }
  return ((data ?? []) as DashProject[]).map((p) => ({
    ...p,
    is_pinned: Boolean(p.is_pinned),
    categories: Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories.slice(0, 3)
      : (p.category ? [p.category] : []),
    tags: Array.isArray(p.tags) ? p.tags : [],
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    repo_url: p.repo_url ?? null,
    demo_url: p.demo_url ?? null,
  }));
}

export async function addProject(site: SiteKey, p: Omit<DashProject, 'id' | 'site'>): Promise<DashProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ site, ...p })
    .select()
    .single();
  if (error) {
    trackError('addProject', error.message);
    return null;
  }
  return data as DashProject;
}

export async function updateProject(id: number, p: Partial<Omit<DashProject, 'id' | 'site'>>): Promise<boolean> {
  const { error } = await supabase.from('projects').update(p).eq('id', id);
  if (error) {
    trackError('updateProject', error.message);
    return false;
  }
  return true;
}

export async function deleteProject(id: number): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    trackError('deleteProject', error.message);
    return false;
  }
  return true;
}

// ============================================================
// TESTIMONIALS
// ============================================================
export async function fetchTestimonials(site: SiteKey): Promise<DashTestimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('site', site)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    trackError('fetchTestimonials', error.message);
    return [];
  }
  return ((data ?? []) as DashTestimonial[]).map((t) => ({
    ...t,
    photo_url: t.photo_url ?? null,
    whatsapp: t.whatsapp ?? null,
  }));
}

export async function addTestimonial(site: SiteKey, t: Omit<DashTestimonial, 'id' | 'site'>): Promise<DashTestimonial | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert({ site, ...t })
    .select()
    .single();
  if (error) {
    trackError('addTestimonial', error.message);
    return null;
  }
  return data as DashTestimonial;
}

export async function updateTestimonial(id: number, t: Partial<Omit<DashTestimonial, 'id' | 'site'>>): Promise<boolean> {
  const { error } = await supabase.from('testimonials').update(t).eq('id', id);
  if (error) {
    trackError('updateTestimonial', error.message);
    return false;
  }
  return true;
}

export async function deleteTestimonial(id: number): Promise<boolean> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) {
    trackError('deleteTestimonial', error.message);
    return false;
  }
  return true;
}

// ============================================================
// SKILLS (carousel keahlian di dashboard utama)
// ============================================================
export async function fetchSkills(site: SiteKey): Promise<DashSkill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('site', site)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    trackError('fetchSkills', error.message);
    return [];
  }
  return (data ?? []) as DashSkill[];
}

export async function addSkill(site: SiteKey, s: Omit<DashSkill, 'id' | 'site'>): Promise<DashSkill | null> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ site, ...s })
    .select()
    .single();
  if (error) {
    trackError('addSkill', error.message);
    return null;
  }
  return data as DashSkill;
}

export async function updateSkill(id: number, s: Partial<Omit<DashSkill, 'id' | 'site'>>): Promise<boolean> {
  const { error } = await supabase.from('skills').update(s).eq('id', id);
  if (error) {
    trackError('updateSkill', error.message);
    return false;
  }
  return true;
}

export async function deleteSkill(id: number): Promise<boolean> {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) {
    trackError('deleteSkill', error.message);
    return false;
  }
  return true;
}

// ============================================================
// TRUSTED BY — logo brand/klien "Dipercaya Oleh"
// ============================================================
export async function fetchTrustedBy(site: SiteKey): Promise<TrustedBrand[]> {
  const { data, error } = await supabase
    .from('trusted_by')
    .select('*')
    .eq('site', site)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    trackError('fetchTrustedBy', error.message);
    return [];
  }
  return ((data ?? []) as TrustedBrand[]).map((b) => ({
    ...b,
    logo_url: b.logo_url ?? null,
    url: b.url ?? null,
  }));
}

export async function addTrustedBrand(site: SiteKey, b: Omit<TrustedBrand, 'id' | 'site'>): Promise<TrustedBrand | null> {
  const { data, error } = await supabase
    .from('trusted_by')
    .insert({ site, ...b })
    .select()
    .single();
  if (error) {
    trackError('addTrustedBrand', error.message);
    return null;
  }
  return data as TrustedBrand;
}

export async function updateTrustedBrand(id: number, b: Partial<Omit<TrustedBrand, 'id' | 'site'>>): Promise<boolean> {
  const { error } = await supabase.from('trusted_by').update(b).eq('id', id);
  if (error) {
    trackError('updateTrustedBrand', error.message);
    return false;
  }
  return true;
}

export async function deleteTrustedBrand(id: number): Promise<boolean> {
  const { error } = await supabase.from('trusted_by').delete().eq('id', id);
  if (error) {
    trackError('deleteTrustedBrand', error.message);
    return false;
  }
  return true;
}

// ============================================================
// PROFILE (singleton, id = 1)
// ============================================================
export async function fetchProfile(): Promise<ProfileData> {
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single();
  if (error || !data) {
    if (error) trackError('fetchProfile', error.message);
    return DEFAULT_PROFILE;
  }
  return {
    name: data.name ?? DEFAULT_PROFILE.name,
    headline: data.headline ?? DEFAULT_PROFILE.headline,
    bio: data.bio ?? DEFAULT_PROFILE.bio,
    photo_url: data.photo_url ?? null,
    cv_url: data.cv_url ?? null,
    cv_filename: data.cv_filename ?? null,
  };
}

export async function saveProfile(p: Partial<ProfileData>): Promise<boolean> {
  const { error } = await supabase.from('profile').upsert({ id: 1, ...p });
  if (error) {
    trackError('saveProfile', error.message);
    return false;
  }
  return true;
}

export async function deleteCV(): Promise<boolean> {
  return saveProfile({ cv_url: null, cv_filename: null });
}

export async function deletePhoto(): Promise<boolean> {
  return saveProfile({ photo_url: null });
}

// ============================================================
// SOCIAL LINKS (singleton, id = 1) — dipakai GabzDev Hero/Footer
// ============================================================
export async function fetchSocial(): Promise<SocialLinks> {
  const { data, error } = await supabase.from('social_links').select('*').eq('id', 1).single();
  if (error || !data) {
    if (error) trackError('fetchSocial', error.message);
    return DEFAULT_SOCIAL;
  }
  return {
    whatsapp: data.whatsapp ?? DEFAULT_SOCIAL.whatsapp,
    instagram: data.instagram ?? DEFAULT_SOCIAL.instagram,
    tiktok: data.tiktok ?? DEFAULT_SOCIAL.tiktok,
    github: data.github ?? DEFAULT_SOCIAL.github,
    gmail: data.gmail ?? DEFAULT_SOCIAL.gmail,
  };
}

export async function saveSocial(s: Partial<SocialLinks>): Promise<boolean> {
  const { error } = await supabase.from('social_links').upsert({ id: 1, ...s });
  if (error) {
    trackError('saveSocial', error.message);
    return false;
  }
  return true;
}

// ============================================================
// SOCIAL ICONS (list custom, per site) — GitHub, LinkedIn, dll
// ============================================================
export async function fetchSocialIcons(site: SiteKey): Promise<SocialIcon[]> {
  const { data, error } = await supabase
    .from('social_icons')
    .select('*')
    .eq('site', site)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    trackError('fetchSocialIcons', error.message);
    return [];
  }
  return (data ?? []) as SocialIcon[];
}

export async function addSocialIcon(site: SiteKey, s: Omit<SocialIcon, 'id' | 'site'>): Promise<SocialIcon | null> {
  const { data, error } = await supabase
    .from('social_icons')
    .insert({ site, ...s })
    .select()
    .single();
  if (error) {
    trackError('addSocialIcon', error.message);
    return null;
  }
  return data as SocialIcon;
}

export async function updateSocialIcon(id: number, s: Partial<Omit<SocialIcon, 'id' | 'site'>>): Promise<boolean> {
  const { error } = await supabase.from('social_icons').update(s).eq('id', id);
  if (error) {
    trackError('updateSocialIcon', error.message);
    return false;
  }
  return true;
}

export async function deleteSocialIcon(id: number): Promise<boolean> {
  const { error } = await supabase.from('social_icons').delete().eq('id', id);
  if (error) {
    trackError('deleteSocialIcon', error.message);
    return false;
  }
  return true;
}

// ============================================================
// GABZSTORE PACKAGES (paket harga)
// ============================================================
export async function fetchPackages(): Promise<GabzstorePackage[]> {
  const { data, error } = await supabase
    .from('gabzstore_packages')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    trackError('fetchPackages', error.message);
    return [];
  }
  return (data ?? []) as GabzstorePackage[];
}

export async function updatePackage(id: string, p: Partial<Omit<GabzstorePackage, 'id'>>): Promise<boolean> {
  const { error } = await supabase.from('gabzstore_packages').update(p).eq('id', id);
  if (error) {
    trackError('updatePackage', error.message);
    return false;
  }
  return true;
}

export async function addPackage(p: GabzstorePackage): Promise<boolean> {
  const { error } = await supabase.from('gabzstore_packages').insert(p);
  if (error) {
    trackError('addPackage', error.message);
    return false;
  }
  return true;
}

export async function deletePackage(id: string): Promise<boolean> {
  const { error } = await supabase.from('gabzstore_packages').delete().eq('id', id);
  if (error) {
    trackError('deletePackage', error.message);
    return false;
  }
  return true;
}

// ============================================================
// GABZSTORE SETTINGS (singleton, id = 1) — kontak landing page
// ============================================================
export async function fetchGabzstoreSettings(): Promise<GabzstoreSettings> {
  const { data, error } = await supabase.from('gabzstore_settings').select('*').eq('id', 1).single();
  if (error || !data) {
    if (error) trackError('fetchGabzstoreSettings', error.message);
    return DEFAULT_GABZSTORE_SETTINGS;
  }
  return {
    whatsapp: data.whatsapp ?? DEFAULT_GABZSTORE_SETTINGS.whatsapp,
    email: data.email ?? DEFAULT_GABZSTORE_SETTINGS.email,
    instagram: data.instagram ?? DEFAULT_GABZSTORE_SETTINGS.instagram,
    tiktok: data.tiktok ?? DEFAULT_GABZSTORE_SETTINGS.tiktok,
    github: data.github ?? DEFAULT_GABZSTORE_SETTINGS.github,
    jam_operasional: data.jam_operasional ?? DEFAULT_GABZSTORE_SETTINGS.jam_operasional,
  };
}

export async function saveGabzstoreSettings(s: Partial<GabzstoreSettings>): Promise<boolean> {
  const { error } = await supabase.from('gabzstore_settings').upsert({ id: 1, ...s });
  if (error) {
    trackError('saveGabzstoreSettings', error.message);
    return false;
  }
  return true;
}
