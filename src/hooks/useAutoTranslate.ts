import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../lib/translate';

/**
 * Menerjemahkan teks dinamis (dari database, biasanya berbahasa Indonesia)
 * secara otomatis ke Bahasa Inggris saat bahasa situs di-set ke "en".
 * Saat bahasa "id", teks asli langsung ditampilkan tanpa panggilan API.
 */
export function useAutoTranslate(text: string): string {
  const { language } = useLanguage();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    setDisplay(text);
    if (language !== 'en' || !text || !text.trim()) return;

    let cancelled = false;
    translateText(text, 'id', 'en').then((translated) => {
      if (!cancelled) setDisplay(translated);
    });
    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return language === 'id' ? text : display;
}
