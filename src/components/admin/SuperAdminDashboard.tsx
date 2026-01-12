"use client";

import { useState } from 'react';
import { LayoutDashboard, Users, Store, DollarSign, AlertCircle } from 'lucide-react';
import styles from './SuperAdminDashboard.module.css';
import GlobalOverview from './GlobalOverview';
import UserManagement from './UserManagement';
import ShopManagementList from './ShopManagementList';
import SettlementManager from './SettlementManager';
import ModerationManager from './ModerationManager';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shops' | 'settlement' | 'moderation'>('overview');

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
                    <button className={activeTab === 'moderation' ? styles.active : ''} onClick={() => setActiveTab('moderation')}>
                        <AlertCircle size={18} /> Moderation
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
                    </h1>
                    <div className={styles.userMenu}>Super Admin</div>
                </header>

                <div className={styles.content}>
                    {activeTab === 'overview' && <GlobalOverview />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'shops' && <ShopManagementList />}
                    {activeTab === 'settlement' && <SettlementManager />}
                    {activeTab === 'moderation' && <ModerationManager />}
                </div>
            </main>
        </div>
    );
}
