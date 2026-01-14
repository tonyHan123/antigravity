"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Check, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Service } from '@/types';
import styles from './BookingWidget.module.css';

// ============================================
// Booking Widget - 실제 가용 시간 API 연동
// ============================================

interface BookingWidgetProps {
    shopId: string;
    services: Service[];
}

interface TimeSlot {
    time: string;
    available: boolean;
    blocked?: boolean;
    booked?: boolean;
}

interface AvailabilityResponse {
    available: boolean;
    reason?: string;
    message?: string;
    date?: string;
    openTime?: string;
    closeTime?: string;
    slots: TimeSlot[];
}

export default function BookingWidget({ shopId, services }: BookingWidgetProps) {
    const router = useRouter();
    const [selectedService, setSelectedService] = useState<string>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Availability state
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

    // Helper for localized strings
    const getL = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.en || val.ko || '';
    };

    // Fetch availability when date changes
    useEffect(() => {
        if (!date || !shopId) {
            setTimeSlots([]);
            setAvailabilityMessage(null);
            return;
        }

        async function fetchAvailability() {
            setLoadingSlots(true);
            setTime(''); // Reset time when date changes
            setAvailabilityMessage(null);

            try {
                const res = await fetch(`/api/shops/${shopId}/availability?date=${date}`);
                const data: AvailabilityResponse = await res.json();

                if (!data.available) {
                    setTimeSlots([]);
                    setAvailabilityMessage(data.message || 'This shop is closed on the selected date.');
                } else {
                    setTimeSlots(data.slots || []);

                    // Check if any slots are available
                    const hasAvailable = data.slots?.some(s => s.available);
                    if (!hasAvailable) {
                        setAvailabilityMessage('All time slots are fully booked on this date.');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch availability:', error);
                setTimeSlots([]);
                setAvailabilityMessage('Failed to load available times. Please try again.');
            } finally {
                setLoadingSlots(false);
            }
        }

        fetchAvailability();
    }, [date, shopId]);

    const handleBook = () => {
        if (!selectedService || !date || !time) return;

        const params = new URLSearchParams({
            shopId,
            serviceId: selectedService,
            date,
            time
        });

        router.push(`/booking/checkout?${params.toString()}`);
    };

    return (
        <div className={styles.widget}>
            <h3 className={styles.title}>Book Appointment</h3>

            {/* Service Selection */}
            <div className={styles.section}>
                <label className={styles.label}>Select Service</label>
                <div className={styles.serviceList}>
                    {services.map((srv) => (
                        <div
                            key={srv.id}
                            className={`${styles.serviceItem} ${selectedService === srv.id ? styles.selected : ''}`}
                            onClick={() => setSelectedService(srv.id)}
                        >
                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{getL(srv.name)}</span>
                                <span className={styles.servicePrice}>₩{srv.price.toLocaleString()}</span>
                            </div>
                            {selectedService === srv.id && <Check size={16} className="text-gold" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Date Selection */}
            <div className={styles.section}>
                <label className={styles.label}>
                    <Calendar size={14} /> Date
                </label>
                <input
                    type="date"
                    className={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            {/* Time Selection - Dynamic based on availability */}
            <div className={styles.section}>
                <label className={styles.label}>
                    <Clock size={14} /> Time
                </label>

                {loadingSlots ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', color: '#666' }}>
                        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Loading available times...
                    </div>
                ) : availabilityMessage ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px',
                        background: '#fff7e6',
                        border: '1px solid #ffe7ba',
                        borderRadius: 8,
                        color: '#d48806',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={16} />
                        {availabilityMessage}
                    </div>
                ) : date && timeSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {timeSlots.map(slot => (
                            <button
                                key={slot.time}
                                onClick={() => slot.available && setTime(slot.time)}
                                disabled={!slot.available}
                                style={{
                                    padding: '10px 8px',
                                    borderRadius: 6,
                                    border: time === slot.time ? '2px solid #c41d7f' : '1px solid #e5e7eb',
                                    background: !slot.available
                                        ? '#f5f5f5'
                                        : time === slot.time
                                            ? '#fff0f6'
                                            : 'white',
                                    color: !slot.available ? '#999' : time === slot.time ? '#c41d7f' : '#333',
                                    cursor: slot.available ? 'pointer' : 'not-allowed',
                                    fontSize: '0.85rem',
                                    fontWeight: time === slot.time ? 600 : 400,
                                    textDecoration: !slot.available ? 'line-through' : 'none'
                                }}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                ) : !date ? (
                    <div style={{ padding: '12px', color: '#999', fontSize: '0.9rem' }}>
                        Please select a date first
                    </div>
                ) : null}
            </div>

            <Button
                fullWidth
                disabled={!selectedService || !date || !time}
                onClick={handleBook}
            >
                Proceed to Book
            </Button>

            <p className={styles.note}>
                You won't be charged yet.
            </p>
        </div>
    );
}
