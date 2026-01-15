'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserButton from '@/components/layout/UserButton';
import LanguageSelector from '@/components/features/LanguageSelector';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';
import { CATEGORY_CONFIG } from '@/types';
// Removed lucide import because user requested "no emojis/icons" in navbar

export default function Navbar() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={`${styles.logo} text-serif`}>
                    K-Beauty<span className="text-gold">.</span>
                </Link>

                <div className={styles.links}>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                        const hasSub = config.subcategories.length > 0;
                        const isOpen = openDropdown === key;

                        return (
                            <div
                                key={key}
                                className={styles.menuItem}
                                onMouseEnter={() => setOpenDropdown(key)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    // Clicking Main Category goes to "View All" of that main category
                                    href={`/search?main=${key}`}
                                    className={`${styles.menuLink} ${isOpen ? styles.active : ''}`}
                                >
                                    {config.label}
                                </Link>

                                {hasSub && isOpen && (
                                    <div className={styles.dropdown}>
                                        {config.subcategories.map((sub: string) => (
                                            <Link
                                                key={sub}
                                                href={`/search?main=${key}&sub=${sub}`}
                                                className={styles.dropdownItem}
                                                onClick={() => setOpenDropdown(null)}
                                            >
                                                {sub.charAt(0).toUpperCase() + sub.slice(1)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.actions}>
                    <LanguageSelector />
                    <UserButton />
                    <Link href="/my-page">
                        <Button variant="outline" size="sm">
                            Partner / Admin
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
