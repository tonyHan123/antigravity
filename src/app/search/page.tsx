'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import ShopCardHorizontal from '@/components/features/ShopCardHorizontal';
import SearchWidget from '@/components/features/SearchWidget';
import { getShops, Shop } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

type SortOption = 'recommended' | 'rating' | 'price';

function SearchContent() {
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const locationQuery = searchParams.get('location');
    const { language } = useLanguage();

    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('recommended');

    // Helper to get localized string
    const getL = (obj: { en: string; jp?: string; cn?: string } | string | undefined) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (language === 'jp' && obj.jp) return obj.jp;
        if (language === 'cn' && obj.cn) return obj.cn;
        return obj.en;
    };

    useEffect(() => {
        async function fetchShops() {
            setLoading(true);
            try {
                const data = await getShops({
                    category: categoryQuery || undefined,
                    location: locationQuery || undefined,
                    sort: sortBy,
                });
                setShops(data);
            } catch (error) {
                console.error('Failed to fetch shops:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchShops();
    }, [categoryQuery, locationQuery, sortBy]);

    // Sort shops client-side for immediate feedback
    const sortedShops = [...shops].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'price':
                const priceA = Math.min(...(a.services?.map(s => s.price) || [0]));
                const priceB = Math.min(...(b.services?.map(s => s.price) || [0]));
                return priceA - priceB;
            case 'recommended':
            default:
                if ((b.like_count || 0) !== (a.like_count || 0)) {
                    return (b.like_count || 0) - (a.like_count || 0);
                }
                return b.rating - a.rating;
        }
    });

    // Convert API shop to component format
    const formatShopForCard = (shop: Shop) => ({
        id: shop.id,
        name: getL(shop.name),
        category: shop.category,
        region: getL(shop.region),
        address: getL(shop.address),
        rating: shop.rating,
        reviewCount: shop.review_count,
        likeCount: shop.like_count,
        imageUrl: shop.image_url || '/images/placeholder.jpg',
        images: shop.images,
        services: shop.services?.map(s => ({
            id: s.id,
            name: getL(s.name),
            price: s.price,
            duration: s.duration_min,
        })),
    });

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <header className={styles.header}>
                <h1 className="text-serif">Find Your Beauty Spot</h1>
                <p className={styles.subtitle}>
                    {categoryQuery ? `${categoryQuery} Shops` : 'All Services'}
                    {locationQuery && ` in ${locationQuery}`}
                </p>
            </header>

            <div style={{ marginBottom: '40px' }}>
                <SearchWidget />
            </div>

            {/* Sorting Bar */}
            <div className={styles.sortBar}>
                <button
                    className={`${styles.sortButton} ${sortBy === 'recommended' ? styles.active : ''}`}
                    onClick={() => setSortBy('recommended')}
                >
                    Recommended
                </button>
                <button
                    className={`${styles.sortButton} ${sortBy === 'rating' ? styles.active : ''}`}
                    onClick={() => setSortBy('rating')}
                >
                    Top Rated
                </button>
                <button
                    className={`${styles.sortButton} ${sortBy === 'price' ? styles.active : ''}`}
                    onClick={() => setSortBy('price')}
                >
                    Lowest Price
                </button>
            </div>

            {loading ? (
                <div className={styles.list}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            height: '200px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ))}
                </div>
            ) : (
                <div className={styles.list}>
                    {sortedShops.map(shop => (
                        <ShopCardHorizontal key={shop.id} shop={formatShopForCard(shop)} />
                    ))}
                </div>
            )}

            {!loading && sortedShops.length === 0 && (
                <div className={styles.empty}>
                    <h3>No shops found matching your criteria.</h3>
                    <p>Try adjusting your location or service category.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
