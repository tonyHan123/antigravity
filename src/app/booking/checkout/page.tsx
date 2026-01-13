"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getShop, Shop, createBooking } from '@/lib/api';
import styles from './checkout.module.css';
import { useSession } from 'next-auth/react';

function CheckoutContent() {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const shopId = searchParams.get('shopId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Helper
    const getL = (val: { en: string; jp?: string; cn?: string } | string | undefined) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.en || '';
    };

    useEffect(() => {
        async function fetchShop() {
            if (!shopId) return;
            try {
                const data = await getShop(shopId);
                setShop(data);
            } catch (error) {
                console.error('Failed to fetch shop:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchShop();
    }, [shopId]);

    if (loading) {
        return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading...</div>;
    }

    const service = shop?.services?.find(s => s.id === serviceId);

    if (!shop || !service || !date || !time) {
        return (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h2>Invalid booking details</h2>
                <p style={{ marginTop: 16, color: '#666' }}>
                    Please go back and select a service, date, and time.
                </p>
                <Button onClick={() => router.back()} style={{ marginTop: 24 }}>
                    Go Back
                </Button>
            </div>
        );
    }

    const [selectedCouponId, setSelectedCouponId] = useState<string>('');

    // Calculate totals
    const servicePrice = service?.price || 0;
    const selectedCoupon = shop?.coupons?.find(c => c.id === selectedCouponId);

    let discountAmount = 0;
    if (selectedCoupon) {
        if (selectedCoupon.discount_type === 'percent') {
            discountAmount = Math.floor(servicePrice * (selectedCoupon.discount_value / 100));
        } else {
            discountAmount = selectedCoupon.discount_value;
        }
    }

    // Ensure total price is not negative
    const totalPrice = Math.max(0, servicePrice - discountAmount);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            await createBooking({
                shopId: shop.id,
                serviceId: service.id,
                date,
                time,
                totalPrice: totalPrice,
                couponId: selectedCouponId || undefined,
                discountAmount: discountAmount > 0 ? discountAmount : undefined,
            });
            router.push('/booking/success');
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
            setIsProcessing(false);
        }
    };

    // Filter valid coupons
    const validCoupons = shop?.coupons?.filter(c =>
        c.is_active &&
        new Date(c.valid_until) > new Date() &&
        c.min_purchase <= servicePrice
    ) || [];

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <h1 className={`${styles.title} text-serif`}>Review & Pay</h1>

            <div className={styles.layout}>
                {/* Booking Summary */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Booking Summary</h2>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Shop</span>
                        <span className={styles.value}>{getL(shop.name)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Location</span>
                        <span className={styles.value}><MapPin size={14} /> {getL(shop.region)}</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Service</span>
                        <span className={styles.value}>{getL(service.name)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Date & Time</span>
                        <span className={styles.value}>
                            <Calendar size={14} /> {date} <Clock size={14} style={{ marginLeft: 6 }} /> {time}
                        </span>
                    </div>

                    {/* Coupon Section */}
                    <div className={styles.divider} />
                    <div className={styles.summaryItem} style={{ alignItems: 'center' }}>
                        <span className={styles.label}>Discount</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <select
                                className={styles.select}
                                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: '0.85rem' }}
                                value={selectedCouponId}
                                onChange={(e) => setSelectedCouponId(e.target.value)}
                            >
                                <option value="">Select Coupon</option>
                                {validCoupons.map(coupon => (
                                    <option key={coupon.id} value={coupon.id}>
                                        {coupon.code} ({coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₩${coupon.discount_value.toLocaleString()}`} Off)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {discountAmount > 0 && (
                        <div className={styles.summaryItem} style={{ marginTop: 8, color: '#e02424' }}>
                            <span className={styles.label}>Discount Amount</span>
                            <span className={styles.value}>-₩{discountAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className={styles.divider} />
                    <div className={`${styles.summaryItem} ${styles.total}`}>
                        <span className={styles.label}>Total Price</span>
                        <span className={styles.value}>₩{totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <div className={styles.formSection}>
                    <h2 className={styles.cardTitle}>Guest Details</h2>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" defaultValue={session?.user?.name || ''} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" defaultValue={session?.user?.email || ''} className={styles.input} />
                    </div>

                    <h2 className={styles.cardTitle} style={{ marginTop: 'var(--spacing-xl)' }}>
                        Payment Method
                    </h2>
                    <div className={styles.paymentBox}>
                        <div className={styles.inputGroup}>
                            <label>Card Number</label>
                            <div className={styles.cardInputWrapper}>
                                <CreditCard size={20} className={styles.cardIcon} />
                                <input type="text" placeholder="0000 0000 0000 0000" className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Expiry</label>
                                <input type="text" placeholder="MM/YY" className={styles.input} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>CVC</label>
                                <input type="text" placeholder="123" className={styles.input} />
                            </div>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Pay ₩${service.price.toLocaleString()}`}
                    </Button>
                    <p className={styles.secureText}>
                        Payments are secure and encrypted.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="container">Loading Checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    )
}
