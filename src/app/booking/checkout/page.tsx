"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MOCK_SHOPS, MOCK_USER } from '@/lib/mockData';
import styles from './checkout.module.css';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shopId = searchParams.get('shopId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const [isProcessing, setIsProcessing] = useState(false);

    // Find Data
    const shop = MOCK_SHOPS.find(s => s.id === shopId);
    const service = shop?.services.find(s => s.id === serviceId);

    if (!shop || !service || !date || !time) {
        return <div className="container">Invalid booking details.</div>;
    }

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/booking/success');
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <h1 className={`${styles.title} text-serif`}>Review & Pay</h1>

            <div className={styles.layout}>
                {/* Booking Summary */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Booking Summary</h2>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Shop</span>
                        <span className={styles.value}>{shop.name}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Location</span>
                        <span className={styles.value}><MapPin size={14} /> {shop.region}</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Service</span>
                        <span className={styles.value}>{service.name}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Date & Time</span>
                        <span className={styles.value}>
                            <Calendar size={14} /> {date} <Clock size={14} style={{ marginLeft: 6 }} /> {time}
                        </span>
                    </div>
                    <div className={styles.divider} />
                    <div className={`${styles.summaryItem} ${styles.total}`}>
                        <span className={styles.label}>Total Price</span>
                        <span className={styles.value}>₩{service.price.toLocaleString()}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <div className={styles.formSection}>
                    <h2 className={styles.cardTitle}>Guest Details</h2>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" defaultValue={MOCK_USER.name} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" defaultValue={MOCK_USER.email} className={styles.input} />
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
