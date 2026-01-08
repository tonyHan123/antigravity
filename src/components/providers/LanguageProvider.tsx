"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
    getL: (localized: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('app_language') as Language;
        if (saved && ['en', 'jp', 'cn', 'id', 'hi'].includes(saved)) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = (translations as any)[language];

        for (const key of keys) {
            if (current && current[key]) {
                current = current[key];
            } else {
                return path; // Fallback to key if not found
            }
        }
        return current;
    };

    const getL = (localized: any): string => {
        if (!localized) return '';
        if (typeof localized === 'string') return localized;
        return localized[language] || localized['en'] || Object.values(localized)[0] as string || '';
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
