'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    created_at: string;
}

const USERS_PER_PAGE = 20;

export default function AdminUsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users when search or role filter changes
    useEffect(() => {
        let result = users;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.email.toLowerCase().includes(query) ||
                u.name?.toLowerCase().includes(query)
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [users, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
                setFilteredUsers(data.users || []);
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
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                alert('Role updated successfully');
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            alert('Error updating role');
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading users...</div>;

    return (
        <div style={{ padding: 24, paddingBottom: 100 }}>
            {/* Header with stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>User Management</h2>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: '#666' }}>
                    <span>Total: <strong>{users.length}</strong></span>
                    <span>Admin: <strong style={{ color: '#0369a1' }}>{users.filter(u => u.role === 'admin').length}</strong></span>
                    <span>Owner: <strong style={{ color: '#be185d' }}>{users.filter(u => u.role === 'owner').length}</strong></span>
                    <span>User: <strong>{users.filter(u => u.role === 'user').length}</strong></span>
                </div>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem' }}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin Only</option>
                    <option value="owner">Owner Only</option>
                    <option value="user">User Only</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>User info</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Current Role</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Change Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
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
                                    <select
                                        value={user.role}
                                        onChange={(e) => {
                                            if (e.target.value !== user.role) {
                                                handleRoleChange(user.id, e.target.value);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 6,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="user">User</option>
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px',
                            border: '1px solid #e5e7eb', borderRadius: 6, background: 'white',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px',
                            border: '1px solid #e5e7eb', borderRadius: 6, background: 'white',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Info */}
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
                Showing {paginatedUsers.length} of {filteredUsers.length} users
                {searchQuery || roleFilter !== 'all' ? ' (filtered)' : ''}
            </div>
        </div>
    );
}
