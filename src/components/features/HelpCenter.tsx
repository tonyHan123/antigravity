'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Booking } from '@/types';
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { MOCK_SHOPS } from '@/lib/mockData';

interface Props {
    historyBookings: Booking[];
}

export default function HelpCenter({ historyBookings }: Props) {
    const [selectedBookingId, setSelectedBookingId] = useState<string>('');
    const [category, setCategory] = useState<string>('service');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

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

    if (isSubmitted) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <CheckCircle size={48} color="#52c41a" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Inquiry Received</h3>
                <p style={{ color: '#666', maxWidth: 400, margin: '0 auto' }}>
                    Your support ticket has been created. Our support team will review your case and respond within 24 hours.
                </p>
                <Button
                    variant="outline"
                    style={{ marginTop: 24 }}
                    onClick={() => {
                        setIsSubmitted(false);
                        setMessage('');
                        setSelectedBookingId('');
                    }}
                >
                    Submit Another Inquiry
                </Button>
            </div>
        );
    }

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
                            const shop = MOCK_SHOPS.find(s => s.id === booking.shopId);
                            const shopName = shop ? (typeof shop.name === 'string' ? shop.name : shop.name.en) : 'Unknown Shop';
                            return (
                                <option key={booking.id} value={booking.id}>
                                    {booking.date} - {shopName} ({booking.totalPrice} KRW)
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
