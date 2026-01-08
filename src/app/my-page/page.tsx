
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { Calendar, Clock, MapPin, XCircle, User as UserIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MOCK_BOOKINGS, MOCK_SHOPS } from '@/lib/mockData';
import styles from './mypage.module.css';

export default async function MyPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    // Filter Bookings for THIS logged in user
    // For demo: We will show the same mock bookings if the email matches 'visitor@example.com' OR just show them all for 'user' role to simulate
    // But strictly speaking, let's filter by email to show the "isolation".
    // Since our mock data has 'userId: user-guest', let's pretend the logged in user OWNS those bookings if they are a 'user'.

    // NOTE: In a real app, strict ID matching. Here, for demo user experience:
    // If I login as 'phdddblack', I might want to see bookings too? No, admin sees dashboard.
    // Let's assume ANY logged in 'user' claims the 'user-guest' bookings for this demo.

    const myBookings = MOCK_BOOKINGS.filter(b => b.userId === 'user-guest').map(booking => {
        const shop = MOCK_SHOPS.find(s => s.id === booking.shopId);
        const service = shop?.services.find(s => s.id === booking.serviceId);
        return { ...booking, shop, service };
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
                        <h3>{session.user.name || 'User'}</h3>
                        <p>{session.user.email}</p>
                        <div className={styles.badge}>{session.user.role}</div>
                    </div>
                </div>

                {/* Bookings Content */}
                <div className={styles.content}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>My Bookings</h2>

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
                                    <div className={styles.serviceName}>
                                        {booking.service?.name}
                                    </div>
                                    <div className={styles.price}>
                                        ₩{booking.totalPrice.toLocaleString()}
                                    </div>
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
    );
}
