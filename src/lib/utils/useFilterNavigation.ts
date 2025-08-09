import { goto } from '$app/navigation';
import { throttle } from '$lib/utils/performance';
import type { PageData } from '../../routes/(app)/browse/$types';

export interface FilterState {
	searchInput: string;
	sortBy: string;
	priceRange: { min: number; max: number };
	selectedSizes: Set<string>;
	selectedBrands: Set<string>;
	selectedConditions: Set<string>;
}

export interface FilterNavigationOptions {
	data: PageData;
	currentUrl: URL;
	isNavigating: boolean;
	setNavigating: (value: boolean) => void;
}

/**
 * Custom hook for managing filter navigation and URL building in browse pages
 * Provides throttled navigation and URL building utilities
 */
export function useFilterNavigation({ data, currentUrl, isNavigating, setNavigating }: FilterNavigationOptions) {
	
	/**
	 * Builds a filter URL with the given updates
	 */
	function buildFilterUrl(updates: Record<string, any> = {}) {
		const url = new URL(currentUrl);
		
		// Apply updates to current filters
		const newFilters = {
			category: updates.category ?? data.filters.category,
			subcategory: updates.subcategory ?? data.filters.subcategory,
			q: updates.search?.trim(),
			min_price: updates.minPrice ?? (data.filters.minPrice > 0 ? data.filters.minPrice : null),
			max_price: updates.maxPrice ?? (data.filters.maxPrice < 10000 ? data.filters.maxPrice : null),
			sizes: updates.sizes ?? (data.filters.sizes.length > 0 ? data.filters.sizes.join(',') : null),
			brands: updates.brands ?? (data.filters.brands.length > 0 ? data.filters.brands.join(',') : null),
			conditions: updates.conditions ?? (data.filters.conditions.length > 0 ? data.filters.conditions.join(',') : null),
			sort: updates.sort ?? data.filters.sortBy,
			page: updates.page ?? 1 // Reset to page 1 on filter changes
		};

		// Clear existing params and set new ones
		url.search = '';
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value && value !== '' && value !== 'recent') {
				url.searchParams.set(key, String(value));
			}
		});

		return url.toString();
	}

	// Throttled navigation to prevent double calls
	const throttledNavigate = throttle((url: string) => {
		if (!isNavigating()) {
			setNavigating(true);
			goto(url).finally(() => {
				// Reset flag after navigation completes
				setTimeout(() => { setNavigating(false); }, 100);
			});
		}
	}, 200);

	/**
	 * Navigation handlers for different filter types
	 */
	const handlers = {
		updateCategory: (categorySlug: string) => {
			throttledNavigate(buildFilterUrl({ category: categorySlug || null }));
		},

		updateSearch: (query: string) => {
			throttledNavigate(buildFilterUrl({ search: query?.trim() || null }));
		},

		updateSort: (newSort: string) => {
			throttledNavigate(buildFilterUrl({ sort: newSort }));
		},

		updatePriceRange: (minPrice: number, maxPrice: number) => {
			throttledNavigate(buildFilterUrl({ 
				minPrice: minPrice > 0 ? minPrice : null,
				maxPrice: maxPrice < 10000 ? maxPrice : null
			}));
		},

		updateSizes: (sizes: Set<string>) => {
			throttledNavigate(buildFilterUrl({ 
				sizes: sizes.size > 0 ? Array.from(sizes).join(',') : null 
			}));
		},

		updateBrands: (brands: Set<string>) => {
			throttledNavigate(buildFilterUrl({ 
				brands: brands.size > 0 ? Array.from(brands).join(',') : null 
			}));
		},

		updateConditions: (conditions: Set<string>) => {
			throttledNavigate(buildFilterUrl({ 
				conditions: conditions.size > 0 ? Array.from(conditions).join(',') : null 
			}));
		},

		clearAllFilters: () => {
			throttledNavigate('/browse');
		},

		clearFilter: (filterType: 'search' | 'category' | 'price', value?: string) => {
			switch (filterType) {
				case 'search':
					throttledNavigate(buildFilterUrl({ search: null }));
					break;
				case 'category':
					handlers.updateCategory('');
					break;
				case 'price':
					throttledNavigate(buildFilterUrl({ minPrice: null, maxPrice: null }));
					break;
			}
		}
	};

	// Cleanup function for the throttled navigate
	const cleanup = () => {
		throttledNavigate.cancel();
	};

	return {
		buildFilterUrl,
		throttledNavigate,
		handlers,
		cleanup
	};
}