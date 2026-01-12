"use client";

export default function SettlementManager() {
    return (
        <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3>Settlement Center (Super Admin)</h3>
                    <p style={{ color: '#666' }}>Reconcile payments and process payouts to shops.</p>
                </div>
                <button style={{ padding: '8px 16px', background: '#1890ff', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600 }}>Process All Pending</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 4 }}>Total Pending Payouts</h4>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fa8c16' }}>₩12,450,000</div>
                </div>
                <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 4 }}>Platform Fee Revenue (May)</h4>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#52c41a' }}>₩1,245,000</div>
                </div>
                <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 4 }}>Refunds Processed</h4>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ff4d4f' }}>₩320,000</div>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: 12 }}>Date</th>
                        <th style={{ textAlign: 'left', padding: 12 }}>Shop Name</th>
                        <th style={{ textAlign: 'left', padding: 12 }}>Type</th>
                        <th style={{ textAlign: 'left', padding: 12 }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>2025-05-12</td>
                        <td style={{ padding: 12 }}>Jenny House Premium</td>
                        <td style={{ padding: 12 }}>Payout</td>
                        <td style={{ padding: 12, fontWeight: 600 }}>₩1,250,000</td>
                        <td style={{ padding: 12 }}><span style={{ color: '#fa8c16', background: '#fff7e6', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>Pending</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>2025-05-12</td>
                        <td style={{ padding: 12 }}>Sulwhasoo Spa</td>
                        <td style={{ padding: 12 }}>Payout</td>
                        <td style={{ padding: 12, fontWeight: 600 }}>₩980,000</td>
                        <td style={{ padding: 12 }}><span style={{ color: '#fa8c16', background: '#fff7e6', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>Pending</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>2025-05-11</td>
                        <td style={{ padding: 12 }}>Customer #4421</td>
                        <td style={{ padding: 12 }}>Refund</td>
                        <td style={{ padding: 12, fontWeight: 600, color: '#ff4d4f' }}>-₩85,000</td>
                        <td style={{ padding: 12 }}><span style={{ color: '#52c41a', background: '#f6ffed', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>Completed</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
