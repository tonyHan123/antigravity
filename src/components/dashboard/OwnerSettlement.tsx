'use client';

import { DollarSign, Download, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './OwnerDashboard.module.css';

export default function OwnerSettlement() {
    const settlements = [
        { id: 1, date: '2025-05-15', amount: 1250000, status: 'Completed', commission: 125000 },
        { id: 2, date: '2025-05-08', amount: 980000, status: 'Completed', commission: 98000 },
        { id: 3, date: '2025-05-01', amount: 1450000, status: 'Completed', commission: 145000 },
    ];

    const upcoming = { amount: 450000, date: '2025-05-22' };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Settlement & Revenue</h3>
                <Button variant="outline" size="sm"><Download size={16} style={{ marginRight: 6 }} /> Export Report</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div style={{ padding: 20, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                    <h4 style={{ color: '#389e0d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DollarSign size={18} /> Next Payout
                    </h4>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#237804' }}>
                        ₩{upcoming.amount.toLocaleString()}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#52c41a', marginTop: 4 }}>Scheduled for {upcoming.date}</p>
                </div>
                <div style={{ padding: 20, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
                    <h4 style={{ color: '#096dd9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={18} /> Monthly Revenue (May)
                    </h4>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0050b3' }}>
                        ₩3,680,000
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#1890ff', marginTop: 4 }}>+12% vs last month</p>
                </div>
            </div>

            <h4>Settlement History</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Gross Amount</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Platform Fee (10%)</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Net Payout</th>
                        <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {settlements.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: 12 }}>{item.date}</td>
                            <td style={{ padding: 12 }}>₩{item.amount.toLocaleString()}</td>
                            <td style={{ padding: 12, color: '#fa5252' }}>-₩{item.commission.toLocaleString()}</td>
                            <td style={{ padding: 12, fontWeight: 700 }}>₩{(item.amount - item.commission).toLocaleString()}</td>
                            <td style={{ padding: 12 }}>
                                <span style={{ padding: '4px 8px', borderRadius: 4, background: '#f6ffed', color: '#52c41a', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
