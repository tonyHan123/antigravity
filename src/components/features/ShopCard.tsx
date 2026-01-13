'use client';

import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import styles from './ShopCard.module.css';
import LikeButton from './LikeButton';

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        category: string;
        region: string;
        rating: number;
        reviewCount: number;
        imageUrl: string;
        priceRange?: string;
        description?: string;
    };
}

export default function ShopCard({ shop }: ShopCardProps) {
    return (
        <Link href={`/shop/${shop.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <div className={styles.placeholderImage} style={{ backgroundImage: `url(${shop.imageUrl})` }}>
                    {!shop.imageUrl && <div className={styles.imageFallback} />}
                </div>
                <div className={styles.badge}>{shop.category}</div>
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
