'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock, Calendar as CalendarIcon, Clock, Save, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './OwnerDashboard.module.css';

// ============================================
// Owner Schedule Management
// 네이버 예약 스타일 캘린더 + 시간 슬롯 관리
// ============================================

interface OwnerScheduleProps {
    shopId?: string;
}

interface BusinessHours {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

interface BlockedSlot {
    id?: string;
    shop_id: string;
    blocked_date: string;
    start_time: string;
    end_time?: string;
    reason?: string;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_HOURS: BusinessHours[] = [
    { day_of_week: 0, open_time: '10:00', close_time: '20:00', is_closed: true }, // Sunday
    { day_of_week: 1, open_time: '10:00', close_time: '20:00', is_closed: false },
    { day_of_week: 2, open_time: '10:00', close_time: '20:00', is_closed: false },
    { day_of_week: 3, open_time: '10:00', close_time: '20:00', is_closed: false },
    { day_of_week: 4, open_time: '10:00', close_time: '20:00', is_closed: false },
    { day_of_week: 5, open_time: '10:00', close_time: '20:00', is_closed: false },
    { day_of_week: 6, open_time: '10:00', close_time: '20:00', is_closed: false }, // Saturday
];

export default function OwnerSchedule({ shopId }: OwnerScheduleProps) {
    // ============================================
    // State
    // ============================================
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [businessHours, setBusinessHours] = useState<BusinessHours[]>(DEFAULT_HOURS);
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [holidays, setHolidays] = useState<{ date: string; reason?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showHoursModal, setShowHoursModal] = useState(false);
    const [slotsForDate, setSlotsForDate] = useState<{ time: string; blocked: boolean }[]>([]);

    // ============================================
    // Data Fetching
    // ============================================
    useEffect(() => {
        if (!shopId) return;

        async function loadSchedule() {
            try {
                const res = await fetch(`/api/owner/schedule?shopId=${shopId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.hours?.length > 0) {
                        setBusinessHours(data.hours);
                    }
                    setBlockedSlots(data.blockedSlots || []);
                    setHolidays(data.holidays || []);
                }
            } catch (error) {
                console.error('Failed to load schedule:', error);
            } finally {
                setLoading(false);
            }
        }
        loadSchedule();
    }, [shopId]);

    // ============================================
    // Calendar Navigation
    // ============================================
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Generate calendar days
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    // ============================================
    // Date Selection & Slot Management
    // ============================================
    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);

        // Get day of week
        const dayOfWeek = new Date(dateStr).getDay();
        const hours = businessHours.find(h => h.day_of_week === dayOfWeek);

        if (hours && !hours.is_closed) {
            // Generate time slots
            const slots = generateTimeSlots(hours.open_time, hours.close_time);
            const blocked = blockedSlots
                .filter(b => b.blocked_date === dateStr)
                .map(b => b.start_time.substring(0, 5)); // Normalize to HH:MM

            setSlotsForDate(slots.map(time => ({ time, blocked: blocked.includes(time) })));
        } else {
            setSlotsForDate([]);
        }
    };

    const toggleSlot = async (time: string) => {
        if (!selectedDate || !shopId) return;

        const isCurrentlyBlocked = slotsForDate.find(s => s.time === time)?.blocked;
        const action = isCurrentlyBlocked ? 'unblock' : 'block';

        try {
            const res = await fetch('/api/owner/schedule/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopId, date: selectedDate, time, action })
            });

            if (res.ok) {
                // Update local state
                setSlotsForDate(prev =>
                    prev.map(s => s.time === time ? { ...s, blocked: !s.blocked } : s)
                );

                if (action === 'block') {
                    setBlockedSlots(prev => [...prev, {
                        shop_id: shopId,
                        blocked_date: selectedDate,
                        start_time: time
                    }]);
                } else {
                    setBlockedSlots(prev => prev.filter(b => !(b.blocked_date === selectedDate && b.start_time === time)));
                }
            }
        } catch (error) {
            console.error('Failed to toggle slot:', error);
            alert('Failed to update slot');
        }
    };

    // ============================================
    // Save Business Hours
    // ============================================
    const saveBusinessHours = async () => {
        if (!shopId) return;
        setSaving(true);

        try {
            const res = await fetch('/api/owner/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopId, hours: businessHours })
            });

            if (res.ok) {
                alert('Business hours saved successfully!');
                setShowHoursModal(false);
            } else {
                alert('Failed to save hours');
            }
        } catch (error) {
            console.error('Failed to save hours:', error);
            alert('Failed to save hours');
        } finally {
            setSaving(false);
        }
    };

    // ============================================
    // Helper: Generate Time Slots
    // ============================================
    function generateTimeSlots(openTime: string, closeTime: string): string[] {
        const slots: string[] = [];
        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);

        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin = 0;
                currentHour++;
            }
        }
        return slots;
    }

    // ============================================
    // Check if date has blocked slots
    // ============================================
    const hasBlockedSlots = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return blockedSlots.some(b => b.blocked_date === dateStr);
    };

    const isHoliday = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays.some(h => h.date === dateStr);
    };

    // ============================================
    // Render
    // ============================================
    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading schedule...</div>;
    }

    return (
        <div className={styles.section}>
            {/* Header */}
            <div className={styles.sectionHeader}>
                <h3>Schedule Management</h3>
                <Button size="sm" variant="outline" onClick={() => setShowHoursModal(true)}>
                    <Clock size={14} style={{ marginRight: 4 }} /> Set Business Hours
                </Button>
            </div>

            <p style={{ marginBottom: 20, color: '#666', fontSize: '0.9rem' }}>
                📅 날짜를 클릭하여 해당 날짜의 시간 슬롯을 관리하세요. 차단된 시간은 고객이 예약할 수 없습니다.
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Calendar */}
                <div style={{ flex: '1 1 320px', minWidth: 300 }}>
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                            <ChevronLeft size={20} />
                        </button>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {year}년 {month + 1}월
                        </h4>
                        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                        {DAYS_OF_WEEK.map((day, i) => (
                            <div key={day} style={{
                                textAlign: 'center',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                color: i === 0 ? '#dc3545' : i === 6 ? '#0d6efd' : '#666'
                            }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} />;
                            }

                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = selectedDate === dateStr;
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;
                            const hasBlocked = hasBlockedSlots(day);
                            const isHolidayDay = isHoliday(day);
                            const dayOfWeek = new Date(dateStr).getDay();

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    style={{
                                        aspectRatio: '1',
                                        border: isSelected ? '2px solid #c41d7f' : '1px solid #eee',
                                        borderRadius: 8,
                                        background: isSelected ? '#fff0f6' : isToday ? '#e6f7ff' : isHolidayDay ? '#fff1f0' : 'white',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        fontSize: '0.9rem',
                                        fontWeight: isSelected ? 600 : 400,
                                        color: dayOfWeek === 0 ? '#dc3545' : dayOfWeek === 6 ? '#0d6efd' : '#333'
                                    }}
                                >
                                    {day}
                                    {hasBlocked && (
                                        <span style={{
                                            position: 'absolute',
                                            bottom: 4,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 6,
                                            height: 6,
                                            background: '#faad14',
                                            borderRadius: '50%'
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: '0.8rem', color: '#666' }}>
                        <span>🟡 차단된 슬롯 있음</span>
                        <span>🔴 휴무일</span>
                    </div>
                </div>

                {/* Time Slots Panel */}
                <div style={{ flex: '1 1 300px', minWidth: 280 }}>
                    {selectedDate ? (
                        <div style={{ background: '#fafafa', borderRadius: 12, padding: 20 }}>
                            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarIcon size={18} />
                                {selectedDate} Time Slots
                            </h4>

                            {slotsForDate.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                    {slotsForDate.map(slot => (
                                        <button
                                            key={slot.time}
                                            onClick={() => toggleSlot(slot.time)}
                                            style={{
                                                padding: '10px 8px',
                                                borderRadius: 6,
                                                border: '1px solid',
                                                borderColor: slot.blocked ? '#ffccc7' : '#b7eb8f',
                                                background: slot.blocked ? '#fff1f0' : '#f6ffed',
                                                color: slot.blocked ? '#cf1322' : '#389e0d',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 4,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {slot.blocked ? <Lock size={12} /> : <Unlock size={12} />}
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999' }}>
                                    이 날은 영업일이 아니거나 영업시간이 설정되지 않았습니다.
                                </p>
                            )}

                            <p style={{ marginTop: 16, fontSize: '0.8rem', color: '#888' }}>
                                💡 시간을 클릭하여 차단/해제하세요
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            background: '#fafafa',
                            borderRadius: 12,
                            padding: 40,
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            <CalendarIcon size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                            <p>캘린더에서 날짜를 선택하세요</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Business Hours Modal */}
            {showHoursModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 24,
                        width: '90%',
                        maxWidth: 500,
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3>Business Hours Settings</h3>
                            <button onClick={() => setShowHoursModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {businessHours.map((hours, index) => (
                            <div key={hours.day_of_week} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0',
                                borderBottom: '1px solid #eee'
                            }}>
                                <div style={{ width: 80, fontWeight: 500 }}>{DAYS_EN[hours.day_of_week]}</div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input
                                        type="checkbox"
                                        checked={!hours.is_closed}
                                        onChange={(e) => {
                                            const updated = [...businessHours];
                                            updated[index].is_closed = !e.target.checked;
                                            setBusinessHours(updated);
                                        }}
                                    />
                                    Open
                                </label>

                                {!hours.is_closed && (
                                    <>
                                        <input
                                            type="time"
                                            value={hours.open_time}
                                            onChange={(e) => {
                                                const updated = [...businessHours];
                                                updated[index].open_time = e.target.value;
                                                setBusinessHours(updated);
                                            }}
                                            style={{ padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
                                        />
                                        <span>~</span>
                                        <input
                                            type="time"
                                            value={hours.close_time}
                                            onChange={(e) => {
                                                const updated = [...businessHours];
                                                updated[index].close_time = e.target.value;
                                                setBusinessHours(updated);
                                            }}
                                            style={{ padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
                                        />
                                    </>
                                )}
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                            <Button variant="outline" onClick={() => setShowHoursModal(false)}>Cancel</Button>
                            <Button onClick={saveBusinessHours} disabled={saving}>
                                <Save size={14} style={{ marginRight: 4 }} />
                                {saving ? 'Saving...' : 'Save Hours'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
