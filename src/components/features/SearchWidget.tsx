"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/components/providers/LanguageProvider';
import styles from './SearchWidget.module.css';

export default function SearchWidget() {
    const { t } = useLanguage();
    const router = useRouter();
    const [region, setRegion] = useState('');
    const [category, setCategory] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (region) params.append('location', region);
        if (category) params.append('category', category);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className={styles.widget}>
            <div className={styles.field}>
                <div className={styles.label}>
                    <MapPin size={16} /> {t('search.location')}
                </div>
                <select
                    className={styles.select}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                >
                    <option value="">{t('search.anywhere')}</option>
                    <option value="Seoul">Seoul</option>
                    <option value="Busan">Busan</option>
                    <option value="Jeju">Jeju</option>
                    <option value="Incheon">Incheon</option>
                </select>
            </div>

            <div className={styles.divider} />

            <div className={styles.field}>
                <div className={styles.label}>
                    <Sparkles size={16} /> {t('search.service')}
                </div>
                <select
                    className={styles.select}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">{t('search.allServices')}</option>
                    <option value="Hair">{t('search.hairSalon')}</option>
                    <option value="Nail">{t('search.nailArt')}</option>
                    <option value="Massage">{t('search.massageSpa')}</option>
                    <option value="Makeup">{t('search.makeupStyling')}</option>
                </select>
            </div>

            <div className={styles.buttonWrapper}>
                <Button onClick={handleSearch} size="lg">
                    <Search size={20} /> {t('search.searchButton')}
                </Button>
            </div>
        </div>
    );
}
