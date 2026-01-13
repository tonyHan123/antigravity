'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { MapPin, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BookingWidget from '@/components/features/BookingWidget';
import CouponItem from '@/components/features/CouponItem';
import { getShop, Shop } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';
import LikeButton from '@/components/features/LikeButton';
import styles from './shop.module.css';

type Props = {
    params: Promise<{ id: string }>;
}

export default function ShopPage({ params }: Props) {
    const { id } = use(params);
    const { language, t } = useLanguage();
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Helper to get localized string
    const getL = (obj: { en: string; jp?: string; cn?: string } | string | undefined) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (language === 'jp' && obj.jp) return obj.jp;
        if (language === 'cn' && obj.cn) return obj.cn;
        return obj.en;
    };

    useEffect(() => {
        async function fetchShop() {
            try {
                const data = await getShop(id);
                setShop(data);
            } catch (err) {
                console.error('Failed to fetch shop:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchShop();
    }, [id]);

    if (loading) {
        return (
            <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
                <div style={{ height: '300px', background: 'var(--bg-secondary)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            </div>
        );
    }

    if (error || !shop) {
        notFound();
    }

    const shopName = getL(shop.name);

    // Format services for BookingWidget
    const formattedServices = shop.services?.map(srv => ({
        id: srv.id,
        name: getL(srv.name),
        durationMin: srv.duration_min,
        price: srv.price,
    })) || [];

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.categoryBadge}>{shop.category}</div>
                <h1 className={`${styles.title} text-serif`}>{shopName}</h1>
                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <MapPin size={16} /> {getL(shop.address)} ({getL(shop.region)})
                    </div>
                    <div className={styles.metaItem}>
                        <Star size={16} className="text-gold" fill="currentColor" />
                        <Link href={`/shop/${shop.id}/reviews`} className="text-hover-underline" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'none' }}>
                            {shop.rating} (<span style={{ textDecoration: 'underline' }}>{shop.review_count} {t('shop.reviews')}</span>)
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.layout}>
                {/* Main Content */}
                <div className={styles.main}>
                    {/* Gallery Carousel */}
                    <div className={styles.gallery} style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                            <LikeButton shopId={shop.id} variant="mini" />
                        </div>

                        {/* Render Images */}
                        {(() => {
                            const allImages = shop.images && shop.images.length > 0
                                ? shop.images
                                : [shop.image_url || '/images/placeholder.jpg'];

                            const visibleImages = allImages.slice(currentImageIndex, currentImageIndex + 4);
                            const hasNext = currentImageIndex + 4 < allImages.length;
                            const hasPrev = currentImageIndex > 0;

                            return (
                                <>
                                    {visibleImages.map((img, idx) => (
                                        <div key={`${currentImageIndex}-${idx}`} className={styles.imageItem} style={{ backgroundImage: `url(${img})` }}>
                                            {!img && <div className={styles.imageFallback} />}
                                        </div>
                                    ))}

                                    {/* Navigation Arrows */}
                                    {hasPrev && (
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 4))}
                                            style={{
                                                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                                                width: 40, height: 40, cursor: 'pointer', zIndex: 20,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            ←
                                        </button>
                                    )}
                                    {hasNext && (
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => Math.min(prev + 4, allImages.length - 1))}
                                            style={{
                                                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                                                width: 40, height: 40, cursor: 'pointer', zIndex: 20,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            →
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Description */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('shop.about')}</h2>
                        <p className={styles.description}>{getL(shop.description)}</p>
                    </section>

                    {/* Services */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('shop.servicesMenu')}</h2>
                        <div className={styles.serviceList}>
                            {shop.services?.map((srv) => (
                                <div key={srv.id} className={styles.serviceRow}>
                                    <div className={styles.serviceInfo}>
                                        <div className={styles.serviceName}>{getL(srv.name)}</div>
                                        <div className={styles.serviceDuration}>
                                            <Clock size={12} style={{ marginRight: 4 }} />
                                            {srv.duration_min} {t('shop.mins')}
                                        </div>
                                    </div>
                                    <div className={styles.servicePrice}>
                                        ₩{srv.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Coupons Section (Special Offers) */}
                    {shop.coupons && shop.coupons.length > 0 && (
                        <section className={styles.section} style={{ marginTop: 'var(--spacing-xl)', padding: '24px', background: '#fff0f6', borderRadius: '12px', border: '1px solid #ffd6e7' }}>
                            <h2 className={styles.sectionTitle} style={{ color: '#c41d7f', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: 8 }}>🏷️</span> {t('shop.specialOffers')}
                            </h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {shop.coupons.map(coupon => (
                                    <CouponItem key={coupon.id} coupon={{
                                        id: coupon.id,
                                        code: coupon.code,
                                        discountType: coupon.discount_type,
                                        discountValue: coupon.discount_value,
                                        minPurchase: coupon.min_purchase,
                                        validUntil: coupon.valid_until,
                                    }} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section id="reviews" className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{t('shop.reviews')} ({shop.review_count})</h2>
                            <Link href={`/shop/${shop.id}/reviews`}>
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {shop.reviews?.slice(0, 2).map((review) => (
                                <div key={review.id} style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 600 }}>{review.profiles?.name || 'Anonymous'}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "#ffd700" : "#eee"} color={i < review.rating ? "#ffd700" : "#eee"} />
                                        ))}
                                    </div>
                                    <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {review.content}
                                    </p>
                                </div>
                            ))}

                            {(!shop.reviews || shop.reviews.length === 0) && (
                                <p style={{ color: '#888', textAlign: 'center', padding: '24px' }}>No reviews yet.</p>
                            )}

                            {shop.reviews && shop.reviews.length > 0 && (
                                <Link href={`/shop/${shop.id}/reviews`} style={{ textAlign: 'center', display: 'block', marginTop: 12, color: '#c41d7f', fontWeight: 500 }}>
                                    See all {shop.review_count} reviews
                                </Link>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <BookingWidget shopId={shop.id} services={formattedServices} />
                </div>
            </div>
        </div>
    );
}
