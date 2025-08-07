import { getContext, setContext } from 'svelte';
import { listingStore } from '$lib/stores/listing.svelte.ts';

const LISTING_CONTEXT_KEY = Symbol('listing');

export interface ListingContextData {
	listing: any;
	currentUser: any;
	supabase: any;
	store: typeof listingStore;
	// Derived reactive values
	isLiked: () => boolean;
	isFollowing: () => boolean;
	isLikeLoading: () => boolean;
	isFollowLoading: () => boolean;
	isPurchaseLoading: () => boolean;
	isOwner: () => boolean;
	// Action methods
	toggleLike: () => Promise<boolean>;
	toggleFollow: () => Promise<boolean>;
	share: () => Promise<boolean>;
	startPurchase: () => void;
	completePurchase: () => void;
}

/**
 * Create listing context with store and helper functions
 * This eliminates prop drilling throughout the component tree
 */
export function createListingContext(
	listing: any, 
	currentUser: any, 
	supabase: any
): ListingContextData {
	const context: ListingContextData = {
		listing,
		currentUser, 
		supabase,
		store: listingStore,
		
		// Derived reactive values
		isLiked: () => listingStore.isLiked(listing.id),
		isFollowing: () => listingStore.isFollowing(listing.seller?.id || listing.user_id),
		isLikeLoading: () => listingStore.isLikeLoading(listing.id),
		isFollowLoading: () => listingStore.isFollowLoading(listing.seller?.id || listing.user_id),
		isPurchaseLoading: () => listingStore.isPurchaseLoading(listing.id),
		isOwner: () => currentUser?.id === (listing.seller?.id || listing.user_id),
		
		// Action methods - bound to current listing/user
		toggleLike: () => listingStore.toggleLike(listing.id, currentUser),
		toggleFollow: () => listingStore.toggleFollow(
			listing.seller?.id || listing.user_id, 
			currentUser, 
			supabase
		),
		share: () => listingStore.share(listing),
		startPurchase: () => listingStore.startPurchase(listing.id),
		completePurchase: () => listingStore.completePurchase(listing.id)
	};
	
	setContext(LISTING_CONTEXT_KEY, context);
	return context;
}

/**
 * Get listing context from any child component
 * Throws error if context is not available (helps catch bugs early)
 */
export function getListingContext(): ListingContextData {
	const context = getContext<ListingContextData>(LISTING_CONTEXT_KEY);
	
	if (!context) {
		throw new Error(
			'getListingContext must be called from within a component that has ListingContext set. ' +
			'Make sure you call createListingContext in a parent component.'
		);
	}
	
	return context;
}

/**
 * Get listing context safely (returns undefined if not available)
 * Useful for components that might be used outside listing context
 */
export function getListingContextSafe(): ListingContextData | undefined {
	return getContext<ListingContextData>(LISTING_CONTEXT_KEY);
}

/**
 * Utility to check if listing context is available
 */
export function hasListingContext(): boolean {
	return !!getContext<ListingContextData>(LISTING_CONTEXT_KEY);
}