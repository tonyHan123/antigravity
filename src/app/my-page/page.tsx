
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, XCircle, User as UserIcon, LayoutDashboard, Heart, Settings, LogOut, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { MOCK_BOOKINGS, MOCK_SHOPS } from '@/lib/mockData';
import styles from './mypage.module.css';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCoupons } from '@/components/providers/CouponProvider';
import ShopCard from '@/components/features/ShopCard';
import SuperAdminDashboard from '@/components/admin/SuperAdminDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';

export default function MyPage() {
    const router = useRouter();
    const { getL, t } = useLanguage();
    const { wishlist } = useWishlist();
    const { claimedCoupons } = useCoupons();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'wishlist' | 'settings' | 'coupons'>('upcoming');

    // Use real session from AuthProvider
    const { user: sessionUser } = useAuth();
    // Maintain local state for immediate feedback, but sync with session
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        if (sessionUser) {
            setUser({
                name: sessionUser.name || 'User',
                email: sessionUser.email || '',
                role: sessionUser.role || 'user'
            });
        }
    }, [sessionUser]);

    if (!user) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;

    // 4. Role-based Conditional Rendering
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
                <OwnerDashboard shopId={'shop-1'} />
            </div>
        );
    }

    const myBookings = MOCK_BOOKINGS.filter(b => b.userId === 'user-guest');
    const upcomingBookings = myBookings.filter(b => new Date(b.date) >= new Date());
    const pastBookings = myBookings.filter(b => new Date(b.date) < new Date());

    const wishlistShops = MOCK_SHOPS.filter(shop => wishlist.includes(shop.id));

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
                            className={`${styles.menuItem} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} /> Settings
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

                            <div className={styles.bookingList}>
                                {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => {
                                    const shop = MOCK_SHOPS.find(s => s.id === booking.shopId);
                                    const service = shop?.services.find(s => s.id === booking.serviceId);
                                    return (
                                        <div key={booking.id} className={`${styles.bookingCard} ${styles[booking.status]}`}>
                                            <div className={styles.cardHeader}>
                                                <span className={styles.shopName}>{getL(shop?.name)}</span>
                                                <span className={`${styles.status} ${styles[booking.status]}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className={styles.cardBody}>
                                                <div className={styles.infoRow}>
                                                    <MapPin size={16} /> {getL(shop?.region)}
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <Calendar size={16} /> {booking.date}
                                                    <Clock size={16} style={{ marginLeft: 8 }} /> {booking.time}
                                                </div>
                                                <div className={styles.serviceName}>
                                                    <Package size={14} style={{ marginRight: 4 }} /> {getL(service?.name)}
                                                </div>
                                                <div className={styles.price}>₩{booking.totalPrice.toLocaleString()}</div>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                {activeTab === 'upcoming' ? (
                                                    <Button variant="outline" size="sm">
                                                        <XCircle size={14} style={{ marginRight: 4 }} /> Cancel
                                                    </Button>
                                                ) : (
                                                    <Button variant="primary" size="sm">
                                                        Write Review
                                                    </Button>
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
                        </div>
                    )}

                    {/* WISHLIST VIEW */}
                    {activeTab === 'wishlist' && (
                        <div className={styles.wishlistSection}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>My Wishlist</h2>
                            <div className={styles.grid}>
                                {wishlistShops.map(shop => (
                                    <ShopCard key={shop.id} shop={shop} />
                                ))}
                                {wishlistShops.length === 0 && (
                                    <div className={styles.empty}>Your wishlist is empty.</div>
                                )}
                            </div>
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
                                            <h3 style={{ color: '#eb2f96', marginBottom: 4 }}>{coupon.name}</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{coupon.description}</p>
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

                    {/* SETTINGS VIEW */}
                    {activeTab === 'settings' && (
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
