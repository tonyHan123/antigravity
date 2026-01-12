"use client";

export default function GlobalOverview() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Main Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ color: '#666', marginBottom: 8 }}>Total GMV</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₩154,000,000</div>
                    <div style={{ color: '#52c41a', fontSize: '0.875rem' }}>+15% vs last month</div>
                </div>
                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ color: '#666', marginBottom: 8 }}>Platform Revenue</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₩15,400,000</div>
                    <div style={{ color: '#999', fontSize: '0.875rem' }}>10% Platform Fee</div>
                </div>
                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ color: '#666', marginBottom: 8 }}>Active Users</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12,450</div>
                    <div style={{ color: '#999', fontSize: '0.875rem' }}>DAU: 3,200 / MAU: 11,500</div>
                </div>
                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ color: '#666', marginBottom: 8 }}>Active Shops</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>85</div>
                    <div style={{ color: '#52c41a', fontSize: '0.875rem' }}>Conversion Rate: 2.4%</div>
                </div>
            </div>

            {/* Geographical Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ marginBottom: 16 }}>Users by Country</h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🇺🇸 USA</span> <span style={{ fontWeight: 'bold' }}>4,200 (33%)</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3 }}><div style={{ width: '33%', height: '100%', background: '#1890ff', borderRadius: 3 }}></div></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🇯🇵 Japan</span> <span style={{ fontWeight: 'bold' }}>3,800 (30%)</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3 }}><div style={{ width: '30%', height: '100%', background: '#1890ff', borderRadius: 3 }}></div></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🇨🇳 China</span> <span style={{ fontWeight: 'bold' }}>2,100 (17%)</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3 }}><div style={{ width: '17%', height: '100%', background: '#1890ff', borderRadius: 3 }}></div></div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ marginBottom: 16 }}>Sales by Owner Region</h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gangnam</span> <span style={{ fontWeight: 'bold' }}>₩85,000,000</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3 }}><div style={{ width: '60%', height: '100%', background: '#52c41a', borderRadius: 3 }}></div></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Hongdae</span> <span style={{ fontWeight: 'bold' }}>₩42,000,000</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3 }}><div style={{ width: '30%', height: '100%', background: '#52c41a', borderRadius: 3 }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
