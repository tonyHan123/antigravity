'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/providers/WishlistProvider';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
    shopId: string;
    size?: number;
    className?: string;
    variant?: 'default' | 'mini';
}

export default function LikeButton({ shopId, size, className = '', variant = 'default' }: LikeButtonProps) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isLiked = isInWishlist(shopId);

    // If variant is mini, default size to 14 if not provided
    const iconSize = size || (variant === 'mini' ? 14 : 24);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        toggleWishlist(shopId);
    };

    return (
        <button
            className={`${styles.button} ${variant === 'mini' ? styles.mini : ''} ${isLiked ? styles.active : ''} ${className}`}
            onClick={handleClick}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={iconSize}
                className={styles.icon}
                fill={isLiked ? "#ff4d4f" : "none"}
                color={isLiked ? "#ff4d4f" : "white"}
            />
        </button>
    );
}
