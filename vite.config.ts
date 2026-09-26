import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

/**
 * Manual chunk splitting untuk PageSpeed:
 * - vendor React dipisah supaya di-cache sendiri (jarang berubah)
 * - framer-motion (~50KB gz) dipisah, biar update copy nggak invalidate
 * - react-query dipisah (data layer, jarang berubah)
 * - embla dipisah (cuma dipakai di 1 section)
 * Efek: initial bundle turun, browser download parallel, cache lifetime naik.
 */
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: { port: 3000 },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    // Naikkan warning limit karena chunk vendor besar (React+framer+dll)
    // wajar untuk portfolio yang punya banyak fitur. Yang penting sudah split.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('embla-carousel')) return 'vendor-embla';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('lenis')) return 'vendor-lenis';
        },
      },
    },
  },
});
