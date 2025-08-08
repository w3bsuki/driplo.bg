import { debounce } from '$lib/utils/performance';
import { browser } from '$app/environment';

export interface SearchStateOptions {
	initialSearchTerm: string;
	onSearch: (query: string) => void;
	debounceMs?: number;
	stickyScrollThreshold?: number;
}

/**
 * Custom hook for managing search state and behavior
 * Handles search input, debouncing, and sticky search bar visibility
 */
export function useSearchState({ 
	initialSearchTerm, 
	onSearch, 
	debounceMs = 500,
	stickyScrollThreshold = 400
}: SearchStateOptions) {
	
	// Create debounced search handler
	const debouncedSearch = debounce((query: string) => {
		onSearch(query);
	}, debounceMs);

	/**
	 * Handle search input changes with debouncing
	 */
	function handleSearchInput(query: string, setSearchInput: (value: string) => void) {
		setSearchInput(query);
		debouncedSearch(query);
	}

	/**
	 * Handle quick search selection (immediate, no debounce)
	 */
	function handleQuickSearch(
		suggestion: string, 
		setSearchInput: (value: string) => void,
		setShowQuickSearch: (show: boolean) => void
	) {
		setSearchInput(suggestion);
		onSearch(suggestion);
		setShowQuickSearch(false);
	}

	/**
	 * Set up scroll listener for sticky search bar
	 */
	function setupScrollListener(setShowStickySearch: (show: boolean) => void) {
		if (!browser) return () => {};

		function handleScroll() {
			const scrollY = window.scrollY;
			// Show sticky search when scrolled past hero section
			setShowStickySearch(scrollY > stickyScrollThreshold);
		}

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Check initial position

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}

	/**
	 * Cleanup function for debounced search
	 */
	function cleanup() {
		debouncedSearch.cancel();
	}

	return {
		handleSearchInput,
		handleQuickSearch,
		setupScrollListener,
		cleanup
	};
}