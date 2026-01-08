
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { MOCK_BOOKINGS, MOCK_SHOPS, MOCK_USER } from '@/lib/mockData';
import styles from './admin.module.css';

export default async function PartnerDashboard() {
    const session = await auth();

    // 1. Check Auth & Role
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
        return <div className="container">Access Denied</div>;
    }

    // 2. Filter Logic
    // If Admin (phdddblack@gmail.com) -> See ALL
    // If Owner -> See ONLY their shopId
    const userShopId = session.user.shopId;
    const isSuperAdmin = session.user.role === 'admin';

    const relevantBookings = MOCK_BOOKINGS.filter(b => {
        if (isSuperAdmin) return true;
        return b.shopId === userShopId;
    });

    // Enrich data
    const bookings = relevantBookings.map(b => {
        const shop = MOCK_SHOPS.find(s => s.id === b.shopId);
        const service = shop?.services.find(srv => srv.id === b.serviceId);
        // In a real app we would fetch the user from DB. Here we just use the name from session if it matches or "Guest"
        return {
            ...b,
            shopName: shop?.name,
            serviceName: service?.name,
            // For demo, just show fixed name, but in real DB you'd join User table
            userName: b.userId === 'user-guest' ? 'Foreign Visitor' : 'Registered User'
        };
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    return (
        <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
            <div className={styles.header}>
                <div style={{ marginBottom: '8px' }}>
                    <span className={styles.status} style={{ background: '#333', color: 'white' }}>
                        {isSuperAdmin ? 'Super Admin' : 'Partner Portal'}
                    </span>
                </div>
                <h1 className="text-serif">
                    {isSuperAdmin ? 'Platform Overview' : 'Shop Management'}
                </h1>
                <p>
                    Welcome, {session.user.email}
                    {!isSuperAdmin && ` (Managing Shop ID: ${userShopId})`}
                </p>
            </div>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h3>Total Bookings</h3>
                    <div className={styles.statValue}>{bookings.length}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Est. Revenue</h3>
                    <div className={styles.statValue}>₩{totalRevenue.toLocaleString()}</div>
                </div>
            </div>

            <div className={styles.schedule}>
                <h2 className={styles.scheduleTitle}>Upcoming Schedule</h2>

                {bookings.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Shop</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.date}</td>
                                    <td>{booking.time}</td>
                                    <td>{booking.userName}</td>
                                    <td>{booking.serviceName}</td>
                                    <td>{booking.shopName}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        No bookings found for your shop(s).
                    </div>
                )}
            </div>
        </div>
    );
}
