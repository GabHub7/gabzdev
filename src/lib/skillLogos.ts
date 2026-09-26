/**
 * Resolusi logo brand teknologi dari nama skill.
 *
 * Kalau admin nggak mengisi `logo_url`, kita coba tebak logonya dari nama
 * pakai CDN simpleicons (ikon brand resmi, monokrom, tinggal kasih warna).
 * Ini bikin section skill kelihatan clean pakai logo asli — bukan ikon
 * generik — tanpa harus isi URL satu-satu dari dashboard.
 *
 * simpleicons: https://cdn.simpleicons.org/<slug>/<hexcolor>
 */

// nama (lowercase, tanpa spasi/titik/strip) -> slug simpleicons
const SLUG_MAP: Record<string, string> = {
  react: 'react',
  reactjs: 'react',
  nextjs: 'nextdotjs',
  next: 'nextdotjs',
  node: 'nodedotjs',
  nodejs: 'nodedotjs',
  express: 'express',
  expressjs: 'express',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  supabase: 'supabase',
  firebase: 'firebase',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  prisma: 'prisma',
  vercel: 'vercel',
  netlify: 'netlify',
  cloudflare: 'cloudflare',
  figma: 'figma',
  docker: 'docker',
  git: 'git',
  github: 'github',
  vite: 'vite',
  vue: 'vuedotjs',
  vuejs: 'vuedotjs',
  nuxt: 'nuxtdotjs',
  svelte: 'svelte',
  angular: 'angular',
  php: 'php',
  laravel: 'laravel',
  python: 'python',
  django: 'django',
  flask: 'flask',
  fastapi: 'fastapi',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  flutter: 'flutter',
  dart: 'dart',
  kotlin: 'kotlin',
  swift: 'swift',
  redis: 'redis',
  graphql: 'graphql',
  sass: 'sass',
  bootstrap: 'bootstrap',
  jquery: 'jquery',
  webpack: 'webpack',
  babel: 'babel',
  eslint: 'eslint',
  jest: 'jest',
  vitest: 'vitest',
  storybook: 'storybook',
  redux: 'redux',
  zustand: 'reactquery', // tidak ada di simpleicons; fallback
  framermotion: 'framer',
  threejs: 'threedotjs',
  three: 'threedotjs',
  androidstudio: 'androidstudio',
  linux: 'linux',
  ubuntu: 'ubuntu',
  nginx: 'nginx',
  fastify: 'fastify',
  elysia: 'elysia',
  deno: 'deno',
  bun: 'bun',
  astro: 'astro',
  solid: 'solid',
  solidjs: 'solid',
  leptos: 'leptos',
  rocket: 'rust',
  echo: 'go',
  gin: 'go',
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s.\-_/]/g, '');
}

/**
 * Warna default per brand supaya logonya berwarna (bukan flat abu-abu).
 * Kalau nggak ada di sini, dipakai warna aksen situs.
 */
const BRAND_COLOR: Record<string, string> = {
  react: '61DAFB',
  nextdotjs: 'FFFFFF',
  nodedotjs: '5FA04E',
  typescript: '3178C6',
  javascript: 'F7DF1E',
  tailwindcss: '06B6D4',
  supabase: '3FCF8E',
  firebase: 'DD2C00',
  postgresql: '4169E1',
  prisma: 'FFFFFF',
  vercel: 'FFFFFF',
  figma: 'F24E1E',
  docker: '2496ED',
  vite: '646CFF',
  go: '00ADD8',
  rust: 'FFFFFF',
  flutter: '02569B',
  php: '777BB4',
  laravel: 'FF2D20',
  python: '3776AB',
  threedotjs: 'FFFFFF',
  fastify: 'FFFFFF',
};

const ACCENT = '7BA1EC';

/**
 * Kembalikan URL logo untuk sebuah skill. Prioritas:
 *   1. logo_url yang diisi admin
 *   2. logo brand simpleicons berdasarkan nama
 *   3. null (komponen akan render inisial huruf sebagai fallback)
 */
export function resolveSkillLogo(name: string, adminLogoUrl: string | null): string | null {
  if (adminLogoUrl) return adminLogoUrl;
  const slug = SLUG_MAP[normalize(name)];
  if (!slug) return null;
  const color = BRAND_COLOR[slug] ?? ACCENT;
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}
