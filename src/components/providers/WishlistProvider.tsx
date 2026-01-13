'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (shopId: string) => void;
    removeFromWishlist: (shopId: string) => void;
    toggleWishlist: (shopId: string) => void;
    isInWishlist: (shopId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Load wishlist from API or localStorage
    useEffect(() => {
        const loadWishlist = async () => {
            // First, load from localStorage for instant display
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                setWishlist(JSON.parse(saved));
            }

            // If logged in, sync with server
            if (session?.user?.email) {
                try {
                    const res = await fetch('/api/wishlists');
                    if (res.ok) {
                        const data = await res.json();
                        const serverWishlist = data.shopIds || [];
                        setWishlist(serverWishlist);
                        localStorage.setItem('wishlist', JSON.stringify(serverWishlist));
                    }
                } catch (error) {
                    console.error('Failed to load wishlist from server:', error);
                }
            }
            setLoading(false);
        };

        loadWishlist();
    }, [session]);

    const addToWishlist = useCallback(async (shopId: string) => {
        if (wishlist.includes(shopId)) return;

        // Optimistic update
        const updated = [...wishlist, shopId];
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));

        // Sync with server if logged in
        if (session?.user?.email) {
            try {
                await fetch(`/api/wishlists/${shopId}`, { method: 'POST' });
            } catch (error) {
                console.error('Failed to add to wishlist:', error);
                // Revert on error
                setWishlist(wishlist);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            }
        }
    }, [wishlist, session]);

    const removeFromWishlist = useCallback(async (shopId: string) => {
        // Optimistic update
        const updated = wishlist.filter(id => id !== shopId);
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));

        // Sync with server if logged in
        if (session?.user?.email) {
            try {
                await fetch(`/api/wishlists/${shopId}`, { method: 'DELETE' });
            } catch (error) {
                console.error('Failed to remove from wishlist:', error);
                // Revert on error
                setWishlist(wishlist);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            }
        }
    }, [wishlist, session]);

    const toggleWishlist = useCallback((shopId: string) => {
        if (wishlist.includes(shopId)) {
            removeFromWishlist(shopId);
        } else {
            addToWishlist(shopId);
        }
    }, [wishlist, addToWishlist, removeFromWishlist]);

    const isInWishlist = useCallback((shopId: string) => wishlist.includes(shopId), [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
