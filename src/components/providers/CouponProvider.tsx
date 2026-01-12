"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Coupon } from '@/types';

interface CouponContextType {
    claimedCoupons: Coupon[];
    claimCoupon: (coupon: Coupon) => void;
    isClaimed: (couponId: string) => boolean;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export function CouponProvider({ children }: { children: React.ReactNode }) {
    const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('claimedCoupons');
        if (stored) {
            setClaimedCoupons(JSON.parse(stored));
        }
    }, []);

    const claimCoupon = (coupon: Coupon) => {
        setClaimedCoupons(prev => {
            if (prev.some(c => c.id === coupon.id)) return prev;
            const updated = [...prev, coupon];
            localStorage.setItem('claimedCoupons', JSON.stringify(updated));
            return updated;
        });
        alert(`Coupon "${coupon.name}" claimed! Check your wallet in My Page.`);
    };

    const isClaimed = (couponId: string) => {
        return claimedCoupons.some(c => c.id === couponId);
    };

    return (
        <CouponContext.Provider value={{ claimedCoupons, claimCoupon, isClaimed }}>
            {children}
        </CouponContext.Provider>
    );
}

export function useCoupons() {
    const context = useContext(CouponContext);
    if (!context) {
        throw new Error('useCoupons must be used within a CouponProvider');
    }
    return context;
}
