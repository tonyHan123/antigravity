'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, Send, Image as ImageIcon, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

interface Notification {
    id: string;
    title: string;
    message: string;
    image_url?: string;
    is_read: boolean;
    created_at: string;
    sender_name?: string;
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

interface MessagesTabProps {
    shopId: string;
}

export default function MessagesTab({ shopId }: MessagesTabProps) {
    const { user } = useAuth();
    const { unreadMessages: globalUnreadMessages, unreadNotifications: globalUnreadNotifications } = useUnreadCounts();
    const [activeTab, setActiveTab] = useState<'notifications' | 'chat'>('notifications');

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

    // Chat state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load notifications
    useEffect(() => {
        async function loadNotifications() {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || data || []);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoadingNotifications(false);
            }
        }
        loadNotifications();
    }, []);

    // Load conversations
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

    // Realtime subscription for new messages
    useEffect(() => {
        if (!selectedConversation) return;

        const channel = supabase
            .channel(`messages:${selectedConversation}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation}`
            }, async (payload) => {
                const newMessage = payload.new as Message;

                if (user && newMessage.sender_id === user.id) {
                    newMessage.sender = {
                        id: user.id,
                        name: 'Me',
                        role: 'owner'
                    };
                    setMessages(prev => [...prev, newMessage]);
                } else {
                    const { data: sender } = await supabase
                        .from('profiles')
                        .select('id, name, role')
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

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const conversation = conversations.find(c => c.conversation_id === selectedConversation);
        if (!conversation) return;

        setSendingMessage(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: conversation.other_user.id,
                    shopId,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadNotifications = notifications.filter(n => !n.is_read).length;
    const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    return (
        <div className={styles.section}>
            {/* Tab Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: 16 }}>
                <button
                    onClick={() => setActiveTab('notifications')}
                    style={{
                        flex: 1, padding: '12px 16px', border: 'none', background: 'none',
                        borderBottom: activeTab === 'notifications' ? '2px solid #333' : '2px solid transparent',
                        fontWeight: activeTab === 'notifications' ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bell size={16} /> 알림
                        {globalUnreadNotifications > 0 && (
                            <span style={{
                                background: '#ff4d4f', color: '#fff', fontSize: '0.75rem',
                                fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                lineHeight: 1
                            }}>
                                {globalUnreadNotifications > 99 ? '99+' : globalUnreadNotifications}
                            </span>
                        )}
                    </div>
                </button>
                <div style={{ width: 1, background: '#eee', margin: '10px 0' }} />
                <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                        flex: 1, padding: '12px 16px', border: 'none', background: 'none',
                        borderBottom: activeTab === 'chat' ? '2px solid #333' : '2px solid transparent',
                        fontWeight: activeTab === 'chat' ? 600 : 400,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageCircle size={16} /> 대화
                        {globalUnreadMessages > 0 && (
                            <span style={{
                                background: '#ff4d4f', color: '#fff', fontSize: '0.75rem',
                                fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                lineHeight: 1
                            }}>
                                {globalUnreadMessages > 99 ? '99+' : globalUnreadMessages}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    {loadingNotifications ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>알림이 없습니다</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => {
                                        if (!notification.is_read) markAsRead(notification.id);
                                        setExpandedNotification(expandedNotification === notification.id ? null : notification.id);
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        background: notification.is_read ? '#fafafa' : '#fff5f8',
                                        border: notification.is_read ? '1px solid #eee' : '1px solid #ffb3d0',
                                        borderRadius: 10,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                {!notification.is_read && <span style={{ width: 6, height: 6, background: '#eb2f96', borderRadius: '50%' }} />}
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.title}</span>
                                            </div>
                                            <p style={{
                                                fontSize: '0.85rem', color: '#666', margin: 0,
                                                overflow: expandedNotification === notification.id ? 'visible' : 'hidden',
                                                whiteSpace: expandedNotification === notification.id ? 'pre-wrap' : 'nowrap',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {notification.message}
                                            </p>
                                            {expandedNotification === notification.id && notification.image_url && (
                                                <img src={notification.image_url} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', flexShrink: 0 }}>
                                            {new Date(notification.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div style={{ display: 'flex', height: 450, border: '1px solid #eee', borderRadius: 10, overflow: 'hidden' }}>
                    {/* Conversation List */}
                    <div style={{ width: 200, borderRight: '1px solid #eee', overflowY: 'auto', background: '#fafafa' }}>
                        {loadingChat ? (
                            <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>대화가 없습니다</div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.conversation_id}
                                    onClick={() => setSelectedConversation(conv.conversation_id)}
                                    style={{
                                        padding: 12,
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        background: selectedConversation === conv.conversation_id ? '#fff' : 'transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>
                                        {conv.other_user?.name || 'Admin'}
                                        {conv.unread_count > 0 && (
                                            <span style={{ marginLeft: 6, background: '#eb2f96', color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: '0.65rem' }}>
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {conv.last_message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversation ? (
                            <>
                                <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            style={{
                                                alignSelf: msg.sender?.role === 'owner' ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%',
                                                padding: '10px 14px',
                                                borderRadius: 12,
                                                background: msg.sender?.role === 'owner' ? '#1890ff' : '#fff',
                                                color: msg.sender?.role === 'owner' ? '#fff' : '#333',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.content}</p>
                                            {msg.image_url && <img src={msg.image_url} alt="" style={{ maxWidth: '100%', borderRadius: 6, marginTop: 6 }} />}
                                            <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                                                {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="메시지를 입력하세요..."
                                        style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }}
                                    />
                                    <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                                        <Send size={16} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                대화를 선택하세요
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
