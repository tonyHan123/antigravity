'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Star, TrendingUp, Settings, MessageSquare, ClipboardList } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './OwnerDashboard.module.css';
import OwnerSchedule from './OwnerSchedule';
import OwnerSettlement from './OwnerSettlement';
import OwnerShopInfo from './OwnerShopInfo';
import OverviewTab from './tabs/OverviewTab';
import ReviewsTab from './tabs/ReviewsTab';
import MessagesTab from './tabs/MessagesTab';
import BookingsTab from './tabs/BookingsTab';
import { getShop, Shop } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

// ============================================
// Owner Dashboard - 실제 DB 연동 버전
// ============================================

interface OwnerBooking {
    id: string;
    user_id: string;
    shop_id: string;
    service_id: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    total_price: number;
    created_at: string;
    profiles?: { name: string; email: string };
    services?: { name: { en: string }; price: number };
}

export default function OwnerDashboard({ shopId }: { shopId: string }) {
    // ============================================
    // State
    // ============================================
    const { user } = useAuth();
    const { totalUnread, newReviews } = useUnreadCounts();

    const [shop, setShop] = useState<Shop | null>(null);
    const [shopBookings, setShopBookings] = useState<OwnerBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'shop' | 'schedule' | 'settlement' | 'reviews' | 'messages'>('overview');

    // ============================================
    // Data Fetching
    // ============================================
    useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch shop details
                const shopData = await getShop(shopId);
                setShop(shopData);

                // 2. Fetch bookings for this shop
                const bookingsRes = await fetch(`/api/owner/bookings?shopId=${shopId}`);
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setShopBookings(data.bookings || []);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [shopId]);

    // ============================================
    // Computed Stats (from real data)
    // ============================================
    const today = new Date().toISOString().split('T')[0];

    // Today's bookings (예약 날짜가 오늘인 것)
    const todayBookings = shopBookings.filter(b => b.date === today && b.status !== 'cancelled');

    // Total revenue (cancelled 제외)
    const totalRevenue = shopBookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

    // Unique customers (중복 제외한 고객 수)
    const uniqueCustomerIds = new Set(shopBookings.filter(b => b.status !== 'cancelled').map(b => b.user_id));
    const totalCustomers = uniqueCustomerIds.size;

    // Upcoming bookings (오늘 이후 예약)
    const upcomingBookings = shopBookings
        .filter(b => b.date >= today && b.status !== 'cancelled')
        .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });

    // Transform for OverviewTab (convert to expected format)
    const transformedBookings = upcomingBookings.map(b => ({
        id: b.id,
        userId: b.user_id,
        shopId: b.shop_id,
        serviceId: b.service_id,
        date: b.date,
        time: b.time,
        status: b.status,
        totalPrice: b.total_price,
        customerName: b.profiles?.name || 'Customer',
        serviceName: b.services?.name?.en || 'Service',
    }));

    // ============================================
    // Tab Content Rendering
    // ============================================
    const renderContent = () => {
        switch (activeTab) {
            case 'bookings': return <BookingsTab shopId={shopId} />;
            case 'shop': return <OwnerShopInfo shopId={shopId} />;
            case 'schedule': return <OwnerSchedule shopId={shopId} />;
            case 'settlement': return <OwnerSettlement />;
            case 'reviews': return <ReviewsTab shopId={shopId} shop={shop as any} />;
            case 'messages': return <MessagesTab shopId={shopId} />;
            default: // 'overview'
                return <OverviewTab
                    shopId={shopId}
                    shopBookings={transformedBookings as any}
                    todayBookings={todayBookings as any}
                    totalRevenue={totalRevenue}
                    shop={shop as any}
                    totalCustomers={totalCustomers}
                    onTabChange={setActiveTab}
                />;
        }
    };

    // ============================================
    // Loading State
    // ============================================
    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    // ============================================
    // Render
    // ============================================
    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Owner Dashboard</h1>
                    <p className={styles.subtitle}>Managing: <strong>{typeof shop?.name === 'string' ? shop.name : shop?.name?.en}</strong></p>
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
                    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <tab.icon size={16} /> {tab.label}
                            {tab.id === 'messages' && totalUnread > 0 && (
                                <span style={{
                                    background: '#ff4d4f', color: '#fff', fontSize: '0.75rem',
                                    fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                    lineHeight: 1
                                }}>
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </span>
                            )}
                            {tab.id === 'reviews' && newReviews > 0 && (
                                <span style={{
                                    background: '#faad14', color: '#fff', fontSize: '0.75rem',
                                    fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                    lineHeight: 1
                                }}>
                                    {newReviews > 99 ? '99+' : newReviews}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
}
