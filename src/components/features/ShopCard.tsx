'use client';

import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import styles from './ShopCard.module.css';
import LikeButton from './LikeButton';
import { CATEGORY_CONFIG } from '@/types';

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        category: string;
        mainCategory?: string;
        subCategory?: string;
        main_category?: string;
        sub_category?: string;
        region: string;
        rating: number;
        reviewCount: number;
        imageUrl: string;
        priceRange?: string;
        description?: string;
    };
}

export default function ShopCard({ shop }: ShopCardProps) {
    // Determine category label
    const main = shop.mainCategory || shop.main_category;
    const sub = shop.subCategory || shop.sub_category;
    let categoryDisplay = shop.category;

    if (main && CATEGORY_CONFIG[main as keyof typeof CATEGORY_CONFIG]) {
        const config = CATEGORY_CONFIG[main as keyof typeof CATEGORY_CONFIG];
        categoryDisplay = config.label;
        if (sub) {
            categoryDisplay += ` › ${sub.charAt(0).toUpperCase() + sub.slice(1)}`;
        }
    }

    return (
        <Link href={`/shop/${shop.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <div className={styles.placeholderImage} style={{ backgroundImage: `url(${shop.imageUrl})` }}>
                    {!shop.imageUrl && <div className={styles.imageFallback} />}
                </div>
                <div className={styles.badge}>{categoryDisplay}</div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <LikeButton shopId={shop.id} variant="mini" />
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{shop.name}</h3>
                    <div className={styles.rating}>
                        <Star size={14} fill="currentColor" className="text-gold" />
                        <span>{shop.rating}</span>
                        <span className={styles.reviews}>({shop.reviewCount})</span>
                    </div>
                </div>

                <div className={styles.meta}>
                    <MapPin size={14} />
                    <span>{shop.region}</span>
                </div>

                {shop.description && (
                    <p className={styles.description}>{shop.description}</p>
                )}

                <div className={styles.footer}>
                    <span className={styles.price}>{shop.priceRange || 'From ₩50,000'}</span>
                </div>
            </div>
        </Link>
    );
}
