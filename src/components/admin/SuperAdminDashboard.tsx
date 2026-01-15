"use client";

import { useState } from 'react';
import { LayoutDashboard, Users, Store, DollarSign, AlertCircle } from 'lucide-react';
import styles from './SuperAdminDashboard.module.css';
import GlobalOverview from './GlobalOverview';
import AdminUsersTab from './AdminUsersTab';
import AdminShopsTab from './AdminShopsTab';
import SettlementManager from './SettlementManager';
import ModerationManager from './ModerationManager';
import AdminMessagesTab from './tabs/AdminMessagesTab';

import { useUnreadCounts } from '@/hooks/useUnreadCounts';

export default function SuperAdminDashboard() {
    const { unreadMessages, pendingModeration } = useUnreadCounts();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shops' | 'settlement' | 'moderation' | 'messages'>('overview');

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>ADMIN</h2>
                    <p>Platform Manager</p>
                </div>

                <nav className={styles.nav}>
                    <button className={activeTab === 'overview' ? styles.active : ''} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button className={activeTab === 'users' ? styles.active : ''} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Users
                    </button>
                    <button className={activeTab === 'shops' ? styles.active : ''} onClick={() => setActiveTab('shops')}>
                        <Store size={18} /> Shops
                    </button>
                    <button className={activeTab === 'settlement' ? styles.active : ''} onClick={() => setActiveTab('settlement')}>
                        <DollarSign size={18} /> Settlement
                    </button>
                    <button className={activeTab === 'moderation' ? styles.active : ''} onClick={() => setActiveTab('moderation')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={18} /> Moderation
                        </div>
                        {pendingModeration > 0 && (
                            <span style={{
                                background: '#ff4d4f', color: '#fff', fontSize: '0.75rem',
                                fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                lineHeight: 1
                            }}>
                                {pendingModeration > 99 ? '99+' : pendingModeration}
                            </span>
                        )}
                    </button>
                    <button className={activeTab === 'messages' ? styles.active : ''} onClick={() => setActiveTab('messages')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Store size={18} /> Messages
                        </div>
                        {unreadMessages > 0 && (
                            <span style={{
                                background: '#ff4d4f', color: '#fff', fontSize: '0.75rem',
                                fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                lineHeight: 1
                            }}>
                                {unreadMessages > 99 ? '99+' : unreadMessages}
                            </span>
                        )}
                    </button>
                </nav>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>
                        {activeTab === 'overview' && 'Platform Overview'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'shops' && 'Shop Partners'}
                        {activeTab === 'settlement' && 'Settlement Center'}
                        {activeTab === 'moderation' && 'Content Moderation'}
                        {activeTab === 'messages' && 'Message Center'}
                    </h1>
                    <div className={styles.userMenu}>Super Admin</div>
                </header>

                <div className={styles.content}>
                    {activeTab === 'overview' && <GlobalOverview />}
                    {activeTab === 'users' && <AdminUsersTab />}
                    {activeTab === 'shops' && <AdminShopsTab />}
                    {activeTab === 'settlement' && <SettlementManager />}
                    {activeTab === 'moderation' && <ModerationManager />}
                    {activeTab === 'messages' && <AdminMessagesTab />}
                </div>
            </main>
        </div>
    );
}
