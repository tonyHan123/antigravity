
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { Calendar, Clock, MapPin, XCircle, User as UserIcon, LayoutDashboard, Store, TrendingUp, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { MOCK_BOOKINGS, MOCK_SHOPS } from '@/lib/mockData';
import styles from './mypage.module.css';

export default async function MyPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const role = session.user.role;
    const userEmail = session.user.email;

    // 1. Common Data Fetching (Simple Mock logic)
    const myBookings = MOCK_BOOKINGS.filter(b => b.userId === 'user-guest').map(booking => {
        const shop = MOCK_SHOPS.find(s => s.id === booking.shopId);
        const service = shop?.services.find(s => s.id === booking.serviceId);
        return { ...booking, shop, service };
    });

    // 2. Conditional Rendering for Roles
    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <h1 className={`${styles.title} text-serif`}>
                {role === 'admin' ? 'System Control' : role === 'owner' ? 'Business Center' : 'My Trip'}
            </h1>

            <div className={styles.layout}>
                {/* Profile Sidebar */}
                <div className={styles.profileSidebar}>
                    <div className={styles.avatar}>
                        <UserIcon size={40} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h3>{session.user.name || 'User'}</h3>
                        <p>{userEmail}</p>
                        <div className={styles.badge}>{role?.toUpperCase()}</div>
                    </div>

                    {/* Role-Specific Secondary Actions */}
                    {(role === 'admin' || role === 'owner') && (
                        <div style={{ marginTop: 24, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 12 }}>Manager Shortcuts</p>
                            <Link href="/admin">
                                <Button fullWidth variant="outline" size="sm">
                                    <LayoutDashboard size={14} style={{ marginRight: 8 }} />
                                    Full Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className={styles.content}>

                    {/* --- ADMIN VIEW --- */}
                    {role === 'admin' && (
                        <div className={styles.adminDashboard}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Platform Snapshot</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                <div style={{ padding: 16, background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
                                    <h4 style={{ color: '#888', fontSize: '0.75rem' }}>Total Shops</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>85</p>
                                </div>
                                <div style={{ padding: 16, background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
                                    <h4 style={{ color: '#888', fontSize: '0.75rem' }}>New Bookings (Today)</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>12</p>
                                </div>
                            </div>
                            <Button variant="primary">Manage Platform Settings</Button>
                        </div>
                    )}

                    {/* --- OWNER VIEW --- */}
                    {role === 'owner' && (
                        <div className={styles.ownerDashboard}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Shop Performance</h2>
                            <div style={{ padding: 20, background: 'linear-gradient(135deg, #fff 0%, #fff9f9 100%)', border: '1px solid #ffe8e8', borderRadius: 12, marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Jenny House Premium</h3>
                                        <p style={{ color: '#666', fontSize: '0.85rem' }}>Next Customer at 14:00 PM</p>
                                    </div>
                                    <TrendingUp color="#ff4d4f" />
                                </div>
                            </div>
                            <Link href="/admin">
                                <Button>Check Today's Schedule</Button>
                            </Link>
                        </div>
                    )}

                    {/* --- USER VIEW (Default for all, but primary for 'user') --- */}
                    <div className={styles.bookingSection} style={{ marginTop: (role === 'admin' || role === 'owner') ? 40 : 0 }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                            {role === 'user' ? 'My Upcoming Bookings' : 'Personal Reservations'}
                        </h2>

                        <div className={styles.bookingList}>
                            {myBookings.map((booking) => (
                                <div key={booking.id} className={styles.bookingCard}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.shopName}>{booking.shop?.name}</span>
                                        <span className={`${styles.status} ${styles[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.infoRow}>
                                            <MapPin size={16} /> {booking.shop?.region}
                                        </div>
                                        <div className={styles.infoRow}>
                                            <Calendar size={16} /> {booking.date}
                                            <Clock size={16} style={{ marginLeft: 8 }} /> {booking.time}
                                        </div>
                                        <div className={styles.serviceName}>{booking.service?.name}</div>
                                        <div className={styles.price}>₩{booking.totalPrice.toLocaleString()}</div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <Button variant="outline" size="sm">
                                            <XCircle size={14} style={{ marginRight: 4 }} /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {myBookings.length === 0 && (
                                <div className={styles.empty}>You have no upcoming bookings.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
