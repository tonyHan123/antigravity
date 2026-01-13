"use client";

import { useState } from 'react';
import { Star, X, Upload, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './WriteReviewModal.module.css';

interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rating: number; content: string; photos: File[] }) => void;
    shopName: string;
}

export default function WriteReviewModal({ isOpen, onClose, onSubmit, shopName }: WriteReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    if (!isOpen) return null;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...newFiles]);

            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSubmit({ rating, content, photos });
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Write a Review</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <div className={styles.body}>
                    <p className={styles.shopName}>for {shopName}</p>

                    <div className={styles.ratingSection}>
                        <label>Your Rating</label>
                        <div className={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={styles.starBtn}
                                >
                                    <Star
                                        size={32}
                                        fill={star <= rating ? "#ffd700" : "none"}
                                        color={star <= rating ? "#ffd700" : "#ddd"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputSection}>
                        <label>Your Experience</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tell us about your experience..."
                            rows={4}
                            className={styles.textarea}
                        />
                    </div>

                    <div className={styles.photoSection}>
                        <label>Add Photos</label>
                        <div className={styles.photoGrid}>
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className={styles.photoPreview}>
                                    <img src={url} alt="Review" />
                                    <button onClick={() => removePhoto(idx)} className={styles.removePhotoBtn}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className={styles.uploadBtn}>
                                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden />
                                <ImageIcon size={20} />
                                <span>Add</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={content.length < 10}>Submit Review</Button>
                </div>
            </div>
        </div>
    );
}
