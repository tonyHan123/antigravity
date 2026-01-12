"use client";

export default function UserManagement() {
    return (
        <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3>User Management</h3>
            <p style={{ color: '#666' }}>Manage platform users and their roles.</p>
            {/* Simple Mock Table */}
            <div style={{ marginTop: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: 12, textAlign: 'left' }}>User</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Role</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: 12 }}>phdddblack@gmail.com</td>
                            <td style={{ padding: 12 }}>Admin</td>
                            <td style={{ padding: 12 }}>2025-01-01</td>
                        </tr>
                        <tr>
                            <td style={{ padding: 12 }}>visitor@example.com</td>
                            <td style={{ padding: 12 }}>User</td>
                            <td style={{ padding: 12 }}>2026-01-02</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
