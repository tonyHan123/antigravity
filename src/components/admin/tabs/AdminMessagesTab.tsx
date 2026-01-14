'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, Send, Image as ImageIcon, X, ChevronDown, Users, Store, Tag, Upload, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Shop {
    id: string;
    name: any;
    category: string;
    owner_id: string;
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    image_url?: string;
    target_type: string;
    target_category?: string;
    target_shop_id?: string;
    created_at: string;
    notifications_sent?: number;
}

interface Conversation {
    conversation_id: string;
    other_user: { id: string; name: string; email: string; role: string };
    shop?: { id: string; name: any };
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    sender: { id: string; name: string; role: string };
}

export default function AdminMessagesTab() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'announcements' | 'history' | 'chat'>('announcements');

    // Announcements state
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [targetType, setTargetType] = useState<'all_users' | 'all_owners' | 'category' | 'shop'>('all_users');
    const [targetCategory, setTargetCategory] = useState('');
    const [targetShopId, setTargetShopId] = useState('');
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [announcementImage, setAnnouncementImage] = useState('');
    const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

    // Chat state
    const [shops, setShops] = useState<Shop[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [selectedShopForChat, setSelectedShopForChat] = useState<Shop | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load shops for targeting
    useEffect(() => {
        async function loadShops() {
            try {
                const res = await fetch('/api/shops');
                if (res.ok) {
                    const data = await res.json();
                    setShops(data.shops || []);
                }
            } catch (error) {
                console.error('Error loading shops:', error);
            }
        }
        loadShops();
    }, []);

    // Load announcements
    useEffect(() => {
        async function loadAnnouncements() {
            try {
                const res = await fetch('/api/admin/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data || []);
                }
            } catch (error) {
                console.error('Error loading announcements:', error);
            } finally {
                setLoadingAnnouncements(false);
            }
        }
        loadAnnouncements();
    }, []);

    // Load conversations for chat
    useEffect(() => {
        async function loadConversations() {
            try {
                setLoadingChat(true);
                const res = await fetch('/api/messages?view=conversations');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.conversations || []);
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setLoadingChat(false);
            }
        }
        if (activeTab === 'chat') {
            loadConversations();
        }
    }, [activeTab]);

    // Load messages for selected conversation
    useEffect(() => {
        async function loadMessages() {
            if (!selectedConversation) return;
            try {
                const res = await fetch(`/api/messages?view=messages&conversationId=${selectedConversation}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
        loadMessages();
    }, [selectedConversation]);

    // Realtime subscription
    useEffect(() => {
        if (!selectedConversation) return;

        const channel = supabase
            .channel(`admin-messages:${selectedConversation}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation}`
            }, async (payload) => {
                const newMessage = payload.new as Message;
                // Hydrate sender info for correct alignment
                if (user && newMessage.sender_id === user.id) {
                    newMessage.sender = {
                        id: user.id,
                        name: 'Admin',
                        role: 'admin'
                    };
                    setMessages(prev => [...prev, newMessage]);
                } else {
                    const { data: sender } = await supabase
                        .from('profiles')
                        .select('id, name, email, role')
                        .eq('id', newMessage.sender_id)
                        .single();

                    if (sender) {
                        newMessage.sender = sender;
                        setMessages(prev => [...prev, newMessage]);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation, supabase, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle image upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            setAnnouncementImage(data.publicUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`이미지 업로드 실패: ${error.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    // Send announcement
    const handleSendAnnouncement = async () => {
        if (!announcementTitle.trim() || !announcementMessage.trim()) return;

        setSendingAnnouncement(true);
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: announcementTitle.trim(),
                    message: announcementMessage.trim(),
                    image_url: announcementImage || null,
                    target_type: targetType,
                    target_category: targetType === 'category' ? targetCategory : null,
                    target_shop_id: targetType === 'shop' ? targetShopId : null,
                    created_by: user?.id
                })
            });

            if (res.ok) {
                const newAnnouncement = await res.json();
                setAnnouncements(prev => [newAnnouncement, ...prev]);
                // Switch to history tab after sending
                setActiveTab('history');
                setAnnouncementTitle('');
                setAnnouncementMessage('');
                setAnnouncementImage('');
                setTargetType('all_users');
            }
        } catch (error) {
            console.error('Error sending announcement:', error);
        } finally {
            setSendingAnnouncement(false);
        }
    };

    // Start chat with shop owner
    const startChatWithShop = async (shop: Shop) => {
        setSelectedShopForChat(shop);
        // Find or create conversation
        const existingConv = conversations.find(c => c.shop?.id === shop.id);
        if (existingConv) {
            setSelectedConversation(existingConv.conversation_id);
        } else {
            // Will create conversation on first message
            setSelectedConversation(null);
            setMessages([]);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedShopForChat) return;

        setSendingMessage(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedShopForChat.owner_id,
                    shopId: selectedShopForChat.id,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                const { message } = await res.json();
                if (!selectedConversation) {
                    setSelectedConversation(message.conversation_id);
                }
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const getShopName = (name: any) => {
        if (!name) return 'Unknown';
        if (typeof name === 'string') return name;
        return name.en || name.ko || Object.values(name)[0] || 'Shop';
    };

    const getTargetLabel = (announcement: Announcement) => {
        switch (announcement.target_type) {
            case 'all_users': return '👥 전체 User';
            case 'all_owners': return '🏪 전체 Owner';
            case 'category': return `📂 ${announcement.target_category}`;
            case 'shop': return `🏠 ${getShopName(shops.find(s => s.id === announcement.target_shop_id)?.name)}`;
            default: return announcement.target_type;
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tab Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('announcements')} // kept internal name 'announcements' for Create to minimize state refactor, or we can change logic
                    style={{
                        padding: '16px 24px', border: 'none', background: 'none',
                        borderBottom: activeTab === 'announcements' ? '3px solid #722ed1' : '3px solid transparent',
                        fontWeight: activeTab === 'announcements' ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'announcements' ? '#722ed1' : '#666',
                        fontSize: '1rem'
                    }}
                >
                    <Bell size={18} /> 📝 공지 작성
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '16px 24px', border: 'none', background: 'none',
                        borderBottom: activeTab === 'history' ? '3px solid #722ed1' : '3px solid transparent',
                        fontWeight: activeTab === 'history' ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'history' ? '#722ed1' : '#666',
                        fontSize: '1rem'
                    }}
                >
                    <Users size={18} /> 📋 발송 기록
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                        padding: '16px 24px', border: 'none', background: 'none',
                        borderBottom: activeTab === 'chat' ? '3px solid #722ed1' : '3px solid transparent',
                        fontWeight: activeTab === 'chat' ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'chat' ? '#722ed1' : '#666',
                        fontSize: '1rem'
                    }}
                >
                    <MessageCircle size={18} /> 💬 Shop 채팅
                </button>
            </div>

            {/* Content Area - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
                {/* 1. Create Announcement Tab */}
                {activeTab === 'announcements' && (
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 30px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>새로운 공지사항 작성</h3>
                                <p style={{ margin: '8px 0 0', color: '#888', fontSize: '0.9rem' }}>
                                    전체 사용자 또는 특정 그룹에게 알림을 발송합니다.
                                </p>
                            </div>

                            <div style={{ padding: 30 }}>
                                {/* Target Selection */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, color: '#333' }}>받는 사람</label>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {[
                                            { value: 'all_users', label: '전체 User', icon: <Users size={16} /> },
                                            { value: 'all_owners', label: '전체 Owner', icon: <Store size={16} /> },
                                            { value: 'category', label: '카테고리별', icon: <Tag size={16} /> },
                                            { value: 'shop', label: 'Shop별', icon: <Store size={16} /> }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setTargetType(opt.value as any)}
                                                style={{
                                                    padding: '10px 16px', borderRadius: 8, border: '1px solid',
                                                    borderColor: targetType === opt.value ? '#722ed1' : '#e0e0e0',
                                                    background: targetType === opt.value ? '#f3e8ff' : '#fff',
                                                    color: targetType === opt.value ? '#722ed1' : '#555',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                    fontSize: '0.95rem', transition: 'all 0.2s',
                                                    boxShadow: targetType === opt.value ? '0 2px 4px rgba(114, 46, 209, 0.1)' : 'none'
                                                }}
                                            >
                                                {opt.icon} {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {targetType === 'category' && (
                                    <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
                                        <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: '0.9rem' }}>카테고리 선택</label>
                                        <select
                                            value={targetCategory}
                                            onChange={(e) => setTargetCategory(e.target.value)}
                                            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        >
                                            <option value="">카테고리 선택</option>
                                            {Array.from(new Set(shops.map(s => s.category).filter(Boolean))).map((cat: string) => (
                                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {targetType === 'shop' && (
                                    <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
                                        <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: '0.9rem' }}>Shop 선택</label>
                                        <select
                                            value={targetShopId}
                                            onChange={(e) => setTargetShopId(e.target.value)}
                                            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        >
                                            <option value="">Shop 선택</option>
                                            {shops.map(shop => (
                                                <option key={shop.id} value={shop.id}>{getShopName(shop.name)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ marginBottom: 20 }}>
                                    <input
                                        type="text"
                                        placeholder="제목을 입력하세요"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 8, border: '1px solid #ddd',
                                            fontSize: '1rem', fontWeight: 500
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <textarea
                                        placeholder="내용을 입력하세요..."
                                        value={announcementMessage}
                                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                                        rows={15}
                                        style={{
                                            width: '100%', padding: 16, borderRadius: 8, border: '1px solid #ddd',
                                            fontSize: '1rem', lineHeight: '1.6', resize: 'vertical',
                                            minHeight: 300
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 30 }}>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, color: '#333' }}>
                                        이미지 첨부
                                    </label>

                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                                        {/* File Upload Button */}
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                                            background: '#fff', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer',
                                            color: '#555', fontSize: '0.9rem', transition: 'all 0.2s'
                                        }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                            {uploadingImage ? '업로드 중...' : '이미지 업로드'}
                                        </label>

                                        {/* Or text */}
                                        <span style={{ fontSize: '0.9rem', color: '#999' }}>또는</span>

                                        {/* URL Input */}
                                        <input
                                            type="text"
                                            placeholder="이미지 URL 입력 (https://...)"
                                            value={announcementImage}
                                            onChange={(e) => setAnnouncementImage(e.target.value)}
                                            style={{ flex: 1, minWidth: 200, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    {/* Preview */}
                                    {announcementImage && (
                                        <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={announcementImage}
                                                alt="Preview"
                                                style={{ maxHeight: 200, borderRadius: 8, border: '1px solid #eee' }}
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                            <button
                                                onClick={() => setAnnouncementImage('')}
                                                style={{
                                                    position: 'absolute', top: -8, right: -8, background: '#fff',
                                                    border: '1px solid #ddd', borderRadius: '50%', padding: 4, cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <Button
                                        onClick={handleSendAnnouncement}
                                        disabled={sendingAnnouncement || !announcementTitle || !announcementMessage}
                                        style={{
                                            padding: '12px 32px', fontSize: '1rem', borderRadius: 8,
                                            background: '#722ed1', border: 'none'
                                        }}
                                    >
                                        {sendingAnnouncement ? '발송 중...' : '공지 발송하기'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. History Tab */}
                {activeTab === 'history' && (
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>발송 기록</h3>
                            <span style={{ color: '#888' }}>총 {announcements.length}건</span>
                        </div>

                        {loadingAnnouncements ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>
                        ) : announcements.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 60, color: '#888', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
                                발송한 공지가 없습니다
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                                {announcements.map(ann => (
                                    <div
                                        key={ann.id}
                                        onClick={() => setSelectedAnnouncement(ann)}
                                        style={{
                                            padding: 20, background: '#fff', border: '1px solid #eee', borderRadius: 12,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            height: '100%', display: 'flex', flexDirection: 'column'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                        }}
                                    >
                                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{
                                                fontSize: '0.75rem', background: '#f0f5ff', color: '#2f54eb',
                                                padding: '3px 8px', borderRadius: 6, fontWeight: 600
                                            }}>
                                                {getTargetLabel(ann)}
                                            </span>
                                            {ann.notifications_sent !== undefined && (
                                                <span style={{ fontSize: '0.75rem', color: '#52c41a' }}>
                                                    ✔️ {ann.notifications_sent}
                                                </span>
                                            )}
                                        </div>

                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ann.title}
                                        </h4>

                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
                                            {ann.message}
                                        </p>

                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f5f5f5', fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{new Date(ann.created_at).toLocaleDateString('ko-KR')}</span>
                                            {ann.image_url && <ImageIcon size={14} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Detail Modal */}
                        {selectedAnnouncement && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
                            }} onClick={() => setSelectedAnnouncement(null)}>
                                <div
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
                                        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>공지 상세</h3>
                                        <button
                                            onClick={() => setSelectedAnnouncement(null)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#999' }}
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div style={{ padding: 30 }}>
                                        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.85rem', background: '#f0f5ff', color: '#2f54eb',
                                                padding: '6px 12px', borderRadius: 20, fontWeight: 600
                                            }}>
                                                {getTargetLabel(selectedAnnouncement)}
                                            </span>
                                            <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                                {new Date(selectedAnnouncement.created_at).toLocaleString('ko-KR')}
                                            </span>
                                        </div>

                                        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#111', lineHeight: '1.4' }}>
                                            {selectedAnnouncement.title}
                                        </h2>

                                        <div style={{ fontSize: '1rem', color: '#444', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: 30 }}>
                                            {selectedAnnouncement.message}
                                        </div>

                                        {selectedAnnouncement.image_url && (
                                            <div style={{ marginBottom: 30 }}>
                                                <img
                                                    src={selectedAnnouncement.image_url}
                                                    alt="첨부 이미지"
                                                    style={{ width: '100%', borderRadius: 12, border: '1px solid #eee' }}
                                                />
                                            </div>
                                        )}

                                        {selectedAnnouncement.notifications_sent !== undefined && (
                                            <div style={{ background: '#f6ffed', padding: '12px 16px', borderRadius: 8, border: '1px solid #b7eb8f', color: '#389e0d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Users size={16} />
                                                총 {selectedAnnouncement.notifications_sent}명에게 알림이 발송되었습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Shop Chat Tab */}
                {activeTab === 'chat' && (
                    <div style={{ display: 'flex', height: 600, border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {/* Shop List */}
                        <div style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto', background: '#fafafa' }}>
                            <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>
                                Shop 목록 ({shops.length})
                            </div>
                            {shops.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                                    표시할 Shop이 없습니다
                                </div>
                            ) : (
                                shops.map(shop => (
                                    <div
                                        key={shop.id}
                                        onClick={() => startChatWithShop(shop)}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: '1px solid #f0f0f0',
                                            cursor: 'pointer',
                                            background: selectedShopForChat?.id === shop.id ? '#fff' : 'transparent',
                                            borderLeft: selectedShopForChat?.id === shop.id ? '4px solid #722ed1' : '4px solid transparent',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, color: selectedShopForChat?.id === shop.id ? '#722ed1' : '#333' }}>
                                            {getShopName(shop.name)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {shop.category}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {selectedShopForChat ? (
                                <>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#fff', fontSize: '1rem' }}>
                                        {getShopName(selectedShopForChat.name)} <span style={{ fontWeight: 400, color: '#888', fontSize: '0.9rem' }}>님과의 대화</span>
                                    </div>
                                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#f5f7fa', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {messages.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: '#999', marginTop: 100 }}>
                                                <MessageCircle size={40} style={{ marginBottom: 10, opacity: 0.2 }} />
                                                <p>첫 메시지를 보내 대화를 시작해보세요</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        alignSelf: msg.sender?.role === 'admin' ? 'flex-end' : 'flex-start',
                                                        maxWidth: '65%',
                                                        padding: '12px 18px',
                                                        borderRadius: msg.sender?.role === 'admin' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                        background: msg.sender?.role === 'admin' ? '#722ed1' : '#fff',
                                                        color: msg.sender?.role === 'admin' ? '#fff' : '#333',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{msg.content}</p>
                                                    <span style={{
                                                        display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: 4, textAlign: 'right',
                                                        color: msg.sender?.role === 'admin' ? '#e0d4fc' : '#999'
                                                    }}>
                                                        {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div style={{ padding: 20, borderTop: '1px solid #eee', display: 'flex', gap: 10, background: '#fff' }}>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="메시지를 입력하세요..."
                                            style={{ flex: 1, padding: '14px 18px', borderRadius: 24, border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sendingMessage || !newMessage.trim()}
                                            style={{
                                                padding: '0 24px', background: '#722ed1', color: '#fff',
                                                border: 'none', borderRadius: 24, cursor: 'pointer',
                                                fontSize: '0.95rem', fontWeight: 600,
                                                opacity: sendingMessage || !newMessage.trim() ? 0.6 : 1,
                                                display: 'flex', alignItems: 'center', gap: 6
                                            }}
                                        >
                                            전송 <Send size={16} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', background: '#fcfcfc' }}>
                                    <Store size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                                    <p style={{ fontSize: '1.1rem' }}>왼쪽 목록에서 Shop을 선택하여 대화를 시작하세요</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
