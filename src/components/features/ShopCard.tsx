'use client';

import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { Shop } from '@/types';
import styles from './ShopCard.module.css';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ShopCardProps {
    shop: Shop;
}

export default function ShopCard({ shop }: ShopCardProps) {
    const { getL } = useLanguage();

    return (
        <Link href={`/shop/${shop.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <div className={styles.placeholderImage} style={{ backgroundImage: `url(${shop.imageUrl})` }}>
                    {/* Fallback color if image fails to load/is placeholder */}
                    {!shop.imageUrl && <div className={styles.imageFallback} />}
                </div>
                <div className={styles.badge}>{shop.category}</div>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{getL(shop.name)}</h3>
                    <div className={styles.rating}>
                        <Star size={14} fill="currentColor" className="text-gold" />
                        <span>{shop.rating}</span>
                        <span className={styles.reviews}>({shop.reviewCount})</span>
                    </div>
                </div>

                <div className={styles.meta}>
                    <MapPin size={14} />
                    <span>{getL(shop.region)}</span>
                </div>

                <p className={styles.description}>{getL(shop.description)}</p>

                <div className={styles.footer}>
                    <span className={styles.price}>From ₩{shop.services[0]?.price.toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
}
