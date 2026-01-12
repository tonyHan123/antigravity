'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './OwnerDashboard.module.css'; // Re-use simplified styles or create new ones

export default function OwnerSchedule() {
    // Mock days for the calendar view
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const timeSlots = [
        '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    const [blockedSlots, setBlockedSlots] = useState<string[]>(['2025-05-20-14:00']);

    const toggleSlot = (dateStr: string, time: string) => {
        const key = `${dateStr}-${time}`;
        if (blockedSlots.includes(key)) {
            setBlockedSlots(blockedSlots.filter(s => s !== key));
        } else {
            setBlockedSlots([...blockedSlots, key]);
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Schedule Management</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="outline">Set Business Hours</Button>
                    <Button size="sm">Save Changes</Button>
                </div>
            </div>

            <p style={{ marginBottom: 20, color: '#666' }}>
                Click on a time slot to block/unblock it. Blocked slots will not be available for customer booking.
            </p>

            <div style={{ overflowX: 'auto', paddingBottom: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                        <tr>
                            <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid #eee' }}>Time</th>
                            {days.map(d => (
                                <th key={d.toString()} style={{ padding: 10, borderBottom: '2px solid #eee', minWidth: 80 }}>
                                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(time => (
                            <tr key={time}>
                                <td style={{ padding: 10, borderBottom: '1px solid #f5f5f5', fontWeight: 500 }}>{time}</td>
                                {days.map(d => {
                                    const dateStr = d.toISOString().split('T')[0];
                                    const key = `${dateStr}-${time}`;
                                    const isBlocked = blockedSlots.includes(key);

                                    return (
                                        <td key={key} style={{ padding: 4, borderBottom: '1px solid #f5f5f5' }}>
                                            <button
                                                onClick={() => toggleSlot(dateStr, time)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 4px',
                                                    borderRadius: 4,
                                                    border: '1px solid',
                                                    borderColor: isBlocked ? '#ffccc7' : '#e6f7ff',
                                                    background: isBlocked ? '#fff1f0' : '#e6f7ff',
                                                    color: isBlocked ? '#cf1322' : '#096dd9',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 4
                                                }}
                                            >
                                                {isBlocked ? <><Lock size={12} /> Closed</> : 'Open'}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
