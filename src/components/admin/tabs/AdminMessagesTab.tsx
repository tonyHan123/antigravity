import { useState } from 'react';
import { MOCK_SHOPS, MOCK_MESSAGES } from '@/lib/mockData';

export default function AdminMessagesTab() {
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

    // Get list of shops that have messages or just all shops
    const uniqueShopIds = Array.from(new Set(MOCK_MESSAGES.map((m: any) => m.shopId)));

    const getShopName = (shop: any) => {
        if (!shop) return 'Unknown Shop';
        if (typeof shop.name === 'string') return shop.name;
        // @ts-ignore
        return shop.name.en || Object.values(shop.name)[0] || 'Shop';
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '24px' }}>
            {/* Sidebar (Shop List) */}
            <div style={{ width: '300px', background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 600 }}>Inboxes</div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {uniqueShopIds.map((shopId: any) => {
                        const shop = MOCK_SHOPS.find((s: any) => s.id === shopId);
                        const lastMsg = MOCK_MESSAGES.filter((m: any) => m.shopId === shopId).pop();
                        return (
                            <div
                                key={shopId}
                                onClick={() => setSelectedShopId(shopId)}
                                style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: selectedShopId === shopId ? '#f0f5ff' : 'white'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                                    {getShopName(shop)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {lastMsg?.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedShopId ? (
                    <>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                            Chat with {getShopName(MOCK_SHOPS.find((s: any) => s.id === selectedShopId))}
                        </div>
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {MOCK_MESSAGES.filter((m: any) => m.shopId === selectedShopId).map((msg: any) => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: msg.sender === 'admin' ? '#722ed1' : 'white',
                                    color: msg.sender === 'admin' ? 'white' : '#333',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.content}</p>
                                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', textAlign: 'right' }}>
                                        {msg.timestamp.split(' ')[1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Type a reply..."
                                style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                            <button style={{ padding: '8px 16px', background: '#722ed1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Send</button>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        Select a shop to view messages
                    </div>
                )}
            </div>
        </div>
    );
}
