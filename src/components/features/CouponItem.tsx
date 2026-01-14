"use client";

import { useState } from 'react';
import { Coupon } from '@/types';
import { useCoupons } from '@/components/providers/CouponProvider';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function CouponItem({ coupon }: { coupon: Coupon }) {
    const { claimCoupon, isClaimed } = useCoupons();
    const { getL, t } = useLanguage();
    const claimed = isClaimed(coupon.id);
    const [isLoading, setIsLoading] = useState(false);

    const handleClaim = async () => {
        setIsLoading(true);
        try {
            await claimCoupon(coupon);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #ffadd2' }}>
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#c41d7f' }}>{coupon.code || getL(coupon.name)}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{getL(coupon.description)}</p>
                <div style={{ fontSize: '0.75rem', marginTop: 4, color: '#999' }}>{t('shop.validUntil')} {coupon.validUntil}</div>
            </div>
            <Button
                size="sm"
                variant={claimed ? 'outline' : 'primary'}
                disabled={claimed || isLoading}
                onClick={handleClaim}
            >
                {isLoading ? 'Claiming...' : claimed ? t('shop.inWallet') : t('shop.getCoupon')}
            </Button>
        </div>
    );
}
