'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, Check } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    created_at: string;
}

export default function AdminUsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole })
            });

            if (res.ok) {
                // Optimistic update
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                alert('Role updated successfully');
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            alert('Error updating role');
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading users...</div>;

    return (
        <div style={{ padding: 24, paddingBottom: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>User Management</h2>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Users: {users.length}</div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>User info</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Current Role</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600, color: '#111' }}>{user.name || 'No Name'}</div>
                                    <div style={{ color: '#666', fontSize: '0.85rem' }}>{user.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                                        background: user.role === 'admin' ? '#e0f2fe' : user.role === 'owner' ? '#fdf2f8' : '#f3f4f6',
                                        color: user.role === 'admin' ? '#0369a1' : user.role === 'owner' ? '#be185d' : '#374151',
                                        display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize'
                                    }}>
                                        {user.role === 'admin' && <Shield size={12} />}
                                        {user.role === 'owner' && <ShieldCheck size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {user.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 'owner')}
                                                style={{ border: '1px solid #d1d5db', background: 'white', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Make Owner
                                            </button>
                                        )}
                                        {user.role !== 'user' && (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 'user')}
                                                style={{ border: '1px solid #d1d5db', background: 'white', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Make User
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
