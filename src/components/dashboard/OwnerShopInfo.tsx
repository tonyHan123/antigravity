'use client';

import { useState } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './OwnerDashboard.module.css';
import { MOCK_SHOPS } from '@/lib/mockData';

export default function OwnerShopInfo({ shopId }: { shopId: string }) {
    const shop = MOCK_SHOPS.find(s => s.id === shopId) || MOCK_SHOPS[0];
    const [coupons, setCoupons] = useState([
        { id: 1, name: 'Summer Special - 10% Off', code: 'SUMMER10', expiry: '2025-08-31', active: true },
        { id: 2, name: 'First Visit Discount', code: 'WELCOME', expiry: '2025-12-31', active: true }
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Basic Info */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Basic Information</h3>
                    <Button size="sm" variant="outline"><Edit2 size={14} style={{ marginRight: 6 }} /> Edit Info</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <ImageIcon size={32} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{typeof shop.name === 'string' ? shop.name : shop.name.en}</h4>
                        <p style={{ color: '#666', marginBottom: 16 }}>{typeof shop.description === 'string' ? shop.description : shop.description.en}</p>
                        <div style={{ fontSize: '0.9rem' }}>
                            <p><strong>Region:</strong> {typeof shop.region === 'string' ? shop.region : shop.region.en}</p>
                            <p><strong>Address:</strong> {typeof shop.address === 'string' ? shop.address : shop.address.en}</p>
                            <p><strong>Category:</strong> {shop.category}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service & Product Management */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Services & Products</h3>
                    <Button size="sm"><Plus size={14} style={{ marginRight: 6 }} /> Add Service</Button>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                    {shop.services.map(service => (
                        <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                            <div>
                                <strong style={{ fontSize: '1.05rem' }}>{typeof service.name === 'string' ? service.name : service.name.en}</strong>
                                <div style={{ color: '#888', fontSize: '0.9rem' }}>{service.duration} mins • {service.category}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>₩{service.price.toLocaleString()}</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ padding: 6, border: 'none', background: '#f0f0f0', borderRadius: 4, cursor: 'pointer' }}><Edit2 size={14} /></button>
                                    <button style={{ padding: 6, border: 'none', background: '#fff1f0', color: '#ff4d4f', borderRadius: 4, cursor: 'pointer' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coupon Management */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Coupon Management</h3>
                    <Button size="sm"><Tag size={14} style={{ marginRight: 6 }} /> Create Coupon</Button>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                    {coupons.map(coupon => (
                        <div key={coupon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #eee', borderRadius: 8, background: coupon.active ? 'white' : '#fafafa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: '#fff7e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fa8c16' }}>
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <strong>{coupon.name}</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Code: {coupon.code} • Expires: {coupon.expiry}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                                    background: coupon.active ? '#f6ffed' : '#f5f5f5', color: coupon.active ? '#52c41a' : '#999'
                                }}>
                                    {coupon.active ? 'ACTIVE' : 'EXPIRED'}
                                </span>
                                <Button size="sm" variant="outline">Manage</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
