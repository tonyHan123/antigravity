
import Link from 'next/link';
import UserButton from '@/components/layout/UserButton';
import LanguageSelector from '@/components/features/LanguageSelector';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
    // Navbar is now a Server Component (mostly), enabling async UserButton
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={`${styles.logo} text-serif`}>
                    K-Beauty<span className="text-gold">.</span>
                </Link>
                <div className={styles.links}>
                    <Link href="/search?category=Hair">Hair</Link>
                    <Link href="/search?category=Nail">Nail</Link>
                    <Link href="/search?category=Massage">Massage</Link>
                    <Link href="/search?category=Makeup">Makeup</Link>
                </div>
                <div className={styles.actions}>
                    <LanguageSelector />
                    <UserButton />
                    <Link href="/my-page">
                        <Button variant="outline" size="sm">
                            Partner / Admin
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
