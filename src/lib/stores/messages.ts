import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

// Store for global unread message count
export const unreadCount = writable<number>(0);

// Track if we're subscribed to real-time updates
let isSubscribed = false;
let realtimeChannel: any = null;

// Initialize unread count
export async function initializeUnreadCount() {
    if (!browser) return;

    try {
        const response = await fetch('/api/messages/unread-count');
        if (response.ok) {
            const data = await response.json();
            unreadCount.set(data.total_unread);
        }
    } catch (error) {
        console.error('Error initializing unread count:', error);
    }
}

// Subscribe to real-time updates
export function subscribeToUnreadUpdates(userId: string) {
    if (!browser || isSubscribed) return;

    const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
    
    realtimeChannel = supabase
        .channel('unread-messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=neq.${userId}`
            },
            (payload) => {
                // New message received (not sent by current user)
                unreadCount.update(count => count + 1);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=neq.${userId}`
            },
            (payload) => {
                // Message read status updated
                if (payload.new.is_read && !payload.old.is_read) {
                    // Message was marked as read
                    unreadCount.update(count => Math.max(0, count - 1));
                } else if (!payload.new.is_read && payload.old.is_read) {
                    // Message was marked as unread (rare case)
                    unreadCount.update(count => count + 1);
                }
            }
        )
        .subscribe();

    isSubscribed = true;
}

// Unsubscribe from real-time updates
export function unsubscribeFromUnreadUpdates() {
    if (!browser || !isSubscribed || !realtimeChannel) return;

    const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
    supabase.removeChannel(realtimeChannel);
    
    isSubscribed = false;
    realtimeChannel = null;
}

// Manually update unread count (for when messages are read)
export function decrementUnreadCount(amount: number = 1) {
    unreadCount.update(count => Math.max(0, count - amount));
}

// Reset unread count
export function resetUnreadCount() {
    unreadCount.set(0);
}