import { logger } from '$lib/utils/logger';
import type { PageData } from '../../routes/(app)/browse/$types';

export interface InfiniteScrollState {
	allListings: any[];
	currentPage: number;
	hasMoreItems: boolean;
	loadingMore: boolean;
}

export interface InfiniteScrollOptions {
	data: PageData;
	apiEndpoint: string;
}

/**
 * Custom hook for managing infinite scroll functionality
 * Handles loading more items with proper error handling and state management
 */
export function useInfiniteScroll({ data, apiEndpoint }: InfiniteScrollOptions) {
	
	/**
	 * Initialize infinite scroll state from server data
	 */
	function initializeState(): InfiniteScrollState {
		return {
			allListings: [...data.listings],
			currentPage: data.pagination.currentPage,
			hasMoreItems: data.pagination.hasNextPage,
			loadingMore: false
		};
	}

	/**
	 * Reset infinite scroll state when data changes (filter applied)
	 */
	function resetState(newData: PageData): InfiniteScrollState {
		return {
			allListings: [...newData.listings],
			currentPage: newData.pagination.currentPage,
			hasMoreItems: newData.pagination.hasNextPage,
			loadingMore: false
		};
	}

	/**
	 * Build URL parameters for API call based on current filters
	 */
	function buildApiParams(filters: PageData['filters'], nextPage: number, limit: number): URLSearchParams {
		const params = new URLSearchParams();
		
		// Add all current filters to the API call
		if (filters.category) params.set('category', filters.category);
		if (filters.subcategory) params.set('subcategory', filters.subcategory);
		if (filters.search) params.set('q', filters.search);
		if (filters.minPrice) params.set('min_price', filters.minPrice.toString());
		if (filters.maxPrice) params.set('max_price', filters.maxPrice.toString());
		if (filters.sizes.length > 0) params.set('sizes', filters.sizes.join(','));
		if (filters.brands.length > 0) params.set('brands', filters.brands.join(','));
		if (filters.conditions.length > 0) params.set('conditions', filters.conditions.join(','));
		if (filters.sortBy !== 'recent') params.set('sort', filters.sortBy);
		
		params.set('page', nextPage.toString());
		params.set('limit', limit.toString());

		return params;
	}

	/**
	 * Load more items from the API
	 */
	async function loadMoreItems(
		currentState: InfiniteScrollState,
		filters: PageData['filters'],
		pagination: PageData['pagination']
	): Promise<InfiniteScrollState> {
		if (currentState.loadingMore || !currentState.hasMoreItems) {
			return currentState;
		}
		
		const nextPage = currentState.currentPage + 1;
		const newState = { ...currentState, loadingMore: true };

		try {
			const params = buildApiParams(filters, nextPage, pagination.limit);
			const response = await fetch(`${apiEndpoint}?${params.toString()}`);
			
			if (response.ok) {
				const result = await response.json();
				
				if (result.listings && result.listings.length > 0) {
					return {
						...newState,
						allListings: [...currentState.allListings, ...result.listings],
						currentPage: nextPage,
						hasMoreItems: result.hasMore,
						loadingMore: false
					};
				} else {
					return {
						...newState,
						hasMoreItems: false,
						loadingMore: false
					};
				}
			} else {
				logger.error('Failed to load more items');
				return {
					...newState,
					hasMoreItems: false,
					loadingMore: false
				};
			}
		} catch (error) {
			logger.error('Error loading more items:', error);
			return {
				...newState,
				hasMoreItems: false,
				loadingMore: false
			};
		}
	}

	return {
		initializeState,
		resetState,
		loadMoreItems,
		buildApiParams
	};
}