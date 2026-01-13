import { Calendar, DollarSign, Star, Users, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';
import { Booking, Shop } from '@/types';

interface OverviewTabProps {
    shopId: string;
    shopBookings: Booking[];
    todayBookings: Booking[];
    totalRevenue: number;
    shop: Shop | undefined;
}

export default function OverviewTab({ shopId, shopBookings, todayBookings, totalRevenue, shop }: OverviewTabProps) {
    return (
        <div className={styles.contentGrid}>
            {/* Stats Grid - Moved inside Overview */}
            <div className={styles.statsGrid} style={{ gridColumn: '1 / -1', marginBottom: 24 }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e6f7ff', color: '#1890ff' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Today's Bookings</p>
                        <h3 className={styles.statValue}>{todayBookings.length}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f6ffed', color: '#52c41a' }}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Revenue</p>
                        <h3 className={styles.statValue}>₩{totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff7e6', color: '#fa8c16' }}>
                        <Star size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Shop Rating</p>
                        <h3 className={styles.statValue}>{shop?.rating} <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 400 }}>({shop?.reviewCount})</span></h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff0f6', color: '#eb2f96' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Customers</p>
                        <h3 className={styles.statValue}>154</h3>
                    </div>
                </div>
            </div>

            {/* Upcoming Schedule */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Upcoming Schedule</h3>
                    <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className={styles.bookingList}>
                    {shopBookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className={styles.bookingItem}>
                            <div className={styles.bookingTime}>
                                <Clock size={14} /> {booking.date} {booking.time}
                            </div>
                            <div className={styles.bookingInfo}>
                                <strong>Visitor</strong> - Service ID: {booking.serviceId}
                            </div>
                            <div className={`${styles.status} ${styles[booking.status]}`}>
                                {booking.status}
                            </div>
                        </div>
                    ))}
                    {shopBookings.length === 0 && <p style={{ color: '#999' }}>No upcoming bookings.</p>}
                </div>
            </div>

            {/* Recent Activity / Notifications */}
            <div className={styles.sideSection}>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3>Performance</h3>
                        <TrendingUp size={16} color="#52c41a" />
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
                        Your shop views increased by <strong>12%</strong> this week. Keep up the good work!
                    </p>
                </div>
                <div className={styles.section} style={{ marginTop: 20 }}>
                    <h3>Messages</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
                        <MessageSquare size={16} color="#666" />
                        <div>
                            <strong style={{ fontSize: '0.9rem' }}>Admin</strong>
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>Please update your business...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
