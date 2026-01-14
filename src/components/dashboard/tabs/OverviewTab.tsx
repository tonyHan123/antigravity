import { Calendar, DollarSign, Star, Users, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';
import { Booking, Shop } from '@/types';

// ============================================
// Overview Tab - Owner Dashboard
// 실제 DB 데이터 표시
// ============================================

interface OverviewTabProps {
    shopId: string;
    shopBookings: Booking[];
    todayBookings: Booking[];
    totalRevenue: number;
    shop: Shop | undefined;
    totalCustomers?: number;
    onTabChange?: (tab: string) => void;
}

export default function OverviewTab({
    shopId,
    shopBookings,
    todayBookings,
    totalRevenue,
    shop,
    totalCustomers = 0,
    onTabChange
}: OverviewTabProps) {

    // Get localized shop name
    const getShopName = () => {
        if (!shop?.name) return 'Shop';
        if (typeof shop.name === 'string') return shop.name;
        return shop.name.en || 'Shop';
    };

    return (
        <div className={styles.contentGrid}>
            {/* Stats Grid */}
            <div className={styles.statsGrid} style={{ gridColumn: '1 / -1', marginBottom: 24 }}>
                {/* Today's Bookings */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e6f7ff', color: '#1890ff' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Today's Bookings</p>
                        <h3 className={styles.statValue}>{todayBookings.length}</h3>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f6ffed', color: '#52c41a' }}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Revenue</p>
                        <h3 className={styles.statValue}>₩{totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Shop Rating */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff7e6', color: '#fa8c16' }}>
                        <Star size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Shop Rating</p>
                        <h3 className={styles.statValue}>
                            {shop?.rating || 0}
                            <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 400 }}>
                                ({shop?.review_count || 0})
                            </span>
                        </h3>
                    </div>
                </div>

                {/* Total Customers */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff0f6', color: '#eb2f96' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Customers</p>
                        <h3 className={styles.statValue}>{totalCustomers}</h3>
                    </div>
                </div>
            </div>

            {/* Upcoming Schedule */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Upcoming Schedule</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTabChange?.('bookings')}
                    >
                        View All
                    </Button>
                </div>
                <div className={styles.bookingList}>
                    {shopBookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className={styles.bookingItem}>
                            <div className={styles.bookingTime}>
                                <Clock size={14} /> {booking.date} {booking.time}
                            </div>
                            <div className={styles.bookingInfo}>
                                <strong>{(booking as any).customerName || 'Customer'}</strong> - {(booking as any).serviceName || 'Service'}
                            </div>
                            <div className={`${styles.status} ${styles[booking.status]}`}>
                                {booking.status}
                            </div>
                        </div>
                    ))}
                    {shopBookings.length === 0 && (
                        <p style={{ color: '#999', padding: '20px 0' }}>No upcoming bookings.</p>
                    )}
                </div>
            </div>

            {/* Side Section */}
            <div className={styles.sideSection}>
                {/* Performance */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3>Performance</h3>
                        <TrendingUp size={16} color="#52c41a" />
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
                        {shopBookings.length > 0
                            ? `You have ${shopBookings.length} total bookings. Keep up the good work!`
                            : 'Start promoting your shop to get more bookings!'}
                    </p>
                </div>

                {/* Messages */}
                <div
                    className={styles.section}
                    style={{ marginTop: 20, cursor: 'pointer' }}
                    onClick={() => onTabChange?.('messages')}
                >
                    <h3>Messages</h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: '1px solid #eee',
                    }}>
                        <MessageSquare size={16} color="#666" />
                        <div>
                            <strong style={{ fontSize: '0.9rem' }}>Click to view messages</strong>
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>Check messages from admin...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
