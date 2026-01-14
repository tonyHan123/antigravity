'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Booking } from '@/lib/api';
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
    historyBookings: Booking[];
}

export default function HelpCenter({ historyBookings }: Props) {
    const [selectedBookingId, setSelectedBookingId] = useState<string>('');
    const [category, setCategory] = useState<string>('service');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Helper for localization
    const getL = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.en || val.ko || '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send data to the backend
        console.log({
            bookingId: selectedBookingId,
            category,
            message,
            submittedAt: new Date().toISOString()
        });
        setIsSubmitted(true);
    };

    // ... (render part)

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 10, borderRadius: '50%', background: '#ffccc7' }}>
                    <HelpCircle size={24} color="#f5222d" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Help Center</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Need help with a past booking? We are here to assist you.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Select Booking */}
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.95rem' }}>
                        Select Related Booking <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                        required
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                    >
                        <option value="">-- Select a past booking --</option>
                        {historyBookings.map(booking => {
                            const shopName = getL(booking.shops?.name) || 'Unknown Shop';
                            return (
                                <option key={booking.id} value={booking.id}>
                                    {booking.date} - {shopName} (₩{booking.total_price?.toLocaleString()})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 2. Select Category */}
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.95rem' }}>
                        Issue Category
                    </label>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {['Service Quality', 'Unexpected Charge', 'Refused Entry', 'Other'].map(opt => (
                            <button
                                type="button"
                                key={opt}
                                onClick={() => setCategory(opt.toLowerCase().replace(' ', '_'))}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem',
                                    border: '1px solid',
                                    borderColor: category === opt.toLowerCase().replace(' ', '_') ? '#c41d7f' : '#ddd',
                                    background: category === opt.toLowerCase().replace(' ', '_') ? '#fff0f6' : 'white',
                                    color: category === opt.toLowerCase().replace(' ', '_') ? '#c41d7f' : '#666',
                                    cursor: 'pointer'
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Message */}
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.95rem' }}>
                        Description <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                        required
                        placeholder="Please describe your issue in detail. If you have photos, please state that here."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ width: '100%', height: 120, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', lineHeight: 1.5 }}
                    />
                </div>

                {/* Notice */}
                <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, display: 'flex', gap: 12, fontSize: '0.85rem', color: '#666' }}>
                    <AlertCircle size={32} color="#888" style={{ flexShrink: 0 }} />
                    <p>
                        For inquiries about <strong>upcoming bookings</strong>, please use the "Reschedule" or "Cancel" buttons in the "Upcoming" tab.
                        This form is specifically for disputes or issues regarding completed appointments.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" disabled={!selectedBookingId || !message.trim()}>
                        Submit Ticket
                    </Button>
                </div>
            </form>
        </div>
    );
}
