import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseLangFile } from './parser';

const langFiles = import.meta.glob('./Lang/*.lang', { query: 'raw', import: 'default' });

interface LanguageContextType {
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (code: string) => void;
  loading: boolean;
  currentLang: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [currentLang, setCurrentLang] = useState('english');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSelectedLanguage = async () => {
      setLoading(true);
      try {
        const path = `./Lang/${currentLang}.lang`;
        if (langFiles[path]) {
          const rawContent = (await langFiles[path]()) as string;
          setTranslations(parseLangFile(rawContent));
        } else {
          console.warn(`Language file not found for ${currentLang}`);
        }
      } catch (err) {
        console.error("Could not load language:", currentLang, err);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedLanguage();
  }, [currentLang]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = translations[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ t, setLanguage: setCurrentLang, loading, currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
