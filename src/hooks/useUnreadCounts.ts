import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UnreadCounts {
    unreadMessages: number;
    unreadNotifications: number;
    newReviews: number;
    totalUnread: number;
    loading: boolean;
}

export function useUnreadCounts() {
    const [counts, setCounts] = useState<UnreadCounts>({
        unreadMessages: 0,
        unreadNotifications: 0,
        newReviews: 0,
        totalUnread: 0,
        loading: true
    });

    const fetchCounts = useCallback(async () => {
        try {
            const res = await fetch('/api/unread-counts');
            if (res.ok) {
                const data = await res.json();
                setCounts({
                    unreadMessages: data.unreadMessages || 0,
                    unreadNotifications: data.unreadNotifications || 0,
                    newReviews: data.newReviews || 0,
                    totalUnread: data.totalUnread || 0,
                    loading: false
                });
            } else {
                setCounts(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching unread counts:', error);
            setCounts(prev => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchCounts();

        // Poll every 3 seconds for faster updates
        const pollInterval = setInterval(fetchCounts, 3000);

        // Realtime triggers - refetch on any change
        const messageChannel = supabase
            .channel('unread-messages-trigger')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages'
            }, () => {
                fetchCounts();
            })
            .subscribe();

        const notificationChannel = supabase
            .channel('unread-notifications-trigger')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications'
            }, () => {
                fetchCounts();
            })
            .subscribe();

        // Refetch when tab becomes active
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchCounts();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(notificationChannel);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchCounts]);

    return counts;
}
