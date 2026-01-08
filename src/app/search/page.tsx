"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import ShopCard from '@/components/features/ShopCard';
import SearchWidget from '@/components/features/SearchWidget';
import { MOCK_SHOPS } from '@/lib/mockData';
import styles from './search.module.css';

function SearchContent() {
    const searchParams = useSearchParams();
    const region = searchParams.get('region');
    const category = searchParams.get('category');

    const filteredShops = useMemo(() => {
        return MOCK_SHOPS.filter(shop => {
            if (region && shop.region !== region) return false;
            if (category && shop.category !== category) return false;
            return true;
        });
    }, [region, category]);

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <div className={styles.header}>
                <h1 className="text-serif">Find your Beauty Spot</h1>
                <p className={styles.subtitle}>
                    {filteredShops.length} result{filteredShops.length !== 1 ? 's' : ''} found
                    {region && ` in ${region}`}
                    {category && ` for ${category}`}
                </p>
            </div>

            <div className={styles.filterBar}>
                {/* Reusing widget but maybe we modify it later to be horizontal or smaller. 
             For now, just placing it here is fine or we can omit and rely on the header filters. 
             Let's keep it simple for now and rely on "Back to Home" or Navbar to search again, 
             or put the widget here. */ }
            </div>

            {filteredShops.length > 0 ? (
                <div className={styles.grid}>
                    {filteredShops.map((shop) => (
                        <ShopCard key={shop.id} shop={shop} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <h3>No shops found matching your criteria.</h3>
                    <p>Try changing your location or service category.</p>
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
