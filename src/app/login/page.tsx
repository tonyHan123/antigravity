"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("phdddblack@gmail.com");
    const [password, setPassword] = useState("1234");
    const [isLoading, setIsLoading] = useState(false);

    // Helper: Always sign out before signing in to ensure fresh session
    const forceSignIn = async (provider: string, options: any) => {
        await signOut({ redirect: false }); // Clear old session first
        await signIn(provider, options);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await forceSignIn("credentials", {
                email,
                password,
                callbackUrl: "/my-page",
            });
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await forceSignIn("google", { callbackUrl: "/my-page" });
    };

    const handleDemoLogin = async (demoEmail: string) => {
        setIsLoading(true);
        try {
            await forceSignIn("credentials", {
                email: demoEmail,
                password: "123",
                callbackUrl: "/my-page",
            });
        } catch (error) {
            console.error("Demo login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

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
                <Button variant="outline" fullWidth className={styles.googleBtn} onClick={handleGoogleLogin}>
                    Continue with Google
                </Button>

                <div className={styles.divider}>or</div>

                {/* Credentials Sign In */}
                <form className={styles.form} onSubmit={handleEmailLogin}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Any password works"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In with Email"}
                    </Button>
                </form>

                <p className={styles.footerText}>
                    Demo Accounts:<br />
                    Admin: phdddblack@gmail.com<br />
                    Owner: owner@shop1.com
                </p>

                {/* Quick Login Buttons */}
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoLogin("user@example.com")}
                        disabled={isLoading}
                    >
                        User Demo
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoLogin("owner@shop1.com")}
                        disabled={isLoading}
                    >
                        Owner Demo
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoLogin("admin@example.com")}
                        disabled={isLoading}
                    >
                        Admin Demo
                    </Button>
                </div>
            </div>
        </div>
    );
}
