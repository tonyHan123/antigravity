import Button from '@/components/ui/Button';
import styles from '../OwnerDashboard.module.css';
import { MOCK_MESSAGES } from '@/lib/mockData';

interface MessagesTabProps {
    shopId: string;
}

export default function MessagesTab({ shopId }: MessagesTabProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Messages with Admin</h3>
            </div>

            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Message List */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MOCK_MESSAGES.filter(m => m.shopId === shopId).map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'owner' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: msg.sender === 'owner' ? '#1890ff' : 'white',
                            color: msg.sender === 'owner' ? 'white' : '#333',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            borderTopRightRadius: msg.sender === 'owner' ? '2px' : '12px',
                            borderTopLeftRadius: msg.sender === 'admin' ? '2px' : '12px',
                        }}>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.content}</p>
                            <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', textAlign: 'right' }}>
                                {msg.timestamp.split(' ')[1]}
                            </span>
                        </div>
                    ))}
                    {MOCK_MESSAGES.filter(m => m.shopId === shopId).length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No messages yet. Start a conversation with the admin.</p>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Type a message to Admin..."
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                    <Button>Send</Button>
                </div>
            </div>
        </div>
    );
}
