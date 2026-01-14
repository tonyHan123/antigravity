'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ModerationRequest {
    id: string;
    review_id: string;
    shop_id: string;
    requester_id: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviews: {
        id: string;
        rating: number;
        content: string;
        created_at: string;
        profiles: { name: string; email: string } | null;
    } | null;
    shops: {
        id: string;
        name: { en: string; jp?: string; cn?: string } | string;
    } | null;
    requester: {
        email: string;
    } | null;
}

export default function ModerationManager() {
    const [pendingRequests, setPendingRequests] = useState<ModerationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/moderation/reviews');
            if (res.ok) {
                const data = await res.json();
                console.log('Moderation API response:', data);
                setPendingRequests(data.requests || []);
            } else {
                console.error('Failed to fetch:', res.status);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        if (!confirm(action === 'approve' ? 'Approve deletion? This is irreversible.' : 'Reject request?')) return;

        try {
            const res = await fetch(`/api/admin/moderation/reviews/${requestId}/${action}`, {
                method: 'POST'
            });

            if (res.ok) {
                setPendingRequests(prev => prev.filter(r => r.id !== requestId));
                alert(action === 'approve' ? 'Review deleted and request approved.' : 'Request rejected.');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to process request');
            }
        } catch (error) {
            console.error(`Error processing ${action}:`, error);
            alert('Failed to process request');
        }
    };

    const getShopName = (shop: ModerationRequest['shops']) => {
        if (!shop) return 'Unknown Shop';
        if (typeof shop.name === 'string') return shop.name;
        return shop.name?.en || 'Shop';
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading requests...</div>;
    }

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Review Moderation Queue
                {pendingRequests.length > 0 && (
                    <span style={{ background: '#ff4d4f', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                        {pendingRequests.length}
                    </span>
                )}
            </h2>

            {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#f9f9f9', borderRadius: '8px' }}>
                    <Check size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                    <p>No pending moderation requests.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingRequests.map(request => (
                        <div key={request.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Shop: {getShopName(request.shops)}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        Reviewer: {request.reviews?.profiles?.name || 'Anonymous'} ({request.reviews?.rating || 0} stars)
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>
                                        Requested by: {request.requester?.email || 'Unknown'}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#999' }}>
                                    {new Date(request.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.95rem', color: '#444' }}>
                                "{request.reviews?.content || 'No content'}"
                            </div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fff1f0', padding: '12px', borderRadius: '6px', border: '1px solid #ffccc7' }}>
                                <AlertTriangle size={16} color="#cf1322" style={{ marginTop: 2 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#cf1322', fontSize: '0.9rem', marginBottom: 4 }}>Reason for Deletion Request:</div>
                                    <p style={{ fontSize: '0.9rem', color: '#434343' }}>{request.reason}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ borderColor: '#fa5252', color: '#fa5252' }}
                                    onClick={() => handleAction(request.id, 'reject')}
                                >
                                    <X size={16} style={{ marginRight: 4 }} /> Reject Request
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(request.id, 'approve')}
                                >
                                    <Check size={16} style={{ marginRight: 4 }} /> Approve Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
