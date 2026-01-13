
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, User as UserIcon, Heart, Package, HelpCircle, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getMyBookings, Booking, getShops, Shop } from '@/lib/api';
import styles from './mypage.module.css';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCoupons } from '@/components/providers/CouponProvider';
import ShopCard from '@/components/features/ShopCard';
import WriteReviewModal from '@/components/features/WriteReviewModal';
import SuperAdminDashboard from '@/components/admin/SuperAdminDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';
import CustomerSupport from '@/components/features/HelpCenter';

export default function MyPage() {
    const router = useRouter();
    const { language, t } = useLanguage();
    const { wishlist } = useWishlist();
    const { claimedCoupons } = useCoupons();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'notifications' | 'support' | 'wishlist' | 'profile' | 'coupons'>('upcoming');

    // Notifications state
    const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean; created_at: string }[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    // Data states
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedShopForReview, setSelectedShopForReview] = useState<{ id: string; name: string } | null>(null);

    // Use real session from AuthProvider
    const { user: sessionUser } = useAuth();
    const [user, setUser] = useState<{ name: string; email: string; role: string; shopId?: string } | null>(null);

    // Helper to get localized string
    const getL = (obj: { en: string; jp?: string; cn?: string } | string | undefined) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (language === 'jp' && obj.jp) return obj.jp;
        if (language === 'cn' && obj.cn) return obj.cn;
        return obj.en;
    };

    // Load bookings from API
    useEffect(() => {
        async function loadBookings() {
            try {
                const data = await getMyBookings();
                setBookings(data);
            } catch (error) {
                console.error('Failed to load bookings:', error);
            } finally {
                setLoadingBookings(false);
            }
        }
        if (sessionUser) {
            loadBookings();
        }
    }, [sessionUser]);

    // Load all shops for wishlist display
    useEffect(() => {
        async function loadShops() {
            try {
                const data = await getShops();
                setAllShops(data);
            } catch (error) {
                console.error('Failed to load shops:', error);
            } finally {
                setLoadingShops(false);
            }
        }
        loadShops();
    }, []);

    // Load notifications
    useEffect(() => {
        async function loadNotifications() {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setLoadingNotifications(false);
            }
        }
        if (sessionUser) {
            loadNotifications();
        }
    }, [sessionUser]);

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Cancellation Logic (24h Free / <24h Non-refundable)
    const handleCancelBooking = async (booking: Booking) => {
        const now = new Date();
        const bookingDate = new Date(`${booking.date}T${booking.time}`);
        const diffMs = bookingDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            alert("Cancellation is NOT allowed within 24 hours of the appointment.\n\nAccording to our policy, same-day cancellations are non-refundable (100% penalty).");
            return;
        }

        const message = `Free cancellation is available (more than 24 hours in advance). You will receive a full refund.\n\nDo you really want to cancel?`;

        if (confirm(message)) {
            try {
                await fetch(`/api/bookings/${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' }),
                });
                // Update local state
                setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b));
                alert('Booking cancelled successfully. Refund will be processed shortly.');
            } catch (error) {
                console.error('Failed to cancel booking:', error);
                alert('Failed to cancel booking. Please try again.');
            }
        }
    };

    useEffect(() => {
        if (sessionUser) {
            setUser({
                name: sessionUser.name || 'User',
                email: sessionUser.email || '',
                role: sessionUser.role || 'user',
                shopId: sessionUser.shopId
            });
        }
    }, [sessionUser]);

    if (!user) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;

    // Role-based Conditional Rendering
    if (user.role === 'admin') {
        return (
            <div className="container" style={{ padding: '20px 0' }}>
                <SuperAdminDashboard />
            </div>
        );
    }

    if (user.role === 'owner') {
        return (
            <div className="container" style={{ padding: '20px 0' }}>
                {user.shopId ? (
                    <OwnerDashboard shopId={user.shopId} />
                ) : (
                    <div className="container">
                        <h2>No Shop Assigned</h2>
                        <p>Please contact support to register your shop.</p>
                    </div>
                )}
            </div>
        );
    }

    // Filter bookings
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = bookings
        .filter(b => b.date >= today && b.status !== 'cancelled')
        .sort((a, b) => {
            // Sort by date ascending (closest first), then by time
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });
    const pastBookings = bookings
        .filter(b => b.date < today || b.status === 'cancelled')
        .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    // Filter wishlist shops
    const wishlistShops = allShops.filter(shop => wishlist.includes(shop.id));

    // Format shop for ShopCard
    const formatShopForCard = (shop: Shop) => ({
        id: shop.id,
        name: getL(shop.name),
        category: shop.category,
        region: getL(shop.region),
        rating: shop.rating,
        reviewCount: shop.review_count,
        imageUrl: shop.image_url || '/images/placeholder.jpg',
        priceRange: shop.services?.[0]?.price ? `₩${shop.services[0].price.toLocaleString()}~` : '₩50,000~',
    });

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <h1 className={`${styles.title} text-serif`}>My Trip</h1>

            <div className={styles.layout}>
                {/* Profile Sidebar */}
                <div className={styles.profileSidebar}>
                    <div className={styles.avatar}>
                        <UserIcon size={40} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                        <div className={styles.badge}>USER</div>
                    </div>

                    <div className={styles.sidebarMenu}>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <UserIcon size={18} /> Profile
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'upcoming' ? styles.active : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            <Calendar size={18} /> Upcoming
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'history' ? styles.active : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <Clock size={18} /> History
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'wishlist' ? styles.active : ''}`}
                            onClick={() => setActiveTab('wishlist')}
                        >
                            <Heart size={18} /> Wishlist
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'coupons' ? styles.active : ''}`}
                            onClick={() => setActiveTab('coupons')}
                        >
                            <span style={{ marginRight: 8 }}>🏷️</span> Coupons
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                            onClick={() => setActiveTab('notifications')}
                            style={{ position: 'relative' }}
                        >
                            <Bell size={18} /> Notifications
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    background: '#dc3545',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 18,
                                    height: 18,
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            className={`${styles.menuItem} ${activeTab === 'support' ? styles.active : ''}`}
                            onClick={() => setActiveTab('support')}
                        >
                            <HelpCircle size={18} /> Help Center
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.content}>

                    {/* BOOKINGS VIEW */}
                    {(activeTab === 'upcoming' || activeTab === 'history') && (
                        <div className={styles.bookingSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                                {activeTab === 'upcoming' ? 'Upcoming Bookings' : 'Booking History'}
                            </h2>

                            {loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading bookings...</div>
                            ) : (
                                <div className={styles.bookingList}>
                                    {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => {
                                        const shop = booking.shops as unknown as { id: string; name: { en: string }; image_url: string; category: string } | undefined;
                                        const service = booking.services as unknown as { id: string; name: { en: string }; price: number } | undefined;
                                        return (
                                            <div key={booking.id} className={`${styles.bookingCard}`}>
                                                <div className={styles.cardHeader}>
                                                    <span className={styles.shopName}>{getL(shop?.name)}</span>
                                                </div>

                                                <div className={styles.cardBody}>
                                                    <div className={styles.infoRow}>
                                                        <MapPin size={16} /> {shop?.category || 'Beauty'}
                                                    </div>
                                                    <div className={styles.infoRow}>
                                                        <Calendar size={16} /> {booking.date}
                                                        <Clock size={16} style={{ marginLeft: 8 }} /> {booking.time}
                                                    </div>
                                                    <div className={styles.serviceName}>
                                                        <Package size={14} style={{ marginRight: 4 }} /> {getL(service?.name)}
                                                    </div>
                                                    <div className={styles.price}>₩{booking.totalPrice?.toLocaleString()}</div>
                                                </div>

                                                <div className={styles.cardFooter}>
                                                    {activeTab === 'upcoming' && booking.status !== 'cancelled' ? (
                                                        <div style={{ display: 'flex', justifySelf: 'flex-end', width: '100%', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => handleCancelBooking(booking)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#999',
                                                                    fontSize: '0.75rem',
                                                                    textDecoration: 'underline',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    padding: 0
                                                                }}
                                                            >
                                                                Cancel Booking
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        booking.status === 'confirmed' && ( // Changed from completed for MVP
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const shopName = getL(shop?.name) || 'Shop';
                                                                    setSelectedShopForReview({ id: shop!.id, name: shopName });
                                                                    setIsReviewModalOpen(true);
                                                                }}
                                                            >
                                                                Write Review
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
                                        <div className={styles.empty}>
                                            {activeTab === 'upcoming'
                                                ? "You have no upcoming bookings."
                                                : "You haven't completed any bookings yet."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && (
                        <div className={styles.bookingSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Notifications</h2>
                            {loadingNotifications ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className={styles.empty}>No notifications yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                                            style={{
                                                padding: 16,
                                                background: notification.is_read ? '#f9f9f9' : '#fff0f6',
                                                border: notification.is_read ? '1px solid #eee' : '2px solid #eb2f96',
                                                borderRadius: 12,
                                                cursor: notification.is_read ? 'default' : 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <h4 style={{ margin: 0, color: notification.is_read ? '#666' : '#c41d7f' }}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <span style={{
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: 12,
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#999' }}>
                                                {new Date(notification.created_at).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* HELP CENTER VIEW */}
                    {activeTab === 'support' && (
                        <div className={styles.supportSection}>
                            <CustomerSupport historyBookings={pastBookings} />
                        </div>
                    )}

                    {/* Review Modal */}
                    {selectedShopForReview && (
                        <WriteReviewModal
                            isOpen={isReviewModalOpen}
                            onClose={() => setIsReviewModalOpen(false)}
                            shopName={selectedShopForReview.name}
                            onSubmit={(data) => {
                                console.log('Review Submitted:', data, 'for shop:', selectedShopForReview.id);
                                alert('Review and photos submitted successfully!');
                            }}
                        />
                    )}

                    {/* WISHLIST VIEW */}
                    {activeTab === 'wishlist' && (
                        <div className={styles.wishlistSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>My Wishlist</h2>
                            {loadingShops ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
                            ) : (
                                <div className={styles.grid}>
                                    {wishlistShops.map(shop => (
                                        <ShopCard key={shop.id} shop={formatShopForCard(shop)} />
                                    ))}
                                    {wishlistShops.length === 0 && (
                                        <div className={styles.empty}>Your wishlist is empty.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* COUPONS VIEW */}
                    {activeTab === 'coupons' && (
                        <div className={styles.wishlistSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>My Coupon Wallet</h2>
                            <div className={styles.grid}>
                                {claimedCoupons.map(coupon => (
                                    <div key={coupon.id} style={{ padding: 20, background: 'white', border: '1px solid #eee', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ color: '#eb2f96', marginBottom: 4 }}>{getL(coupon.name)}</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{getL(coupon.description)}</p>
                                            <div style={{ fontSize: '0.8rem', marginTop: 8, padding: '2px 8px', background: '#fff0f6', color: '#c41d7f', display: 'inline-block', borderRadius: 4 }}>
                                                {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `₩${coupon.discountValue.toLocaleString()} OFF`}
                                            </div>
                                        </div>
                                        <Link href="/search">
                                            <Button size="sm">Use Now</Button>
                                        </Link>
                                    </div>
                                ))}
                                {claimedCoupons.length === 0 && (
                                    <div className={styles.empty}>You haven't claimed any coupons yet. Visit shops to find deals!</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PROFILE VIEW */}
                    {activeTab === 'profile' && (
                        <div className={styles.settingsSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Profile Settings</h2>
                            <div className={styles.formGroup}>
                                <label>Nickname</label>
                                <input type="text" defaultValue={user.name} className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" value={user.email} disabled className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input type="tel" placeholder="+82 10-0000-0000" className={styles.input} />
                            </div>
                            <Button>Save Changes</Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
