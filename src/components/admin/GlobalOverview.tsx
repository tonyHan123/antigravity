"use client";

export default function GlobalOverview() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', marginBottom: 8 }}>Total GMV</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₩154,000,000</div>
                <div style={{ color: '#52c41a', fontSize: '0.875rem' }}>+15% vs last month</div>
            </div>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', marginBottom: 8 }}>Net Revenue</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₩15,400,000</div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>10% Commission</div>
            </div>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', marginBottom: 8 }}>Active Users</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12,450</div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>DAU: 3,200</div>
            </div>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', marginBottom: 8 }}>Active Shops</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>85</div>
                <div style={{ color: '#52c41a', fontSize: '0.875rem' }}>Operating Now</div>
            </div>
        </div>
    );
}
