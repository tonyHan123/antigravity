'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';

interface Booking {
    id: string;
    date: string;
    time: string;
    status: string;
    total_price: number;
    profiles?: { name: string; email: string };
    services?: { name: { en: string } };
}

const CANCELLATION_REASONS = [
    { id: 'schedule_conflict', label: '일정 변경' },
    { id: 'staff_unavailable', label: '담당자 부재' },
    { id: 'material_shortage', label: '재료/자재 부족' },
    { id: 'emergency', label: '긴급 상황 발생' },
    { id: 'other', label: '기타 사유' },
];

interface Props {
    shopId: string;
}

export default function BookingsTab({ shopId }: Props) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
    const [selectedReason, setSelectedReason] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadBookings();
    }, [shopId]);

    const loadBookings = async () => {
        try {
            // Fetch all bookings for owner (no shopId filter for demo)
            const res = await fetch(`/api/owner/bookings`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (booking: Booking) => {
        setCancelModal({ open: true, booking });
        setSelectedReason('');
        setCustomMessage('');
    };

    const handleCancelConfirm = async () => {
        if (!cancelModal.booking || !selectedReason) return;

        setCancelling(true);
        try {
            const res = await fetch(`/api/owner/bookings/${cancelModal.booking.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: selectedReason,
                    customMessage: customMessage || undefined,
                }),
            });

            if (res.ok) {
                alert('예약이 취소되었고, 고객에게 알림이 전송되었습니다.');
                setCancelModal({ open: false, booking: null });
                loadBookings(); // Refresh list
            } else {
                const error = await res.json();
                alert(`취소 실패: ${error.error}`);
            }
        } catch (error) {
            console.error('Cancel failed:', error);
            alert('취소 처리 중 오류가 발생했습니다.');
        } finally {
            setCancelling(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    // 다가오는 예약: 미래 날짜 + 취소 아님
    const upcomingBookings = bookings
        .filter(b => b.date >= today && b.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    // 지난 예약: 과거 날짜 + 취소 아님
    const pastBookings = bookings
        .filter(b => b.date < today && b.status !== 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date));

    // 취소된 예약: 상태가 cancelled인 모든 예약
    const cancelledBookings = bookings
        .filter(b => b.status === 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date));

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading bookings...</div>;
    }

    return (
        <div>
            <h2 style={{ marginBottom: 20, fontSize: '1.2rem' }}>예약 관리</h2>

            {/* Upcoming Bookings */}
            <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: 12 }}>다가오는 예약 ({upcomingBookings.length})</h3>
                {upcomingBookings.length === 0 ? (
                    <p style={{ color: '#999', padding: 20 }}>예정된 예약이 없습니다.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} style={{
                                padding: 16,
                                background: 'white',
                                border: '1px solid #eee',
                                borderRadius: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <User size={14} />
                                        <strong>{booking.profiles?.name || 'Guest'}</strong>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '2px 8px',
                                            background: booking.status === 'confirmed' ? '#d4edda' : '#fff3cd',
                                            color: booking.status === 'confirmed' ? '#155724' : '#856404',
                                            borderRadius: 4
                                        }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: '0.9rem' }}>
                                        <span><Calendar size={12} /> {booking.date}</span>
                                        <span><Clock size={12} /> {booking.time}</span>
                                        <span>₩{booking.total_price?.toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>
                                        {typeof booking.services?.name === 'object' ? booking.services.name.en : booking.services?.name}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelClick(booking)}
                                    style={{ color: '#dc3545', borderColor: '#dc3545' }}
                                >
                                    <X size={14} style={{ marginRight: 4 }} /> 취소
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Bookings */}
            <div>
                <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: 12 }}>지난 예약 ({pastBookings.length})</h3>
                {pastBookings.length === 0 ? (
                    <p style={{ color: '#999', padding: 20 }}>지난 예약이 없습니다.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pastBookings.slice(0, 10).map(booking => (
                            <div key={booking.id} style={{
                                padding: 12,
                                background: '#f9f9f9',
                                borderRadius: 8,
                                fontSize: '0.9rem',
                                color: '#666',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>{booking.profiles?.name || 'Guest'} - {booking.date} {booking.time}</span>
                                <span style={{
                                    color: booking.status === 'cancelled' ? '#dc3545' : '#28a745',
                                    fontWeight: 500
                                }}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancelled Bookings */}
            <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: '1rem', color: '#dc3545', marginBottom: 12 }}>취소된 예약 ({cancelledBookings.length})</h3>
                {cancelledBookings.length === 0 ? (
                    <p style={{ color: '#999', padding: 20 }}>취소된 예약이 없습니다.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cancelledBookings.slice(0, 10).map(booking => (
                            <div key={booking.id} style={{
                                padding: 12,
                                background: '#fff5f5',
                                borderRadius: 8,
                                fontSize: '0.9rem',
                                color: '#666',
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderLeft: '3px solid #dc3545'
                            }}>
                                <span>{booking.profiles?.name || 'Guest'} - {booking.date} {booking.time}</span>
                                <span style={{
                                    color: '#dc3545',
                                    fontWeight: 500
                                }}>
                                    취소됨
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelModal.open && cancelModal.booking && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 24,
                        width: '90%',
                        maxWidth: 400
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#dc3545' }}>
                            <AlertTriangle size={20} />
                            <h3 style={{ margin: 0 }}>예약 취소</h3>
                        </div>

                        <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#666' }}>
                            <strong>{cancelModal.booking.profiles?.name || 'Guest'}</strong>님의 {cancelModal.booking.date} {cancelModal.booking.time} 예약을 취소하시겠습니까?
                        </p>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                                취소 사유 선택 *
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {CANCELLATION_REASONS.map(reason => (
                                    <label key={reason.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: 10, background: selectedReason === reason.id ? '#fff0f6' : '#f5f5f5',
                                        borderRadius: 8, cursor: 'pointer',
                                        border: selectedReason === reason.id ? '2px solid #eb2f96' : '2px solid transparent'
                                    }}>
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.id}
                                            checked={selectedReason === reason.id}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                        />
                                        {reason.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                                추가 메시지 (선택)
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="고객에게 전달할 추가 메시지..."
                                style={{
                                    width: '100%', padding: 10, borderRadius: 8,
                                    border: '1px solid #ddd', fontSize: '0.9rem',
                                    minHeight: 60, resize: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => setCancelModal({ open: false, booking: null })}
                            >
                                닫기
                            </Button>
                            <Button
                                fullWidth
                                disabled={!selectedReason || cancelling}
                                onClick={handleCancelConfirm}
                                style={{ background: '#dc3545' }}
                            >
                                {cancelling ? '처리중...' : '예약 취소'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
