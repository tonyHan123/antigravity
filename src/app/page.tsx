'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchWidget from '@/components/features/SearchWidget';
import ShopCard from '@/components/features/ShopCard';
import { getShops, Shop } from '@/lib/api';
import styles from './home.module.css';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Home() {
  const { t, language } = useLanguage();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      try {
        const data = await getShops({ sort: 'rating' });
        setShops(data);
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  // Helper to get localized string
  const getLocalizedName = (name: { en: string; jp?: string; cn?: string }) => {
    if (language === 'jp' && name.jp) return name.jp;
    if (language === 'cn' && name.cn) return name.cn;
    return name.en;
  };

  // Convert API shop to component format
  const formatShopForCard = (shop: Shop) => ({
    id: shop.id,
    name: getLocalizedName(shop.name),
    category: shop.category,
    region: getLocalizedName(shop.region),
    rating: shop.rating,
    reviewCount: shop.review_count,
    imageUrl: shop.image_url || '/images/placeholder.jpg',
    priceRange: shop.services?.[0]?.price
      ? `₩${shop.services[0].price.toLocaleString()}~`
      : '₩50,000~',
  });

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} text-serif`} style={{ whiteSpace: 'pre-line' }}>
            {t('home.hero.title')}
          </h1>
          <p className={styles.subtitle} style={{ whiteSpace: 'pre-line' }}>
            {t('home.hero.subtitle')}
          </p>

          <div className={styles.searchWrapper}>
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <h2 className={`${styles.sectionTitle} text-serif`}>
          {t('home.trendingTitle')}
        </h2>
        <div className={styles.categoryGrid}>
          {/* Hair */}
          <Link href="/search?category=Hair" className={styles.categoryCard}>
            <div className={styles.categoryImage} style={{ backgroundImage: "url('/images/hair-1.jpg')" }} />
            <div className={styles.categoryOverlay}>
              <h3 className={styles.categoryTitle}>{t('navbar.hair')}</h3>
            </div>
          </Link>

          {/* Nail */}
          <Link href="/search?category=Nail" className={styles.categoryCard}>
            <div className={styles.categoryImage} style={{ backgroundImage: "url('/images/nail-1.jpg')" }} />
            <div className={styles.categoryOverlay}>
              <h3 className={styles.categoryTitle}>{t('navbar.nail')}</h3>
            </div>
          </Link>

          {/* Massage */}
          <Link href="/search?category=Massage" className={styles.categoryCard}>
            <div className={styles.categoryImage} style={{ backgroundImage: "url('/images/spa-1.jpg')" }} />
            <div className={styles.categoryOverlay}>
              <h3 className={styles.categoryTitle}>{t('navbar.massage')}</h3>
            </div>
          </Link>

          {/* Makeup */}
          <Link href="/search?category=Makeup" className={styles.categoryCard}>
            <div className={styles.categoryImage} style={{ backgroundImage: "url('/images/makeup-1.jpg')" }} />
            <div className={styles.categoryOverlay}>
              <h3 className={styles.categoryTitle}>{t('navbar.makeup')}</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Recommended Shops Section */}
      <section className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)', paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className={`${styles.sectionTitle} text-serif`} style={{ marginBottom: 0 }}>
            {t('home.recommendedTitle') || 'Guest Favorites'}
          </h2>
          <Link href="/search?sort=recommended" className="text-primary text-hover-underline" style={{ fontWeight: 500 }}>
            View All
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: '280px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                animation: 'pulse 1.5s infinite'
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {shops
              .filter(s => s.rating >= 4.5)
              .slice(0, 4)
              .map(shop => (
                <ShopCard key={shop.id} shop={formatShopForCard(shop)} />
              ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={`${styles.sectionTitle} text-serif`} style={{ textAlign: 'center' }}>
            Why K-Beauty Platform?
          </h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <h3>Global Standard</h3>
              <p>English-friendly shops carefully selected for international visitors.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>Transparent Pricing</h3>
              <p>No hidden fees. What you see is what you pay.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>Instant Booking</h3>
              <p>Secure your spot in real-time without phone calls.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
