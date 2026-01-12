'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Star, Users, Clock, Settings, MessageSquare, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MOCK_BOOKINGS, MOCK_SHOPS } from '@/lib/mockData';
import styles from './OwnerDashboard.module.css';
import OwnerSchedule from './OwnerSchedule';
import OwnerSettlement from './OwnerSettlement';
import OwnerShopInfo from './OwnerShopInfo';

export default function OwnerDashboard({ shopId }: { shopId: string }) {
    const shop = MOCK_SHOPS.find(s => s.id === shopId) || MOCK_SHOPS[0];
    const shopBookings = MOCK_BOOKINGS.filter(b => b.shopId === shopId);

    // State for tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'schedule' | 'settlement' | 'reviews' | 'messages'>('overview');

    // Calculate basic stats (Hoisted for access in overview)
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = shopBookings.filter(b => b.date === today);
    const totalRevenue = shopBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Dynamic Content Rendering
    const renderContent = () => {
        switch (activeTab) {
            case 'shop': return <OwnerShopInfo shopId={shopId} />;
            case 'schedule': return <OwnerSchedule />;
            case 'settlement': return <OwnerSettlement />;
            case 'reviews': return <div className={styles.section}><h3>Reviews Implementation</h3><p>Coming in next step...</p></div>; // Placeholder
            case 'messages': return <div className={styles.section}><h3>Messages Implementation</h3><p>Coming in next step...</p></div>; // Placeholder
            default: // 'overview'
                return (
                    <div className={styles.contentGrid}>
                        {/* Stats Grid - Moved inside Overview */}
                        <div className={styles.statsGrid} style={{ gridColumn: '1 / -1', marginBottom: 24 }}>
                            {/* ... existing stat cards ... */}
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
                            {/* ... existing schedule list ... */}
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
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Owner Dashboard</h1>
                    <p className={styles.subtitle}>Managing: <strong>{(shop && typeof shop.name === 'string') ? shop.name : shop?.name?.en}</strong></p>
                </div>
                <div className={styles.actions}>
                    <Button variant="outline" size="sm">
                        <Settings size={16} style={{ marginRight: 6 }} /> Settings
                    </Button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #eee', overflowX: 'auto' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'shop', label: 'Shop Info', icon: Settings },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
                    { id: 'settlement', label: 'Settlement', icon: DollarSign },
                    { id: 'reviews', label: 'Reviews', icon: Star },
                    { id: 'messages', label: 'Messages', icon: MessageSquare },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 16px', borderRadius: 8,
                            border: 'none', background: activeTab === tab.id ? '#18181b' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#666',
                            fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
}
