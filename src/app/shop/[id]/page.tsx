import { notFound } from 'next/navigation';
import { MapPin, Star, Clock } from 'lucide-react';
import BookingWidget from '@/components/features/BookingWidget';
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

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.categoryBadge}>{shop.category}</div>
                <h1 className={`${styles.title} text-serif`}>{shop.name}</h1>
                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <MapPin size={16} /> {shop.address} ({shop.region})
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
                        <p className={styles.description}>{shop.description}</p>
                    </section>

                    {/* Services */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Services Menu</h2>
                        <div className={styles.serviceList}>
                            {shop.services.map((srv) => (
                                <div key={srv.id} className={styles.serviceRow}>
                                    <div className={styles.serviceInfo}>
                                        <div className={styles.serviceName}>{srv.name}</div>
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
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <BookingWidget shopId={shop.id} services={shop.services} />
                </div>
            </div>
        </div>
    );
}
