'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import fi from '@/translations/fi.json';
import en from '@/translations/en.json';

export type Language = 'fi' | 'en';

const translations: Record<Language, Record<string, string>> = { fi, en };

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fi');

  useEffect(() => {
    const saved = localStorage.getItem('fp-language') as Language | null;
    if (saved === 'fi' || saved === 'en') setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fp-language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] ?? fallback ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
