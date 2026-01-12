"use client";

import { useState } from 'react';
import { Search, Check, X, Settings } from 'lucide-react';
import Button from '../ui/Button';
import { MOCK_SHOPS } from '@/lib/mockData';

export default function ShopManagementList() {
    // In real app, fetch from DB. Mocking 'Pending' shops.
    const [shops, setShops] = useState([
        ...MOCK_SHOPS.map(s => ({ ...s, status: 'Active' })),
        { id: 'new-1', name: 'Gangnam Rising Star', region: 'Gangnam', ownerId: 'temp-1', status: 'Pending', commissionRate: 10 }
    ]);

    const handleApprove = (id: string) => {
        setShops(shops.map(s => s.id === id ? { ...s, status: 'Active' } : s));
    };

    const handleReject = (id: string) => {
        setShops(shops.filter(s => s.id !== id));
    };

    return (
        <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: 24 }}>Partner Shop Management</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: 12, textAlign: 'left' }}>Shop Name</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Region</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Commission</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {shops.map((s: any) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: 12 }}><strong>{s.name}</strong></td>
                            <td style={{ padding: 12 }}>{typeof s.region === 'string' ? s.region : s.region.en}</td>
                            <td style={{ padding: 12 }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    background: s.status === 'Active' ? '#f6ffed' : '#fff7e6',
                                    color: s.status === 'Active' ? '#52c41a' : '#fa8c16',
                                    fontWeight: 600, fontSize: '0.8rem'
                                }}>
                                    {s.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: 12 }}>{s.commissionRate || 10}%</td>
                            <td style={{ padding: 12 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {s.status === 'Pending' ? (
                                        <>
                                            <Button size="sm" onClick={() => handleApprove(s.id)}><Check size={14} /> Approve</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleReject(s.id)}><X size={14} /> Reject</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" variant="outline"><Settings size={14} /> Manage</Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
