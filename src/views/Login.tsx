import { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useView } from '../context/ViewContext';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const { setView } = useView();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Masukkan email dan kata sandi terlebih dahulu.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (authError) {
      setError('Email atau kata sandi salah.');
      setPassword('');
      triggerShake();
      inputRef.current?.focus();
      return;
    }

    setView('dashboard');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className={`w-full max-w-sm animate-view-in ${isShaking ? 'animate-shake' : ''}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div
          className="p-8 md:p-10"
          style={{
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(28px) saturate(145%)',
            WebkitBackdropFilter: 'blur(28px) saturate(145%)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px rgba(31,38,135,0.12)',
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(29,78,216,0.06))',
                border: '1px solid rgba(255,255,255,0.55)',
              }}
            >
              <Lock size={24} style={{ color: '#2563EB' }} strokeWidth={1.8} />
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#1E293B' }}>
              Admin Gateway
            </h1>
            <p className="text-sm text-center" style={{ color: '#94A3B8' }}>
              Masuk untuk mengelola GabzDev &amp; GabzStore
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#475569' }}
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="email@kamu.com"
                  autoComplete="username"
                  className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl outline-none transition-all duration-300 focus-ring"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: error ? '1.5px solid #EF4444' : '1.5px solid rgba(255,255,255,0.6)',
                    color: '#1E293B',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                />
                <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#475569' }}
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl outline-none transition-all duration-300 focus-ring"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: error ? '1.5px solid #EF4444' : '1.5px solid rgba(255,255,255,0.6)',
                    color: '#1E293B',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 focus-ring rounded"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword
                    ? <EyeOff size={16} style={{ color: '#94A3B8' }} />
                    : <Eye size={16} style={{ color: '#94A3B8' }} />
                  }
                </button>
              </div>
              {error && (
                <p className="text-xs mt-2 font-medium" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center text-sm py-3.5 focus-ring"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Memverifikasi...
                </span>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setView('portfolio')}
              className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200 hover:text-[#2563EB] focus-ring rounded"
              style={{ color: '#94A3B8' }}
            >
              <ArrowLeft size={14} />
              Kembali ke Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
