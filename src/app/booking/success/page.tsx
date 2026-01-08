import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SuccessPage() {
    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
        }}>
            <CheckCircle size={64} className="text-gold" style={{ marginBottom: 'var(--spacing-lg)' }} />
            <h1 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>
                Booking Confirmed!
            </h1>
            <p style={{
                color: 'var(--text-secondary)',
                maxWidth: 500,
                marginBottom: 'var(--spacing-xl)'
            }}>
                Thank you for booking with K-Beauty. Your appointment details have been sent to your email.
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Link href="/my-page">
                    <Button variant="outline">View My Bookings</Button>
                </Link>
                <Link href="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}
