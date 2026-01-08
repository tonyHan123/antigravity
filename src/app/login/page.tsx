
import { signIn } from "@/auth";
import { headers } from "next/headers";
import Button from "@/components/ui/Button";
import styles from "./login.module.css";

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className="text-serif" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '8px' }}>
                    Welcome Back
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                    Sign in to manage your bookings
                </p>

                {/* Google Sign In */}
                <form
                    action={async () => {
                        "use server";
                        await signIn("google", { redirectTo: "/" });
                    }}
                >
                    <Button variant="outline" fullWidth className={styles.googleBtn}>
                        Continue with Google
                    </Button>
                </form>

                <div className={styles.divider}>or</div>

                {/* Credentials Sign In */}
                <form
                    className={styles.form}
                    action={async (formData) => {
                        "use server";
                        await signIn("credentials", formData);
                    }}
                >
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input name="email" type="email" placeholder="example@email.com" required defaultValue="phdddblack@gmail.com" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Any password works" required defaultValue="1234" />
                    </div>
                    <Button type="submit" fullWidth>Sign In with Email</Button>
                </form>

                <p className={styles.footerText}>
                    Demo Accounts:<br />
                    Admin: phdddblack@gmail.com<br />
                    Owner: owner@shop1.com
                </p>
            </div>
        </div>
    );
}
