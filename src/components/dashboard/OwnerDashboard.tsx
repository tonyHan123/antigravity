import { useState } from 'react';
import { Calendar, DollarSign, Star, TrendingUp, Settings, MessageSquare, ClipboardList } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MOCK_BOOKINGS, MOCK_SHOPS } from '@/lib/mockData';
import styles from './OwnerDashboard.module.css';
import OwnerSchedule from './OwnerSchedule';
import OwnerSettlement from './OwnerSettlement';
import OwnerShopInfo from './OwnerShopInfo';
import OverviewTab from './tabs/OverviewTab';
import ReviewsTab from './tabs/ReviewsTab';
import MessagesTab from './tabs/MessagesTab';
import BookingsTab from './tabs/BookingsTab';

export default function OwnerDashboard({ shopId }: { shopId: string }) {
    const shop = MOCK_SHOPS.find(s => s.id === shopId) || MOCK_SHOPS[0];
    const shopBookings = MOCK_BOOKINGS.filter(b => b.shopId === shopId);

    // State for tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'shop' | 'schedule' | 'settlement' | 'reviews' | 'messages'>('overview');

    // Calculate basic stats (Hoisted for access in overview)
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = shopBookings.filter(b => b.date === today);
    const totalRevenue = shopBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Dynamic Content Rendering
    const renderContent = () => {
        switch (activeTab) {
            case 'bookings': return <BookingsTab shopId={shopId} />;
            case 'shop': return <OwnerShopInfo shopId={shopId} />;
            case 'schedule': return <OwnerSchedule />;
            case 'settlement': return <OwnerSettlement />;
            case 'reviews': return <ReviewsTab shopId={shopId} shop={shop} />;
            case 'messages': return <MessagesTab shopId={shopId} />;
            default: // 'overview'
                return <OverviewTab
                    shopId={shopId}
                    shopBookings={shopBookings}
                    todayBookings={todayBookings}
                    totalRevenue={totalRevenue}
                    shop={shop}
                />;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Owner Dashboard</h1>
                    <p className={styles.subtitle}>Managing: <strong>{(shop && typeof shop.name === 'string') ? shop.name : (shop?.name as any)?.en}</strong></p>
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
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
}
