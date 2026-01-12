'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { Globe } from 'lucide-react';
import styles from './LanguageSelector.module.css';
import { useState, useRef, useEffect } from 'react';
import { Language } from '@/types';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'jp', label: '日本語', flag: '🇯🇵' },
        { code: 'cn', label: '中文', flag: '🇨🇳' },
        { code: 'id', label: 'Bahasa', flag: '🇮🇩' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ];

    const currentLang = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.button}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select Language"
            >
                <span className={styles.flag}>{currentLang.flag}</span>
                <span className={styles.label}>{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`${styles.option} ${language === lang.code ? styles.active : ''}`}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                        >
                            <span className={styles.flag}>{lang.flag}</span>
                            <span className={styles.label}>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
