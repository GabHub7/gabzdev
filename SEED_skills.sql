-- ============================================================
-- SEED: Isi awal Skills Carousel
-- Jalankan SETELAH migrasi MIGRATION_skills.sql.
-- Isinya sengaja dibagi 4 kelompok biar posisi kamu kebaca jelas
-- di mata HR: Web Dev, DevOps, AI Automation, AI Engineering & Data.
--
-- Silakan sunting/hapus baris yang belum sesuai skill kamu -- ini
-- cuma starting point, semuanya tetap bisa diedit lewat panel admin
-- (menu Skills) tanpa perlu SQL lagi setelah ini.
-- ============================================================

insert into public.skills (site, name, logo_url, sort_order) values
  -- Web Development
  ('gabzdev', 'React', 'https://cdn.simpleicons.org/react', 1),
  ('gabzdev', 'Next.js', 'https://cdn.simpleicons.org/nextdotjs', 2),
  ('gabzdev', 'TypeScript', 'https://cdn.simpleicons.org/typescript', 3),
  ('gabzdev', 'Node.js', 'https://cdn.simpleicons.org/nodedotjs', 4),
  ('gabzdev', 'Tailwind CSS', 'https://cdn.simpleicons.org/tailwindcss', 5),
  ('gabzdev', 'Supabase', 'https://cdn.simpleicons.org/supabase', 6),

  -- DevOps & Cloud Infrastructure
  ('gabzdev', 'Docker', 'https://cdn.simpleicons.org/docker', 7),
  ('gabzdev', 'Linux', 'https://cdn.simpleicons.org/linux', 8),
  ('gabzdev', 'Nginx', 'https://cdn.simpleicons.org/nginx', 9),
  ('gabzdev', 'GitHub Actions', 'https://cdn.simpleicons.org/githubactions', 10),
  ('gabzdev', 'Vercel', 'https://cdn.simpleicons.org/vercel', 11),

  -- AI Automation Engineering
  ('gabzdev', 'n8n', 'https://cdn.simpleicons.org/n8n', 12),
  ('gabzdev', 'LangChain', 'https://cdn.simpleicons.org/langchain', 13),
  ('gabzdev', 'OpenAI API', 'https://cdn.simpleicons.org/openai', 14),
  ('gabzdev', 'Zapier', 'https://cdn.simpleicons.org/zapier', 15),

  -- AI Engineering & Data
  ('gabzdev', 'Python', 'https://cdn.simpleicons.org/python', 16),
  ('gabzdev', 'Pandas', 'https://cdn.simpleicons.org/pandas', 17),
  ('gabzdev', 'TensorFlow', 'https://cdn.simpleicons.org/tensorflow', 18),
  ('gabzdev', 'PostgreSQL', 'https://cdn.simpleicons.org/postgresql', 19);
