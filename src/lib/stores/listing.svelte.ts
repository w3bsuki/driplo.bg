import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { toast } from 'svelte-sonner';

/**
 * Centralized Svelte 5 store for listing interactions
 * Eliminates prop drilling and provides optimistic updates
 */
class ListingStore {
	// Private state using Svelte 5 runes
	#favorites = $state(new Set<string>());
	#followedUsers = $state(new Set<string>());
	#loadingStates = $state({
		likes: new Set<string>(),
		follows: new Set<string>(),
		purchases: new Set<string>()
	});
	
	// Reactive getters
	get favorites() { return this.#favorites; }
	get followedUsers() { return this.#followedUsers; }
	get loadingStates() { return this.#loadingStates; }
	
	// Derived helpers - use regular functions instead of $derived for methods
	isLiked(listingId: string): boolean {
		return this.#favorites.has(listingId);
	}
	
	isFollowing(userId: string): boolean {
		return this.#followedUsers.has(userId);
	}
	
	isLikeLoading(listingId: string): boolean {
		return this.#loadingStates.likes.has(listingId);
	}
	
	isFollowLoading(userId: string): boolean {
		return this.#loadingStates.follows.has(userId);
	}
	
	isPurchaseLoading(listingId: string): boolean {
		return this.#loadingStates.purchases.has(listingId);
	}
	
	/**
	 * Initialize store from server data (typically called on page load)
	 */
	initialize(data: {
		favorites?: string[];
		followedUsers?: string[];
		isLiked?: boolean;
		isFollowing?: boolean;
		listingId?: string;
		sellerId?: string;
	}) {
		if (!browser) return;
		
		// Initialize from arrays or single values
		if (data.favorites) {
			this.#favorites = new Set(data.favorites);
		} else if (data.isLiked && data.listingId) {
			this.#favorites.add(data.listingId);
		}
		
		if (data.followedUsers) {
			this.#followedUsers = new Set(data.followedUsers);
		} else if (data.isFollowing && data.sellerId) {
			this.#followedUsers.add(data.sellerId);
		}
		
		// Clear loading states
		this.#loadingStates = {
			likes: new Set(),
			follows: new Set(), 
			purchases: new Set()
		};
	}
	
	/**
	 * Toggle like status with optimistic updates and error rollback
	 */
	async toggleLike(listingId: string, currentUser: any) {
		if (!currentUser) {
			goto('/login');
			return false;
		}
		
		if (this.#loadingStates.likes.has(listingId)) return false;
		
		// Optimistic update
		const wasLiked = this.#favorites.has(listingId);
		if (wasLiked) {
			this.#favorites.delete(listingId);
		} else {
			this.#favorites.add(listingId);
		}
		
		this.#loadingStates.likes.add(listingId);
		
		try {
			const response = await fetch('/api/wishlist', {
				method: wasLiked ? 'DELETE' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ listing_id: listingId })
			});
			
			if (!response.ok) {
				// Revert optimistic update
				if (wasLiked) {
					this.#favorites.add(listingId);
				} else {
					this.#favorites.delete(listingId);
				}
				const error = await response.json();
				toast.error(error.message || 'Failed to update favorites');
				return false;
			} else {
				// Success - track analytics
				if (browser && window.gtag) {
					window.gtag('event', wasLiked ? 'unlike_listing' : 'like_listing', {
						listing_id: listingId,
						user_id: currentUser.id
					});
				}
				return true;
			}
		} catch (error) {
			// Revert on network error
			if (wasLiked) {
				this.#favorites.add(listingId);
			} else {
				this.#favorites.delete(listingId);
			}
			toast.error('Failed to update favorites');
			return false;
		} finally {
			this.#loadingStates.likes.delete(listingId);
		}
	}
	
	/**
	 * Toggle follow status with optimistic updates and error rollback
	 */
	async toggleFollow(userId: string, currentUser: any, supabase: any) {
		if (!currentUser) {
			goto('/login');
			return false;
		}
		
		if (this.#loadingStates.follows.has(userId)) return false;
		
		const wasFollowing = this.#followedUsers.has(userId);
		
		// Optimistic update
		if (wasFollowing) {
			this.#followedUsers.delete(userId);
		} else {
			this.#followedUsers.add(userId);
		}
		
		this.#loadingStates.follows.add(userId);
		
		try {
			if (wasFollowing) {
				const { error } = await supabase
					.from('user_follows')
					.delete()
					.eq('follower_id', currentUser.id)
					.eq('following_id', userId);
				
				if (error) throw error;
			} else {
				const { error } = await supabase
					.from('user_follows')
					.insert({
						follower_id: currentUser.id,
						following_id: userId
					});
				
				if (error) throw error;
			}
			
			toast.success(wasFollowing ? 'Unfollowed user' : 'Following user');
			
			// Track analytics
			if (browser && window.gtag) {
				window.gtag('event', wasFollowing ? 'unfollow_user' : 'follow_user', {
					target_user_id: userId,
					user_id: currentUser.id
				});
			}
			
			return true;
		} catch (error) {
			// Revert on error
			if (wasFollowing) {
				this.#followedUsers.add(userId);
			} else {
				this.#followedUsers.delete(userId);
			}
			console.error('Follow error:', error);
			toast.error('Failed to update follow status');
			return false;
		} finally {
			this.#loadingStates.follows.delete(userId);
		}
	}
	
	/**
	 * Handle share action with native Web Share API fallback
	 */
	async share(listing: any) {
		if (!listing) return false;
		
		const shareData = {
			title: listing.title,
			text: listing.description || `Check out this ${listing.title} on Driplo`,
			url: browser ? window.location.href : `${window.location.origin}/listings/${listing.id}`
		};
		
		try {
			if (browser && navigator.share && navigator.canShare(shareData)) {
				await navigator.share(shareData);
				
				// Track share event
				if (window.gtag) {
					window.gtag('event', 'share_listing', {
						listing_id: listing.id,
						method: 'native'
					});
				}
				return true;
			} else {
				// Fallback - copy to clipboard
				await navigator.clipboard.writeText(shareData.url);
				toast.success('Link copied to clipboard');
				
				if (window.gtag) {
					window.gtag('event', 'share_listing', {
						listing_id: listing.id,
						method: 'clipboard'
					});
				}
				return true;
			}
		} catch (error) {
			console.error('Share error:', error);
			// Silent fallback - don't show error for share failures
			return false;
		}
	}
	
	/**
	 * Handle purchase initiation tracking
	 */
	startPurchase(listingId: string) {
		this.#loadingStates.purchases.add(listingId);
		
		// Track purchase intent
		if (browser && window.gtag) {
			window.gtag('event', 'begin_checkout', {
				currency: 'EUR', // TODO: Get from listing
				value: 0, // TODO: Get from listing
				listing_id: listingId
			});
		}
	}
	
	/**
	 * Complete purchase tracking
	 */
	completePurchase(listingId: string) {
		this.#loadingStates.purchases.delete(listingId);
	}
	
	/**
	 * Clear all state (useful for logout)
	 */
	clear() {
		this.#favorites.clear();
		this.#followedUsers.clear();
		this.#loadingStates = {
			likes: new Set(),
			follows: new Set(),
			purchases: new Set()
		};
	}
	
	/**
	 * Get summary stats (useful for debugging/analytics)
	 */
	getStats() {
		return {
			totalFavorites: this.#favorites.size,
			totalFollowed: this.#followedUsers.size,
			pendingLikes: this.#loadingStates.likes.size,
			pendingFollows: this.#loadingStates.follows.size,
			pendingPurchases: this.#loadingStates.purchases.size
		};
	}
}

// Export singleton instance
export const listingStore = new ListingStore();

// Declare global gtag for TypeScript
declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}