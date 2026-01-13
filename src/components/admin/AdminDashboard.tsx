'use client';

import { useState } from 'react';
import { LayoutDashboard, Store, Users, ShoppingBag } from 'lucide-react';
import AdminUsersTab from './AdminUsersTab';

// ... (keep existing imports)

export default function AdminDashboard({ user }: { user: any }) {
    // ... (keep state)

    const renderContent = () => {
        switch (activeTab) {
            case 'shops':
                return <AdminShopsTab />;
            case 'users':
                return <AdminUsersTab />;
            default:
                // ... (keep existing overview)

                return (
                    <div>
                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <h3>Total Bookings</h3>
                                <div className={styles.statValue}>{relevantBookings.length}</div>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Est. Revenue</h3>
                                <div className={styles.statValue}>₩{totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Active Shops</h3>
                                <div className={styles.statValue}>{MOCK_SHOPS.length}</div>
                            </div>
                        </div>

                        <div className={styles.section} style={{ marginTop: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>Recent Bookings</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#666' }}>
                                        <th style={{ padding: 12 }}>Date</th>
                                        <th style={{ padding: 12 }}>Customer</th>
                                        <th style={{ padding: 12 }}>Shop</th>
                                        <th style={{ padding: 12 }}>Service</th>
                                        <th style={{ padding: 12 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relevantBookings.slice(0, 10).map(b => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: 12 }}>{b.date}</td>
                                            <td style={{ padding: 12 }}>{b.userId}</td>
                                            <td style={{ padding: 12 }}>{b.shopId}</td>
                                            <td style={{ padding: 12 }}>{b.serviceId}</td>
                                            <td style={{ padding: 12 }}>{b.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Admin Portal</h1>
                    <p className={styles.subtitle}>Welcome, {user.email}</p>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
                        background: activeTab === 'overview' ? '#18181b' : 'transparent', color: activeTab === 'overview' ? 'white' : '#666', border: 'none', cursor: 'pointer'
                    }}
                >
                    <LayoutDashboard size={16} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('shops')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
                        background: activeTab === 'shops' ? '#18181b' : 'transparent', color: activeTab === 'shops' ? 'white' : '#666', border: 'none', cursor: 'pointer'
                    }}
                >
                    <Store size={16} /> Shops
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
                        background: activeTab === 'users' ? '#18181b' : 'transparent', color: activeTab === 'users' ? 'white' : '#666', border: 'none', cursor: 'pointer'
                    }}
                >
                    <Users size={16} /> Users
                </button>
            </div>

            {renderContent()}
        </div>
    );
}
