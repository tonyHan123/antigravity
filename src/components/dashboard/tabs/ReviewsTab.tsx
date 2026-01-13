import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';
import { MOCK_REVIEWS } from '@/lib/mockData';
import { Shop } from '@/types';

interface ReviewsTabProps {
    shopId: string;
    shop: Shop | undefined;
}

export default function ReviewsTab({ shopId, shop }: ReviewsTabProps) {
    // Moderation Modal State
    const [moderationModal, setModerationModal] = useState<{ isOpen: boolean, reviewId: string | null }>({ isOpen: false, reviewId: null });
    const [moderationReason, setModerationReason] = useState('');

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Customer Reviews ({MOCK_REVIEWS.filter(r => r.shopId === shopId).length})</h3>
            </div>
            <div className={styles.bookingList}>
                {MOCK_REVIEWS.filter(r => r.shopId === shopId).map(review => (
                    <div key={review.id} style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{review.userName}</span>
                                <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "#ffd700" : "#eee"} color={i < review.rating ? "#ffd700" : "#eee"} />
                                    ))}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#888' }}>{review.date}</span>
                        </div>
                        <p style={{ color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>{review.content}</p>

                        <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c41d7f', marginBottom: '4px' }}>Your Reply:</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{review.reply}</p>
                            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>Replied on {review.replyDate}</p>
                        </div>
                        {review.reply ? (
                            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c41d7f', marginBottom: '4px' }}>Your Reply:</p>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{review.reply}</p>
                                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>Replied on {review.replyDate}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <textarea
                                    placeholder="Write a reply..."
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    rows={2}
                                />
                                <Button size="sm">Reply</Button>
                            </div>
                        )}

                        {/* Moderation Request Status or Button */}
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                            {review.moderationRequest ? (
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: review.moderationRequest.status === 'pending' ? '#faad14' : review.moderationRequest.status === 'rejected' ? '#ff4d4f' : '#52c41a' }}>
                                    Deletion Request: {review.moderationRequest.status.toUpperCase()}
                                </span>
                            ) : (
                                <button
                                    onClick={() => setModerationModal({ isOpen: true, reviewId: review.id })}
                                    style={{ background: 'none', border: 'none', color: '#999', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Request Deletion
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {MOCK_REVIEWS.filter(r => r.shopId === shopId).length === 0 && (
                    <p style={{ color: '#999', padding: '20px' }}>No reviews yet.</p>
                )}
            </div>

            {/* Moderation Request Modal */}
            {moderationModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 400 }}>
                        <h3 style={{ marginBottom: 16 }}>Request Review Deletion</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 12 }}>
                            Please provide a valid reason for requesting deletion (e.g., abusive language, spam, false information).
                        </p>
                        <textarea
                            style={{ width: '100%', height: 100, padding: 8, borderRadius: 4, border: '1px solid #ddd', marginBottom: 16 }}
                            placeholder="Reason for deletion..."
                            value={moderationReason}
                            onChange={(e) => setModerationReason(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button variant="outline" onClick={() => setModerationModal({ isOpen: false, reviewId: null })}>Cancel</Button>
                            <Button onClick={() => {
                                // In a real app, this would call an API
                                alert(`Request sent for review ${moderationModal.reviewId} with reason: ${moderationReason}`);
                                setModerationModal({ isOpen: false, reviewId: null });
                                setModerationReason('');
                            }} disabled={!moderationReason.trim()}>Submit Request</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
