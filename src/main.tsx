import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-photo-view/dist/react-photo-view.css'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { BUILD_VERSION } from './lib/buildInfo'

// eslint-disable-next-line no-console
console.log(`%cGabzDev build: ${BUILD_VERSION}`, 'color:#3B5FE3;font-weight:bold;font-size:12px;');

/**
 * Cache global buat semua data Supabase.
 * staleTime 5 menit = pindah-pindah view (portfolio ↔ semua proyek) nggak
 * nembak Supabase lagi. Hemat kuota free tier + halaman kerasa instan.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
)
