import { Component, type ReactNode } from 'react';

/**
 * Jaring pengaman terakhir. Kalau ada komponen manapun di bawah pohon ini
 * throw error saat render (bug baru, data dari Supabase yang bentuknya
 * nggak terduga, dll), React defaultnya bakal UNMOUNT SELURUH APLIKASI —
 * hasilnya layar putih blank total tanpa pesan apapun ke user.
 *
 * Dengan ErrorBoundary ini, error ditangkap dan user tetap dikasih tampilan
 * yang jelas + tombol reload, bukan cuma putih kosong yang bikin bingung
 * "ini situsnya rusak atau internetnya yang lemot?".
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: "'Poppins', system-ui, sans-serif",
            background: '#0A0F1C',
            color: '#F8FAFC',
          }}
        >
          <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 380, lineHeight: 1.6 }}>
            Ada yang error pas nampilin halaman ini. Coba muat ulang — kalau masih terjadi, hubungi kami.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ marginTop: 4 }}
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
