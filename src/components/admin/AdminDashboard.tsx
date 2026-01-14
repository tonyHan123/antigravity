'use client';

import { useState } from 'react';
import { LayoutDashboard, Store, Users, Shield, MessageCircle } from 'lucide-react';
import AdminUsersTab from './AdminUsersTab';
import AdminShopsTab from './AdminShopsTab';
import ModerationManager from './ModerationManager';
import { MOCK_SHOPS, MOCK_BOOKINGS } from '@/lib/mockData';
import AdminMessagesTab from './tabs/AdminMessagesTab';

export default function AdminDashboard({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Calculate stats from mock data
    const relevantBookings = MOCK_BOOKINGS || [];
    const totalRevenue = relevantBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    const renderContent = () => {
        switch (activeTab) {
            case 'shops':
                return <AdminShopsTab />;
            case 'users':
                return <AdminUsersTab />;
            case 'moderation':
                return <ModerationManager />;
            case 'messages':
                return <AdminMessagesTab />;
            default:
                // Overview
                return (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: 8 }}>Total Bookings</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{relevantBookings.length}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: 8 }}>Est. Revenue</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>₩{totalRevenue.toLocaleString()}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: 8 }}>Active Shops</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{MOCK_SHOPS?.length || 0}</div>
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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

    const tabStyle = (tab: string) => ({
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
        background: activeTab === tab ? '#18181b' : 'transparent',
        color: activeTab === tab ? 'white' : '#666',
        border: 'none', cursor: 'pointer'
    });

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Admin Portal</h1>
                <p style={{ color: '#666' }}>Welcome, {user.email}</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>
                    <LayoutDashboard size={16} /> Overview
                </button>
                <button onClick={() => setActiveTab('shops')} style={tabStyle('shops')}>
                    <Store size={16} /> Shops
                </button>
                <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>
                    <Users size={16} /> Users
                </button>
                <button onClick={() => setActiveTab('moderation')} style={tabStyle('moderation')}>
                    <Shield size={16} /> Moderation
                </button>
                <button onClick={() => setActiveTab('messages')} style={tabStyle('messages')}>
                    <MessageCircle size={16} /> Messages
                </button>
            </div>

            {renderContent()}
        </div>
    );
}
