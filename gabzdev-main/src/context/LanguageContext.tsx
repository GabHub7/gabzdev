import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'id';

const STORAGE_KEY = 'gz_lang';

interface LanguageContextType {
  language: Lang;
  setLanguage: (l: Lang) => void;
}

// Default bahasa: Inggris
export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>('en');

  // Muat preferensi bahasa yang tersimpan (kalau ada)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'id') {
        setLanguageState(saved);
      }
    } catch {
      // localStorage tidak tersedia — tetap pakai default 'en'
    }
  }, []);

  const setLanguage = (l: Lang) => {
    setLanguageState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // abaikan
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
