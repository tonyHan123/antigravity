"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Service } from '@/types';
import styles from './BookingWidget.module.css';

interface BookingWidgetProps {
    shopId: string;
    services: Service[];
}

export default function BookingWidget({ shopId, services }: BookingWidgetProps) {
    const router = useRouter();
    const [selectedService, setSelectedService] = useState<string>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Helper for localized strings
    const getL = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.en || val.ko || '';
    };

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

            <div className={styles.section}>
                <label className={styles.label}>
                    <Clock size={14} /> Time
                </label>
                <select
                    className={styles.input}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                >
                    <option value="">Select Time</option>
                    {['10:00', '11:00', '13:00', '14:00', '15:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
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
