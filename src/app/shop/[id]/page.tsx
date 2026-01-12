import { notFound } from 'next/navigation';
import { MapPin, Star, Clock } from 'lucide-react';
import BookingWidget from '@/components/features/BookingWidget';
import CouponItem from '@/components/features/CouponItem';
import { MOCK_SHOPS } from '@/lib/mockData';
import styles from './shop.module.css';

type Props = {
    params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: Props) {
    const { id } = await params;
    const shop = MOCK_SHOPS.find((s) => s.id === id);

    if (!shop) {
        notFound();
    }

    // Helper to safe-render localized strings
    const getL = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.en || val.ko || '';
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.categoryBadge}>{shop.category}</div>
                <h1 className={`${styles.title} text-serif`}>{getL(shop.name)}</h1>
                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <MapPin size={16} /> {getL(shop.address)} ({getL(shop.region)})
                    </div>
                    <div className={styles.metaItem}>
                        <Star size={16} className="text-gold" fill="currentColor" />
                        {shop.rating} ({shop.reviewCount} reviews)
                    </div>
                </div>
            </div>

            <div className={styles.layout}>
                {/* Main Content */}
                <div className={styles.main}>
                    {/* Gallery */}
                    <div className={styles.gallery}>
                        {shop.images.map((img, idx) => (
                            <div key={idx} className={styles.imageItem} style={{ backgroundImage: `url(${img})` }}>
                                {!img && <div className={styles.imageFallback} />}
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>About</h2>
                        <p className={styles.description}>{getL(shop.description)}</p>
                    </section>

                    {/* Services */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Services Menu</h2>
                        {/* ... existing service list ... */}
                        <div className={styles.serviceList}>
                            {shop.services.map((srv) => (
                                <div key={srv.id} className={styles.serviceRow}>
                                    <div className={styles.serviceInfo}>
                                        <div className={styles.serviceName}>{getL(srv.name)}</div>
                                        <div className={styles.serviceDuration}>
                                            <Clock size={12} style={{ marginRight: 4 }} />
                                            {srv.durationMin} mins
                                        </div>
                                    </div>
                                    <div className={styles.servicePrice}>
                                        ₩{srv.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Coupons Section */}
                    {shop.coupons && shop.coupons.length > 0 && (
                        <section className={styles.section} style={{ marginTop: 'var(--spacing-xl)', padding: '24px', background: '#fff0f6', borderRadius: '12px', border: '1px solid #ffd6e7' }}>
                            <h2 className={styles.sectionTitle} style={{ color: '#c41d7f', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: 8 }}>🏷️</span> Special Offers
                            </h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {shop.coupons.map(coupon => (
                                    <CouponItem key={coupon.id} coupon={coupon} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <BookingWidget shopId={shop.id} services={shop.services} />
                </div>
            </div>
        </div>
    );
}
