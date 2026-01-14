'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { getShop, Shop } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';
import styles from './reviews.module.css';

type Props = {
    params: Promise<{ id: string }>;
}

interface Review {
    id: string;
    user_id: string;
    shop_id: string;
    rating: number;
    content: string;
    owner_reply: string | null;
    reply_at: string | null;
    created_at: string;
    profiles?: { name: string; email: string };
}

export default function ReviewsPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { getL, t } = useLanguage();

    const [shop, setShop] = useState<Shop | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch shop and reviews
    useEffect(() => {
        async function loadData() {
            try {
                // Fetch shop details
                const shopData = await getShop(id);
                setShop(shopData);

                // Fetch reviews
                const res = await fetch(`/api/reviews/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.reviews || []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
                Loading reviews...
            </div>
        );
    }

    if (!shop) {
        notFound();
    }

    // Calculate rating distribution
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <button onClick={() => router.back()} className={styles.backButton}>
                <ArrowLeft size={20} /> Back to Shop
            </button>

            <div className={styles.header}>
                <h1 className={styles.title}>{t('shop.reviews')}</h1>
                <p className={styles.subtitle}>for {getL(shop.name)}</p>
            </div>

            <div className={styles.grid}>
                {/* Summary Section */}
                <div className={styles.summaryCard}>
                    <div className={styles.ratingBig}>
                        <span className={styles.score}>{shop.rating?.toFixed(1) || '0.0'}</span>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.round(shop.rating || 0) ? "#ffd700" : "#eee"} color={i < Math.round(shop.rating || 0) ? "#ffd700" : "#eee"} />
                            ))}
                        </div>
                        <span className={styles.count}>{reviews.length} reviews</span>
                    </div>

                    <div className={styles.bars}>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className={styles.barRow}>
                                <span className={styles.barLabel}>{star} stars</span>
                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{ width: `${reviews.length ? (distribution[star - 1] / reviews.length) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className={styles.barCount}>{distribution[star - 1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className={styles.reviewList}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.avatarPlaceholder}>
                                    {(review.profiles?.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className={styles.reviewerName}>{review.profiles?.name || 'Anonymous'}</div>
                                    <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                                </div>
                            </div>

                            <div className={styles.reviewRating}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < review.rating ? "#ffd700" : "#eee"} color={i < review.rating ? "#ffd700" : "#eee"} />
                                ))}
                            </div>

                            <p className={styles.content}>{review.content}</p>

                            {/* Owner Reply */}
                            {review.owner_reply && (
                                <div className={styles.replyBox}>
                                    <div className={styles.replyHeader}>
                                        <span className={styles.replyTitle}>
                                            <MessageSquare size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                            Response from {getL(shop.name)}
                                        </span>
                                        <span className={styles.replyDate}>{review.reply_at && formatDate(review.reply_at)}</span>
                                    </div>
                                    <p className={styles.replyContent}>{review.owner_reply}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <div className={styles.empty}>
                            <p>No reviews yet for this shop.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
