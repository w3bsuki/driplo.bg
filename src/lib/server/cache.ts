// Simple in-memory cache for server-side caching
// In production, this could be replaced with Redis or similar

interface CacheEntry<T> {
	data: T
	timestamp: number
	ttl: number
}

class ServerCache {
	private cache = new Map<string, CacheEntry<unknown>>()
	
	// Get cached data if still valid
	get<T>(key: string): T | null {
		const entry = this.cache.get(key)
		if (!entry) return null
		
		const now = Date.now()
		if (now - entry.timestamp > entry.ttl) {
			this.cache.delete(key)
			return null
		}
		
		return entry.data as T
	}
	
	// Set cached data with TTL in milliseconds
	set<T>(key: string, data: T, ttl: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		})
	}
	
	// Delete cached data
	delete(key: string): void {
		this.cache.delete(key)
	}
	
	// Clear all cache
	clear(): void {
		this.cache.clear()
	}
	
	// Get cache statistics
	getStats() {
		return {
			size: this.cache.size,
			entries: Array.from(this.cache.keys())
		}
	}
	
	// Clean up expired entries
	cleanup(): void {
		const now = Date.now()
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key)
			}
		}
	}
}

// Singleton cache instance
export const serverCache = new ServerCache()

// Cache key builders - practical keys for Supabase data
export const cacheKeys = {
	// Homepage data
	homepage: (locale: string = 'en') => `homepage-${locale}`,
	
	// Categories and navigation
	categories: (locale: string = 'en') => `categories-${locale}`,
	categoryPage: (slug: string, locale: string = 'en') => `category-${slug}-${locale}`,
	
	// Browse and listings
	browseResults: (filters: Record<string, unknown>, locale: string = 'en') => {
		const filterStr = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
		return `browse-${btoa(filterStr)}-${locale}`;
	},
	
	// Sellers and social proof
	topSellers: (categoryId?: string) => `top-sellers-${categoryId || 'all'}`,
	sellerProfile: (sellerId: string) => `seller-${sellerId}`,
	
	// Listings
	featuredListings: (locale: string = 'en') => `featured-${locale}`,
	popularListings: (locale: string = 'en') => `popular-${locale}`,
	listingDetails: (listingId: string) => `listing-${listingId}`,
	relatedListings: (listingId: string) => `related-${listingId}`,
	
	// Static data
	brands: () => 'brands',
	conditions: () => 'conditions'
}

// Cache TTL configurations (in milliseconds) - practical durations
export const cacheTTL = {
	homepage: 10 * 60 * 1000, // 10 minutes
	categories: 30 * 60 * 1000, // 30 minutes
	categoryPage: 15 * 60 * 1000, // 15 minutes
	browseResults: 5 * 60 * 1000, // 5 minutes
	topSellers: 60 * 60 * 1000, // 1 hour
	sellerProfile: 30 * 60 * 1000, // 30 minutes
	featuredListings: 20 * 60 * 1000, // 20 minutes
	popularListings: 15 * 60 * 1000, // 15 minutes
	listingDetails: 5 * 60 * 1000, // 5 minutes
	relatedListings: 30 * 60 * 1000, // 30 minutes
	brands: 24 * 60 * 60 * 1000, // 24 hours
	conditions: 24 * 60 * 60 * 1000 // 24 hours
}

// Helper function to get or set cached data
export async function getCachedData<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttl: number
): Promise<T> {
	// Try to get from cache first
	const cached = serverCache.get<T>(key)
	if (cached) {
		return cached
	}
	
	// Fetch fresh data
	const data = await fetcher()
	
	// Cache the result
	serverCache.set(key, data, ttl)
	
	return data
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
	serverCache.cleanup()
}, 10 * 60 * 1000)

// Cache invalidation for Supabase updates
export function invalidateListingCache(listingId: string, categorySlug?: string) {
	const patterns = [
		cacheKeys.listingDetails(listingId),
		cacheKeys.relatedListings(listingId),
		cacheKeys.featuredListings('en'),
		cacheKeys.featuredListings('bg'),
		cacheKeys.popularListings('en'),
		cacheKeys.popularListings('bg')
	];
	
	if (categorySlug) {
		patterns.push(
			cacheKeys.categoryPage(categorySlug, 'en'),
			cacheKeys.categoryPage(categorySlug, 'bg')
		);
	}
	
	patterns.forEach(key => serverCache.delete(key));
}

export function invalidateSellerCache(sellerId: string) {
	const patterns = [
		cacheKeys.sellerProfile(sellerId),
		cacheKeys.topSellers('all')
	];
	patterns.forEach(key => serverCache.delete(key));
}

// Export cache clearing function
export function clearCache() {
	serverCache.clear();
}