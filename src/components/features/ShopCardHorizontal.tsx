import Link from 'next/link';
import { Star, MapPin, ThumbsUp } from 'lucide-react';
import styles from './ShopCardHorizontal.module.css';
import Button from '@/components/ui/Button';
import LikeButton from './LikeButton';

interface ShopCardHorizontalProps {
    shop: {
        id: string;
        name: string;
        category: string;
        region: string;
        address?: string;
        rating: number;
        reviewCount: number;
        likeCount?: number;
        imageUrl: string;
        images?: string[];
        description?: string;
        services?: { id: string; name: string; price: number; duration?: number }[];
    };
}

export default function ShopCardHorizontal({ shop }: ShopCardHorizontalProps) {
    const prices = shop.services?.map(s => s.price) || [];
    const hasPrices = prices.length > 0;
    const minPrice = hasPrices ? Math.min(...prices) : 0;
    const originalPrice = hasPrices ? Math.round(minPrice * 1.2) : 0;

    return (
        <Link href={`/shop/${shop.id}`} className={styles.card}>
            {/* Left: Image */}
            <div className={styles.imageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shop.imageUrl} alt={shop.name} className={styles.image} />
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                    <LikeButton shopId={shop.id} variant="mini" />
                </div>
            </div>

            {/* Content Wrapper */}
            <div className={styles.content}>
                {/* Center: Info */}
                <div className={styles.infoSection}>
                    <div className={styles.header}>
                        <span className={styles.category}>{shop.category} • {shop.region}</span>
                        <h3 className={styles.name}>{shop.name}</h3>
                    </div>

                    <div className={styles.meta}>
                        <div className={styles.rating}>
                            <Star size={16} className={styles.star} />
                            <span>{shop.rating}</span>
                            <span className={styles.reviewCount}>({shop.reviewCount} reviews)</span>
                        </div>
                        <div className={styles.location}>
                            <MapPin size={14} />
                            <span>{shop.region}</span>
                        </div>
                    </div>

                    {/* Social Proof / Trust Badge */}
                    <div className={styles.trustBadge}>
                        <ThumbsUp size={14} />
                        {(shop.likeCount || 0) > 0 ? `${shop.likeCount} people liked this` : 'Newly added'}
                    </div>

                    {shop.description && (
                        <p className={styles.description}>{shop.description}</p>
                    )}
                </div>

                {/* Right: Action & Price */}
                <div className={styles.actionSection}>
                    {/* Review Badge (Agoda Style) */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                        <div className={styles.reviewBadge}>
                            <span className={styles.reviewScore}>{shop.rating}</span>
                            <span className={styles.reviewLabel}>
                                {shop.rating >= 4.8 ? 'Excellent' : shop.rating >= 4.5 ? 'Very Good' : 'Good'}
                            </span>
                        </div>
                    </div>

                    <div style={{ width: '100%' }}>
                        <div className={styles.priceSection}>
                            {hasPrices ? (
                                <>
                                    <span className={styles.originalPrice}>₩{originalPrice.toLocaleString()}</span>
                                    <span className={styles.price}>₩{minPrice.toLocaleString()}</span>
                                    <span className={styles.priceLabel}>per person</span>
                                </>
                            ) : (
                                <span className={styles.price} style={{ fontSize: '1.2rem' }} >View Details</span>
                            )}
                        </div>
                        <div className={styles.button}>
                            <Button size="sm" fullWidth>Check Availability</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
