'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';

interface Review {
    id: string;
    user_id: string;
    shop_id: string;
    booking_id: string | null;
    rating: number;
    content: string;
    owner_reply: string | null;
    reply_at: string | null;
    created_at: string;
    profiles?: { name: string; email: string };
    bookings?: { date: string; time: string; services?: { name: { en: string } } };
    moderation_request?: { id: string; status: 'pending' | 'approved' | 'rejected'; reason: string };
}

interface ReviewsTabProps {
    shopId: string;
}

const ITEMS_PER_PAGE = 10;

export default function ReviewsTab({ shopId }: ReviewsTabProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch reviews on mount
    useEffect(() => {
        async function loadReviews() {
            try {
                const res = await fetch('/api/owner/reviews');
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.reviews || []);
                }
            } catch (error) {
                console.error('Failed to load reviews:', error);
            } finally {
                setLoading(false);
            }
        }
        loadReviews();
    }, []);

    // Pagination Logic
    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
    const currentReviews = reviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedReviews);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedReviews(newSet);
    };

    const handleSubmitReply = async (reviewId: string) => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${shopId}/${reviewId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(prev => prev.map(r =>
                    r.id === reviewId
                        ? { ...r, owner_reply: data.review.owner_reply, reply_at: data.review.reply_at }
                        : r
                ));
                setReplyingTo(null);
                setReplyText('');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit reply');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            alert('Failed to submit reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateReply = async (reviewId: string) => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${shopId}/${reviewId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(prev => prev.map(r =>
                    r.id === reviewId
                        ? { ...r, owner_reply: data.review.owner_reply, reply_at: data.review.reply_at }
                        : r
                ));
                setReplyingTo(null);
                setReplyText('');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update reply');
            }
        } catch (error) {
            console.error('Error updating reply:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;

        try {
            const res = await fetch(`/api/reviews/${shopId}/${reviewId}/reply`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setReviews(prev => prev.map(r =>
                    r.id === reviewId
                        ? { ...r, owner_reply: null, reply_at: null }
                        : r
                ));
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const [reportingId, setReportingId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState('');

    const handleReport = async (reviewId: string) => {
        if (!reportReason.trim()) return;

        try {
            const res = await fetch(`/api/reviews/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, reason: reportReason, shopId })
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(prev => prev.map(r =>
                    r.id === reviewId
                        ? { ...r, moderation_request: data.request }
                        : r
                ));
                setReportingId(null);
                setReportReason('');
                alert('Deletion request submitted.');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error reporting review:', error);
            alert('Failed to submit request');
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading reviews...</div>;
    }

    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reviews ({reviews.length})</h3>
            </div>

            <div>
                {currentReviews.map((review) => {
                    const isExpanded = expandedReviews.has(review.id);
                    const isLongContent = review.content.length > 120;
                    const displayContent = !isLongContent || isExpanded
                        ? review.content
                        : review.content.slice(0, 120) + '...';

                    // Check if already reported
                    const hasPendingRequest = review.moderation_request?.status === 'pending';

                    return (
                        <div key={review.id} style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
                            {/* Review Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 600, color: '#666'
                                    }}>
                                        {(review.profiles?.name || 'A').charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                            {review.profiles?.name || 'Anonymous'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>Reviews {review.rating}</span>
                                            <span>•</span>
                                            <span>{formatDate(review.created_at)}</span>
                                            {review.bookings && (
                                                <>
                                                    <span>•</span>
                                                    <span>{review.bookings.date} Visit</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                    {/* Report Button / Status */}
                                    {hasPendingRequest ? (
                                        <span style={{ fontSize: '0.75rem', color: '#fa5252', background: '#fff5f5', padding: '2px 8px', borderRadius: 4 }}>
                                            Deletion Requested
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setReportingId(review.id)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: '#ccc', display: 'flex', alignItems: 'center'
                                            }}
                                            title="Request Deletion"
                                        >
                                            <AlertTriangle size={16} />
                                        </button>
                                    )}

                                    <div style={{ display: 'flex', gap: '2px', marginLeft: 8 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < review.rating ? "#ffd700" : "#eee"}
                                                color={i < review.rating ? "#ffd700" : "#eee"}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Report Input Area */}
                            {reportingId === review.id && (
                                <div style={{
                                    margin: '12px 0 12px 44px', padding: '12px', background: '#fff1f0',
                                    borderRadius: '8px', border: '1px solid #ffccc7'
                                }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#cf1322' }}>
                                        Request Review Deletion
                                    </div>
                                    <textarea
                                        placeholder="Please provide a reason for deletion..."
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        style={{
                                            width: '100%', padding: '8px', border: '1px solid #ffccc7',
                                            borderRadius: '4px', fontSize: '0.9rem', marginBottom: 8,
                                            height: 60
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        <button
                                            onClick={() => { setReportingId(null); setReportReason(''); }}
                                            style={{
                                                background: 'white', border: '1px solid #ddd', padding: '4px 12px',
                                                borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReport(review.id)}
                                            disabled={!reportReason.trim()}
                                            style={{
                                                background: '#ff4d4f', border: 'none', padding: '4px 12px',
                                                borderRadius: 4, cursor: 'pointer', color: 'white', fontSize: '0.8rem'
                                            }}
                                        >
                                            Submit Request
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Review Content */}
                            <div style={{ margin: '12px 0 16px 44px' }}>
                                <p style={{ color: '#333', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {displayContent}
                                </p>
                                {isLongContent && (
                                    <button
                                        onClick={() => toggleExpand(review.id)}
                                        style={{
                                            background: 'none', border: 'none', color: '#888',
                                            fontSize: '0.85rem', padding: 0, marginTop: 4, cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        {isExpanded ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </div>

                            {/* Owner Reply Section */}
                            <div style={{ marginLeft: '44px' }}>
                                {review.owner_reply ? (
                                    <div style={{
                                        background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px',
                                        border: '1px solid #eee'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                From Owner
                                                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#aaa' }}>
                                                    {review.reply_at && formatDate(review.reply_at)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review.id);
                                                        setReplyText(review.owner_reply || '');
                                                    }}
                                                    style={{
                                                        background: 'none', border: 'none', color: '#666',
                                                        fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReply(review.id)}
                                                    style={{
                                                        background: 'none', border: 'none', color: '#999',
                                                        fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
                                            {review.owner_reply}
                                        </p>
                                    </div>
                                ) : null}

                                {/* Reply Input */}
                                {replyingTo === review.id ? (
                                    <div style={{ marginTop: 12 }}>
                                        <textarea
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px', border: '1px solid #ddd',
                                                borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                            rows={3}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 8 }}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={submitting || !replyText.trim()}
                                                onClick={() => {
                                                    if (review.owner_reply) {
                                                        handleUpdateReply(review.id);
                                                    } else {
                                                        handleSubmitReply(review.id);
                                                    }
                                                }}
                                            >
                                                {submitting ? 'Submitting...' : 'Post Reply'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : !review.owner_reply && (
                                    <button
                                        onClick={() => setReplyingTo(review.id)}
                                        style={{
                                            marginTop: 8,
                                            background: 'none', border: '1px solid #ddd', borderRadius: 4,
                                            padding: '6px 12px', color: '#666', fontSize: '0.8rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 6
                                        }}
                                    >
                                        <MessageSquare size={12} />
                                        Reply
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {reviews.length === 0 && (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
                        No reviews yet.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: 8, padding: '20px', borderTop: '1px solid #eee'
                }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            background: 'white', border: '1px solid #ddd', borderRadius: 4,
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        background: currentPage === page ? '#18181b' : 'white',
                                        color: currentPage === page ? 'white' : '#333',
                                        border: currentPage === page ? '1px solid #18181b' : '1px solid #ddd',
                                        borderRadius: 4,
                                        width: 32, height: 32,
                                        fontWeight: 600, fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        }
                        if (page === currentPage - 3 || page === currentPage + 3) {
                            return <span key={page} style={{ color: '#ccc' }}>...</span>;
                        }
                        return null;
                    })}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            background: 'white', border: '1px solid #ddd', borderRadius: 4,
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
