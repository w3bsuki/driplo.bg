<script lang="ts">
	import { ChevronDown, Menu, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import CategoryDropdown from '$lib/components/shared/CategoryDropdown.svelte';
	import HorizontalCategorySelector from '$lib/components/search/HorizontalCategorySelector.svelte';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';

	interface Props {
		value?: string;
		placeholder?: string;
		onSearch?: (value: string) => void;
		onCategorySelect?: (category: string) => void;
		categories?: Category[];
		activeCategory?: string;
		class?: string;
		visible?: boolean;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search for items...',
		onSearch,
		onCategorySelect,
		categories = [],
		activeCategory = '',
		class: className = '',
		visible = true
	}: Props = $props();

	// Calculate dynamic header height
	let headerHeight = $state(56); // Default mobile header height
	
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		// Get actual header height (NOT including banner since it scrolls away)
		const calculateHeaderHeight = () => {
			const header = document.querySelector('header');
			
			if (header) {
				// The header already has the correct height set via Tailwind classes
				// On mobile: h-14 (56px), on desktop: h-16 (64px)
				headerHeight = header.offsetHeight;
			}
		};
		
		// Calculate initially
		calculateHeaderHeight();
		
		// Recalculate on resize
		const handleResize = () => calculateHeaderHeight();
		window.addEventListener('resize', handleResize);
		
		// Recalculate after a short delay to ensure DOM is ready
		setTimeout(calculateHeaderHeight, 100);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// Dropdown state
	let isCategoryDropdownOpen = $state(false);
	let showHorizontalCategories = $state(false);

	// Toggle dropdown on button click
	function toggleCategoryDropdown() {
		isCategoryDropdownOpen = !isCategoryDropdownOpen;
		showHorizontalCategories = false;
	}

	// Toggle horizontal categories
	function toggleHorizontalCategories() {
		showHorizontalCategories = !showHorizontalCategories;
		isCategoryDropdownOpen = false;
	}

	// Alias for the missing function referenced in template
	const handleToggleCategoryDropdown = toggleCategoryDropdown;

	// Close dropdown
	function closeCategoryDropdown() {
		isCategoryDropdownOpen = false;
	}

	function handleSearch() {
		onSearch?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}

	// Handle category selection from dropdown
	function handleCategoryClick(category: Category) {
		if (onCategorySelect) {
			onCategorySelect(category.slug);
		} else {
			// Default navigation behavior
			goto(`/${category.slug}`);
		}
		closeCategoryDropdown();
	}
</script>

{#if visible}
	<div 
		class={cn(
			"fixed left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-[top] duration-200 ease-out",
			className
		)}
		style="top: {headerHeight}px"
		transition:fly={{ y: -20, duration: 150 }}
	>
		<div class="container mx-auto px-2 md:px-4 py-1.5 md:py-2">
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-1.5 md:gap-2 max-w-3xl mx-auto w-full">
					<!-- Category Toggle Button (compact on mobile) -->
					<div class="relative flex-shrink-0">
						<button
							data-categories-button
							onclick={toggleHorizontalCategories}
							class={cn(
								"px-2 md:px-2.5 h-8 md:h-9 rounded-md md:rounded-sm text-xs md:text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center gap-1",
								showHorizontalCategories 
									? "bg-blue-500 text-white hover:bg-blue-600" 
									: "bg-gray-900 text-white hover:bg-gray-800"
							)}
							aria-label="Categories"
						>
							{#if showHorizontalCategories}
								<X class="h-3.5 md:h-4 w-3.5 md:w-4" />
							{:else}
								<Menu class="h-3.5 md:h-4 w-3.5 md:w-4" />
							{/if}
							<span class="hidden sm:inline">{m.header_categories()}</span>
						</button>
					</div>

					<!-- Search Input (compact on mobile) -->
					<div class="relative flex-1">
						<input
							type="search"
							bind:value
							{placeholder}
							onkeydown={handleKeydown}
							class={cn(
								"w-full px-2.5 md:px-3 pr-8 md:pr-10 h-8 md:h-9 text-xs md:text-sm",
								"bg-white border border-gray-200 rounded-md md:rounded-sm",
								"placeholder:text-gray-400 md:placeholder:text-gray-500",
								"focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
								"transition-all duration-100"
							)}
						/>
						<!-- Search Icon -->
						<button
							onclick={handleSearch}
							type="button"
							class="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-0.5 md:p-1 hover:bg-gray-100 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
							aria-label="Search"
						>
							<span class="text-sm md:text-base">🔍</span>
						</button>
					</div>
				</div>

				<!-- Horizontal Category Selector -->
				{#if showHorizontalCategories}
					<div transition:fly={{ y: -10, duration: 150 }} class="border-t border-gray-100 pt-2">
						<HorizontalCategorySelector
							{categories}
							{activeCategory}
							{onCategorySelect}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}