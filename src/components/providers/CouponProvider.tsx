"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Coupon } from '@/types';
import { useSession } from 'next-auth/react';

interface ClaimedCoupon extends Coupon {
    claimedAt?: string;
    usedAt?: string | null;
}

interface CouponContextType {
    claimedCoupons: ClaimedCoupon[];
    claimCoupon: (coupon: Coupon) => Promise<boolean>;
    isClaimed: (couponId: string) => boolean;
    isLoading: boolean;
    refreshCoupons: () => Promise<void>;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export function CouponProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [claimedCoupons, setClaimedCoupons] = useState<ClaimedCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch claimed coupons from API
    const refreshCoupons = useCallback(async () => {
        if (status !== 'authenticated') {
            setClaimedCoupons([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/coupons/my');
            if (res.ok) {
                const data = await res.json();
                // Transform API response to Coupon format
                const coupons: ClaimedCoupon[] = (data.userCoupons || []).map((uc: any) => ({
                    id: uc.coupons.id,
                    code: uc.coupons.code,
                    name: uc.coupons.code, // Use code as name
                    description: `${uc.coupons.discount_type === 'percent' ? uc.coupons.discount_value + '% OFF' : '₩' + uc.coupons.discount_value + ' OFF'}`,
                    discountType: uc.coupons.discount_type,
                    discountValue: uc.coupons.discount_value,
                    validUntil: uc.coupons.valid_until,
                    shopId: uc.coupons.shop_id,
                    shopName: uc.coupons.shops?.name || 'Shop',
                    claimedAt: uc.claimed_at,
                    usedAt: uc.used_at,
                }));
                setClaimedCoupons(coupons);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setIsLoading(false);
        }
    }, [status]);

    // Fetch coupons on mount and when session changes
    useEffect(() => {
        refreshCoupons();
    }, [refreshCoupons]);

    // Claim a coupon via API
    const claimCoupon = async (coupon: Coupon): Promise<boolean> => {
        if (status !== 'authenticated') {
            alert('Please login to claim coupons.');
            return false;
        }

        try {
            const res = await fetch(`/api/coupons/claim/${coupon.id}`, {
                method: 'POST',
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Coupon "${coupon.code || coupon.name}" claimed! Check your wallet in My Page.`);
                await refreshCoupons(); // Refresh the list
                return true;
            } else {
                alert(data.error || 'Failed to claim coupon');
                return false;
            }
        } catch (error) {
            console.error('Error claiming coupon:', error);
            alert('Failed to claim coupon. Please try again.');
            return false;
        }
    };

    const isClaimed = (couponId: string) => {
        return claimedCoupons.some(c => c.id === couponId);
    };

    return (
        <CouponContext.Provider value={{ claimedCoupons, claimCoupon, isClaimed, isLoading, refreshCoupons }}>
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
