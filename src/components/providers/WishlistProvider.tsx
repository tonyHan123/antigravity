'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (shopId: string) => void;
    removeFromWishlist: (shopId: string) => void;
    isInWishlist: (shopId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            setWishlist(JSON.parse(saved));
        }
    }, []);

    const addToWishlist = (shopId: string) => {
        const updated = [...wishlist, shopId];
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    };

    const removeFromWishlist = (shopId: string) => {
        const updated = wishlist.filter(id => id !== shopId);
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    };

    const isInWishlist = (shopId: string) => wishlist.includes(shopId);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
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
