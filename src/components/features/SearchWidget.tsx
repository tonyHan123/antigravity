"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Sparkles, ChevronDown, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { CATEGORY_CONFIG } from '@/types';
import styles from './SearchWidget.module.css';

const LOCATIONS = ['Seoul', 'Busan', 'Jeju', 'Incheon'];

export default function SearchWidget() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [region, setRegion] = useState('');
    const [service, setService] = useState('');

    // Custom Dropdown State
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isServiceOpen, setIsServiceOpen] = useState(false);

    const locationRef = useRef<HTMLDivElement>(null);
    const serviceRef = useRef<HTMLDivElement>(null);

    const locationParam = searchParams.get('location');
    const mainParam = searchParams.get('main');
    const subParam = searchParams.get('sub');

    // Sync state with URL params when they change
    useEffect(() => {
        setRegion(locationParam || '');

        if (mainParam && subParam) {
            setService(`${mainParam}:${subParam}`);
        } else if (mainParam) {
            setService(mainParam);
        } else {
            setService('');
        }
    }, [locationParam, mainParam, subParam]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setIsLocationOpen(false);
            }
            if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
                setIsServiceOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to get display label for selected service
    const getServiceLabel = () => {
        if (!service) return t('search.allServices');

        if (service.includes(':')) {
            const [, sub] = service.split(':');
            return sub.charAt(0).toUpperCase() + sub.slice(1);
        }

        // It's a main category key
        const config = CATEGORY_CONFIG[service as keyof typeof CATEGORY_CONFIG];
        return config ? config.label : service;
    };

    const handleSelectService = (value: string) => {
        setService(value);
        setIsServiceOpen(false);
    };

    const handleSelectLocation = (value: string) => {
        setRegion(value);
        setIsLocationOpen(false);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (region) params.append('location', region);

        if (service) {
            if (service.includes(':')) {
                const [main, sub] = service.split(':');
                params.append('main', main);
                params.append('sub', sub);
            } else {
                params.append('main', service);
            }
        }

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className={styles.widget}>
            {/* Location Dropdown */}
            <div
                className={styles.field}
                ref={locationRef}
                style={{ zIndex: isLocationOpen ? 20 : 1 }}
            >
                <div className={styles.label}>
                    <MapPin size={16} /> {t('search.location')}
                </div>

                <div
                    className={styles.trigger}
                    onClick={() => { setIsLocationOpen(!isLocationOpen); setIsServiceOpen(false); }}
                    style={{ cursor: 'pointer' }}
                >
                    <span className={!region ? styles.placeholder : ''}>
                        {region || t('search.anywhere')}
                    </span>
                    <ChevronDown size={16} color="#999" />
                </div>

                {isLocationOpen && (
                    <div className={styles.dropdown}>
                        <div
                            className={`${styles.mainOption} ${region === '' ? styles.selected : ''}`}
                            onClick={() => handleSelectLocation('')}
                        >
                            {t('search.anywhere')}
                            {region === '' && <Check size={16} />}
                        </div>

                        {LOCATIONS.map(loc => (
                            <div
                                key={loc}
                                className={`${styles.option} ${region === loc ? styles.selected : ''}`}
                                onClick={() => handleSelectLocation(loc)}
                            >
                                {loc}
                                {region === loc && <Check size={16} style={{ marginLeft: 'auto' }} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.divider} />

            {/* Service Dropdown */}
            <div
                className={styles.field}
                ref={serviceRef}
                style={{ zIndex: isServiceOpen ? 20 : 1 }}
            >
                <div className={styles.label}>
                    <Sparkles size={16} /> {t('search.service')}
                </div>

                <div
                    className={styles.trigger}
                    onClick={() => { setIsServiceOpen(!isServiceOpen); setIsLocationOpen(false); }}
                    style={{ cursor: 'pointer' }}
                >
                    <span className={!service ? styles.placeholder : ''}>
                        {getServiceLabel()}
                    </span>
                    <ChevronDown size={16} color="#999" />
                </div>

                {/* Dropdown Menu */}
                {isServiceOpen && (
                    <div className={styles.dropdown}>
                        <div
                            className={`${styles.mainOption} ${service === '' ? styles.selected : ''}`}
                            onClick={() => handleSelectService('')}
                        >
                            {t('search.allServices')}
                            {service === '' && <Check size={16} />}
                        </div>

                        {Object.entries(CATEGORY_CONFIG).map(([mainKey, config]) => {
                            const hasSubs = config.subcategories.length > 0;

                            if (hasSubs) {
                                // Group with Subcategories (K-Beauty, Health)
                                return (
                                    <div key={mainKey} className={styles.dropdownGroup}>
                                        <div className={styles.groupTitle}>{config.label}</div>
                                        {config.subcategories.map((sub: string) => {
                                            const value = `${mainKey}:${sub}`;
                                            const isSelected = service === value;
                                            return (
                                                <div
                                                    key={sub}
                                                    className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => handleSelectService(value)}
                                                >
                                                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                                                    {isSelected && <Check size={16} style={{ marginLeft: 'auto' }} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            } else {
                                // Single Main Category (Skin & Laser, Tourism, Stay)
                                const isSelected = service === mainKey;
                                return (
                                    <div key={mainKey} className={styles.dropdownGroup}>
                                        <div
                                            className={`${styles.mainOption} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => handleSelectService(mainKey)}
                                        >
                                            {config.label}
                                            {isSelected && <Check size={16} />}
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>

            <div className={styles.buttonWrapper}>
                <Button onClick={handleSearch} size="lg">
                    <Search size={20} /> {t('search.searchButton')}
                </Button>
            </div>
        </div>
    );
}
