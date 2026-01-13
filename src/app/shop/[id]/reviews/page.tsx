'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MOCK_SHOPS, MOCK_REVIEWS } from '@/lib/mockData';
import { useLanguage } from '@/components/providers/LanguageProvider';
import styles from './reviews.module.css';

type Props = {
    params: Promise<{ id: string }>;
}

export default function ReviewsPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { getL, t } = useLanguage();

    // Find Shop
    const shop = MOCK_SHOPS.find((s) => s.id === id);
    if (!shop) notFound();

    // Filter Reviews
    const reviews = MOCK_REVIEWS.filter(r => r.shopId === id);

    // Calculate rating distribution
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });

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
                        <span className={styles.score}>{shop.rating}</span>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.round(shop.rating) ? "#ffd700" : "#eee"} color={i < Math.round(shop.rating) ? "#ffd700" : "#eee"} />
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
                                <div className={styles.avatarPlaceholder}>{review.userName.charAt(0)}</div>
                                <div>
                                    <div className={styles.reviewerName}>{review.userName}</div>
                                    <div className={styles.reviewDate}>{review.date}</div>
                                </div>
                            </div>

                            <div className={styles.reviewRating}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < review.rating ? "#ffd700" : "#eee"} color={i < review.rating ? "#ffd700" : "#eee"} />
                                ))}
                            </div>

                            <p className={styles.content}>{review.content}</p>

                            {review.photos && review.photos.length > 0 && (
                                <div className={styles.photoGrid}>
                                    {review.photos.map((photo, idx) => (
                                        <div key={idx} className={styles.photoItem}>
                                            <img src={photo} alt={`Review ${idx}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {review.reply && (
                                <div className={styles.replyBox}>
                                    <div className={styles.replyHeader}>
                                        <span className={styles.replyTitle}>Response from {getL(shop.name)}</span>
                                        <span className={styles.replyDate}>{review.replyDate}</span>
                                    </div>
                                    <p className={styles.replyContent}>{review.reply}</p>
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
