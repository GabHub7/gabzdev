import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  fetchProjects,
  fetchTestimonials,
  fetchSkills,
  fetchSocial,
  fetchSocialIcons,
  fetchTrustedBy,
  fetchPackages,
  DEFAULT_PROFILE,
  DEFAULT_SOCIAL,
  type SiteKey,
  type DashProject,
  type DashTestimonial,
  type DashSkill,
  type SocialIcon,
  type TrustedBrand,
  type GabzstorePackage,
} from './storage';

/**
 * ============================================================
 * QUERY KEYS
 * ------------------------------------------------------------
 * Dikumpulin di satu tempat supaya gampang di-invalidate dari
 * panel admin setelah create/update/delete.
 * ============================================================
 */
export const qk = {
  profile: ['profile'] as const,
  social: ['social'] as const,
  projects: (site: SiteKey) => ['projects', site] as const,
  testimonials: (site: SiteKey) => ['testimonials', site] as const,
  skills: (site: SiteKey) => ['skills', site] as const,
  socialIcons: (site: SiteKey) => ['social-icons', site] as const,
  trustedBy: (site: SiteKey) => ['trusted-by', site] as const,
  packages: ['packages'] as const,
};

/**
 * Dipanggil dari panel admin setelah data diubah, biar halaman publik
 * langsung ambil data terbaru tanpa perlu hard refresh.
 */
export function useRefreshSiteData() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

// ============================================================
// PUBLIC READ HOOKS
// ============================================================
export function useProfile() {
  const { data, isLoading } = useQuery({ queryKey: qk.profile, queryFn: fetchProfile });
  return { profile: data ?? DEFAULT_PROFILE, isLoading };
}

export function useSocial() {
  const { data } = useQuery({ queryKey: qk.social, queryFn: fetchSocial });
  return data ?? DEFAULT_SOCIAL;
}

export function useProjects(site: SiteKey = 'gabzdev') {
  const { data, isLoading } = useQuery({ queryKey: qk.projects(site), queryFn: () => fetchProjects(site) });
  return { projects: (data ?? []) as DashProject[], isLoading };
}

export function useTestimonials(site: SiteKey = 'gabzdev') {
  const { data, isLoading } = useQuery({ queryKey: qk.testimonials(site), queryFn: () => fetchTestimonials(site) });
  return { testimonials: (data ?? []) as DashTestimonial[], isLoading };
}

export function useSkills(site: SiteKey = 'gabzdev') {
  const { data, isLoading } = useQuery({ queryKey: qk.skills(site), queryFn: () => fetchSkills(site) });
  return { skills: (data ?? []) as DashSkill[], isLoading };
}

export function useSocialIcons(site: SiteKey = 'gabzdev') {
  const { data } = useQuery({ queryKey: qk.socialIcons(site), queryFn: () => fetchSocialIcons(site) });
  return (data ?? []) as SocialIcon[];
}

export function useTrustedBy(site: SiteKey = 'gabzdev') {
  const { data, isLoading } = useQuery({ queryKey: qk.trustedBy(site), queryFn: () => fetchTrustedBy(site) });
  return { brands: (data ?? []) as TrustedBrand[], isLoading };
}

export function usePackages() {
  const { data, isLoading } = useQuery({ queryKey: qk.packages, queryFn: fetchPackages });
  return { packages: (data ?? []) as GabzstorePackage[], isLoading };
}
