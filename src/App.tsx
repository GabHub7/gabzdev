import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ViewContext, type View } from './context/ViewContext';
import { LanguageProvider } from './context/LanguageContext';
import { supabase } from './lib/supabaseClient';
import Header from './sections/Header';
import Hero from './sections/Hero';
import Packages from './sections/Packages';
import About from './sections/About';
import Footer from './sections/Footer';

// Section di bawah fold — lazy supaya bundle awal (LCP) tetap kecil.
// Struktur baru (5 section + skill stack): Hero -> SkillsCarousel -> About
// -> Packages -> Portfolio -> Footer (Contact + Testimoni digabung).
// StatsBar, AIWorkflow, Services (list lama), WhyHireMe, TrustedBy, dan
// Testimonials yang berdiri sendiri sengaja di-drop dari alur ini.
const SkillsCarousel = lazy(() => import('./sections/SkillsCarousel'));
const Portfolio = lazy(() => import('./sections/Portfolio'));

const AllProjects = lazy(() => import('./views/AllProjects'));

// Panel admin cuma dipakai sama Ciko, jadi dipisah dari bundle utama —
// pengunjung biasa nggak perlu download kode dashboard-nya.
const Login = lazy(() => import('./views/Login'));
const Dashboard = lazy(() => import('./views/Dashboard'));
import ScrollProgress from './components/ScrollProgress';
import SmoothScroll from './components/SmoothScroll';
import LoadingScreen from './components/LoadingScreen';
import WhatsAppFloating from './components/WhatsAppFloating';
import { hasSeenIntro, markIntroSeen } from './lib/intro';

// Kunci rahasia untuk masuk ke gerbang admin lewat link (dipakai oleh GabzStore
// saat tombol brand-nya diklik 3x). Bukan satu-satunya proteksi -- proteksi
// sesungguhnya tetap password Supabase Auth di halaman Login.
const ADMIN_ENTRY_PARAM = 'gx';
const ADMIN_ENTRY_VALUE = 'gz774';

// Lenis cuma untuk halaman publik (portfolio & projects) — bukan dashboard,
// biar scroll di form admin tetap native dan nggak "ketahan" momentum.
function SmoothScrollGate({ view, children }: { view: View; children: React.ReactNode }) {
  if (view === 'portfolio' || view === 'projects') {
    return <SmoothScroll>{children}</SmoothScroll>;
  }
  return <>{children}</>;
}

export default function App() {
  const [view, setView] = useState<View>('portfolio');
  const [booting, setBooting] = useState(true);
  // Intro cuma diputar sekali per sesi browser.
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  const finishIntro = useCallback(() => {
    markIntroSeen();
    setShowIntro(false);
  }, []);

  useEffect(() => {
    // 1) Cek trigger rahasia dari URL (dipakai saat redirect dari GabzStore)
    const params = new URLSearchParams(window.location.search);
    const hasSecretEntry = params.get(ADMIN_ENTRY_PARAM) === ADMIN_ENTRY_VALUE;
    if (hasSecretEntry) {
      // Bersihkan URL supaya jejaknya hilang dari address bar / history
      params.delete(ADMIN_ENTRY_PARAM);
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '') + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }

    // 2) Cek apakah sudah ada sesi admin aktif (biar gak logout tiap refresh)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setView('dashboard');
      } else if (hasSecretEntry) {
        setView('login');
      }
      setBooting(false);
    });

    // 3) Dengerin perubahan auth (logout dari tombol dashboard, dsb)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setView((v) => (v === 'dashboard' ? 'portfolio' : v));
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (booting) return null;

  // Intro sengaja dilewati kalau langsung masuk ke area admin.
  const introVisible = showIntro && (view === 'portfolio' || view === 'projects');

  return (
    <ViewContext.Provider value={{ view, setView }}>
      <LanguageProvider>
        <AnimatePresence>
          {introVisible && <LoadingScreen key="intro" onDone={finishIntro} />}
        </AnimatePresence>
        <ScrollProgress />
        {(view === 'portfolio' || view === 'projects') && <Header hideWordmark={introVisible} />}
        {(view === 'portfolio' || view === 'projects') && <WhatsAppFloating />}
        <SmoothScrollGate view={view}>
        <div key={view} className="animate-view-in">
          {view === 'portfolio' && (
            <div className="relative min-h-[100dvh]">
              <div className="relative z-10">
                <main>
                  {/* Fold pertama — eager, jadi LCP cepat */}
                  <Hero />
                  {/* Di bawah fold — lazy. Fallback dikasih minHeight supaya
                      layout nggak "jumping" pas chunk masuk (CLS = 0). */}
                  <Suspense fallback={<div style={{ minHeight: 200 }} />}>
                    <SkillsCarousel />
                  </Suspense>
                  <About />
                  <Packages />
                  <Suspense fallback={<div style={{ minHeight: 400 }} />}>
                    <Portfolio />
                  </Suspense>
                </main>
                <Footer />
              </div>
            </div>
          )}
          {view === 'projects' && (
            <div className="relative min-h-[100dvh]">
              <div className="relative z-10">
                <main>
                  <Suspense fallback={<div style={{ minHeight: 600 }} />}>
                    <AllProjects />
                  </Suspense>
                </main>
                <Footer />
              </div>
            </div>
          )}
          {(view === 'login' || view === 'dashboard') && (
            <Suspense fallback={<div className="min-h-[100dvh]" />}>
              {view === 'login' ? <Login /> : <Dashboard />}
            </Suspense>
          )}
        </div>
        </SmoothScrollGate>
      </LanguageProvider>
    </ViewContext.Provider>
  );
}
