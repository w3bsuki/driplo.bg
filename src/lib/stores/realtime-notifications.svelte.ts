import { browser } from '$app/environment';
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database, Tables } from '$lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '$lib/utils/logger';

export interface UserNotification {
	id: string;
	user_id: string;
	type: 'follow' | 'message' | 'listing_liked' | 'order_update' | 'system';
	title: string;
	message: string;
	data?: Record<string, unknown>;
	is_read: boolean;
	created_at: string;
}

class RealtimeNotificationStore {
	private _notifications = $state<UserNotification[]>([]);
	private _unreadCount = $state(0);
	private _isConnected = $state(false);
	private supabase = browser ? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY) : null;
	private channel: RealtimeChannel | null = null;

	constructor() {
		if (browser) {
			this.initialize();
		}
	}

	get notifications() {
		return this._notifications;
	}

	get unreadCount() {
		return this._unreadCount;
	}

	get isConnected() {
		return this._isConnected;
	}

	private async initialize() {
		if (!this.supabase) return;

		try {
			// Get current user
			const { data: { user } } = await this.supabase.auth.getUser();
			if (!user) return;

			// Load existing notifications
			await this.loadNotifications(user.id);

			// Set up real-time subscription
			this.setupRealtimeSubscription(user.id);

			logger.info('Realtime notification store initialized', { userId: user.id });
		} catch (error) {
			logger.error('Failed to initialize realtime notifications', { error });
		}
	}

	private async loadNotifications(userId: string) {
		if (!this.supabase) return;

		try {
			const { data: notifications, error } = await this.supabase
				.from('user_notifications')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.limit(50);

			if (error) {
				logger.error('Failed to load user notifications', { error: error.message });
				return;
			}

			this._notifications = notifications || [];
			this._unreadCount = notifications?.filter(n => !n.is_read).length || 0;

			logger.info('User notifications loaded', { 
				count: this._notifications.length,
				unread: this._unreadCount
			});
		} catch (error) {
			logger.error('Error loading user notifications', { error });
		}
	}

	private setupRealtimeSubscription(userId: string) {
		if (!this.supabase) return;

		try {
			this.channel = this.supabase
				.channel(`user_notifications:${userId}`)
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'user_notifications',
						filter: `user_id=eq.${userId}`
					},
					(payload) => {
						logger.info('New user notification received', { notification: payload.new });
						this.handleNewNotification(payload.new as UserNotification);
					}
				)
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'user_notifications',
						filter: `user_id=eq.${userId}`
					},
					(payload) => {
						logger.info('User notification updated', { notification: payload.new });
						this.handleNotificationUpdate(payload.new as UserNotification);
					}
				)
				.subscribe((status) => {
					logger.info('Realtime notification subscription status', { status });
					this._isConnected = status === 'SUBSCRIBED';
				});

			logger.info('Realtime notification subscription set up', { userId });
		} catch (error) {
			logger.error('Failed to set up realtime notification subscription', { error });
		}
	}

	private handleNewNotification(notification: UserNotification) {
		// Add to beginning of list
		this._notifications = [notification, ...this._notifications];
		
		// Update unread count
		if (!notification.is_read) {
			this._unreadCount += 1;
		}

		// Show browser notification if permitted
		this.showBrowserNotification(notification);

		// Limit to 50 notifications to prevent memory issues
		if (this._notifications.length > 50) {
			this._notifications = this._notifications.slice(0, 50);
		}
	}

	private handleNotificationUpdate(updatedNotification: UserNotification) {
		const index = this._notifications.findIndex(n => n.id === updatedNotification.id);
		if (index !== -1) {
			const wasUnread = !this._notifications[index].is_read;
			const isNowRead = updatedNotification.is_read;

			this._notifications[index] = updatedNotification;

			// Update unread count
			if (wasUnread && isNowRead) {
				this._unreadCount = Math.max(0, this._unreadCount - 1);
			} else if (!wasUnread && !isNowRead) {
				this._unreadCount += 1;
			}
		}
	}

	private showBrowserNotification(notification: UserNotification) {
		if (!browser || typeof Notification === 'undefined') return;

		// Check permission
		if (Notification.permission === 'granted') {
			const browserNotification = new Notification(notification.title, {
				body: notification.message,
				icon: '/favicon.ico',
				badge: '/favicon.ico',
				tag: notification.type // Prevent duplicates
			});

			// Auto-close after 5 seconds
			setTimeout(() => browserNotification.close(), 5000);
		} else if (Notification.permission !== 'denied') {
			// Request permission
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					const browserNotification = new Notification(notification.title, {
						body: notification.message,
						icon: '/favicon.ico',
						badge: '/favicon.ico',
						tag: notification.type
					});
					setTimeout(() => browserNotification.close(), 5000);
				}
			});
		}
	}

	async markAsRead(notificationId: string) {
		if (!this.supabase) return;

		try {
			const { error } = await this.supabase
				.from('user_notifications')
				.update({ is_read: true, read_at: new Date().toISOString() })
				.eq('id', notificationId);

			if (error) {
				logger.error('Failed to mark notification as read', { 
					notificationId, 
					error: error.message 
				});
				return;
			}

			// Update local state (will also be updated via realtime)
			const notification = this._notifications.find(n => n.id === notificationId);
			if (notification && !notification.is_read) {
				notification.is_read = true;
				this._unreadCount = Math.max(0, this._unreadCount - 1);
			}

			logger.info('Notification marked as read', { notificationId });
		} catch (error) {
			logger.error('Error marking notification as read', { error });
		}
	}

	async markAllAsRead() {
		if (!this.supabase) return;

		try {
			const { data: { user } } = await this.supabase.auth.getUser();
			if (!user) return;

			const { error } = await this.supabase
				.from('user_notifications')
				.update({ 
					is_read: true, 
					read_at: new Date().toISOString() 
				})
				.eq('user_id', user.id)
				.eq('is_read', false);

			if (error) {
				logger.error('Failed to mark all notifications as read', { error: error.message });
				return;
			}

			// Update local state
			this._notifications = this._notifications.map(n => ({ ...n, is_read: true }));
			this._unreadCount = 0;

			logger.info('All notifications marked as read');
		} catch (error) {
			logger.error('Error marking all notifications as read', { error });
		}
	}

	disconnect() {
		if (this.channel) {
			this.supabase?.removeChannel(this.channel);
			this.channel = null;
			this._isConnected = false;
			logger.info('Realtime notification subscription disconnected');
		}
	}
}

export const realtimeNotifications = new RealtimeNotificationStore();