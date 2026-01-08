"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './SearchWidget.module.css';

export default function SearchWidget() {
    const router = useRouter();
    const [region, setRegion] = useState('');
    const [category, setCategory] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (region) params.append('region', region);
        if (category) params.append('category', category);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className={styles.widget}>
            <div className={styles.field}>
                <div className={styles.label}>
                    <MapPin size={16} /> Location
                </div>
                <select
                    className={styles.select}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                >
                    <option value="">Anywhere in Korea</option>
                    <option value="Seoul">Seoul</option>
                    <option value="Busan">Busan</option>
                    <option value="Jeju">Jeju</option>
                    <option value="Incheon">Incheon</option>
                </select>
            </div>

            <div className={styles.divider} />

            <div className={styles.field}>
                <div className={styles.label}>
                    <Sparkles size={16} /> Service
                </div>
                <select
                    className={styles.select}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Services</option>
                    <option value="Hair">Hair Salon</option>
                    <option value="Nail">Nail Art</option>
                    <option value="Massage">Massage & Spa</option>
                    <option value="Makeup">Makeup & Styling</option>
                </select>
            </div>

            <div className={styles.buttonWrapper}>
                <Button onClick={handleSearch} size="lg">
                    <Search size={20} /> Search
                </Button>
            </div>
        </div>
    );
}
