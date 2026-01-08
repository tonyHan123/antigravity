import SearchWidget from '@/components/features/SearchWidget';
import ShopCard from '@/components/features/ShopCard';
import { MOCK_SHOPS } from '@/lib/mockData';
import styles from './home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} text-serif`}>
            Unlock Your <br />
            <span className="text-gold">K-Beauty</span> Potential
          </h1>
          <p className={styles.subtitle}>
            Book premium hair, makeup, nail, and spa services <br />
            trusted by celebrities and locals alike.
          </p>

          <div className={styles.searchWrapper}>
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <h2 className={`${styles.sectionTitle} text-serif`}>
          Trending Experiences
        </h2>
        <div className={styles.grid}>
          {MOCK_SHOPS.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
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
