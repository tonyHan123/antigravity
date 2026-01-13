'use client';

import { useState } from 'react';
import { MOCK_REVIEWS, MOCK_SHOPS } from '@/lib/mockData';
import Button from '@/components/ui/Button';
import { Check, X, AlertTriangle } from 'lucide-react';

export default function ModerationManager() {
    // Filter reviews with pending moderation requests
    // In a real app, this would be an API call
    const [pendingRequests, setPendingRequests] = useState(
        MOCK_REVIEWS.filter(r => r.moderationRequest?.status === 'pending')
    );

    const handleAction = (reviewId: string, action: 'approve' | 'reject') => {
        // Here we would call API to delete review or update status
        console.log(`Review ${reviewId} moderation action: ${action}`);

        // Optimistic update
        setPendingRequests(prev => prev.filter(r => r.id !== reviewId));
        alert(action === 'approve' ? 'Review deleted and owner notified.' : 'Request rejected and owner notified.');
    };

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
                    {pendingRequests.map(review => {
                        const shop = MOCK_SHOPS.find(s => s.id === review.shopId);
                        return (
                            <div key={review.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Shop: {typeof shop?.name === 'string' ? shop.name : shop?.name.en}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Reviewer: {review.userName} ({review.rating} stars)</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{review.moderationRequest?.requestDate}</div>
                                </div>

                                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.95rem', color: '#444' }}>
                                    "{review.content}"
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fff1f0', padding: '12px', borderRadius: '6px', border: '1px solid #ffccc7' }}>
                                    <AlertTriangle size={16} color="#cf1322" style={{ marginTop: 2 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#cf1322', fontSize: '0.9rem', marginBottom: 4 }}>Reason for Deletion Request:</div>
                                        <p style={{ fontSize: '0.9rem', color: '#434343' }}>{review.moderationRequest?.reason}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
                                        onClick={() => handleAction(review.id, 'reject')}
                                    >
                                        <X size={16} style={{ marginRight: 4 }} /> Reject Request
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAction(review.id, 'approve')}
                                    >
                                        <Check size={16} style={{ marginRight: 4 }} /> Approve Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
