import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.top}>
                    <div>
                        <h3 className="text-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                            K-Beauty<span className="text-gold">.</span>
                        </h3>
                        <p className={styles.subtext}>
                            The premium booking platform for Korean beauty services.<br />
                            Experience the best of K-Beauty.
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h4>Services</h4>
                        <ul>
                            <li>Hair Salons</li>
                            <li>Nail Art</li>
                            <li>Spas & Massage</li>
                            <li>Makeup Studios</li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h4>Support</h4>
                        <ul>
                            <li>Help Center</li>
                            <li>For Partners</li>
                            <li>Terms of Service</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} K-Beauty Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
