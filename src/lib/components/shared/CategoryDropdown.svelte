<script lang="ts">
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { clickOutside } from '$lib/actions';
	import type { Category } from '$lib/types';
	
	// Import our new focused components
	import CategoryMobileLayout from '$lib/components/category/CategoryMobileLayout.svelte';
	import CategoryDesktopLayout from '$lib/components/category/CategoryDesktopLayout.svelte';
	import CategoryDropdownFooter from '$lib/components/category/CategoryDropdownFooter.svelte';

	interface Props {
		categories?: Category[];
		isOpen?: boolean;
		onToggle?: () => void;
		onClose?: () => void;
		class?: string;
		initialCategory?: string | null;
	}

	let { 
		categories = [], 
		isOpen = false, 
		onToggle = () => {}, 
		onClose = () => {},
		class: className = '',
		initialCategory = null
	}: Props = $props();

	let activeMainCategory = $state(initialCategory || '');
	let hoveredCategory = $state('');
	
	// Update active category when initialCategory changes
	$effect(() => {
		if (initialCategory) {
			activeMainCategory = initialCategory;
		}
	});

	// Handler functions for child components
	function handleCategorySelect(categorySlug: string) {
		activeMainCategory = categorySlug;
	}

	function handleSubcategoryClick(mainCategory: string, subcategory: string) {
		onClose();
		
		if (mainCategory === '' && subcategory === 'all') {
			// Browse all categories
			goto('/browse');
		} else if (mainCategory === '') {
			// Special categories like new, sale
			goto(`/browse?filter=${subcategory}`);
		} else {
			// Navigate to specific category/subcategory
			goto(`/${mainCategory}?subcategory=${subcategory}`);
		}
	}

	function handleCategoryHover(categorySlug: string) {
		hoveredCategory = categorySlug;
	}

	function handleNavigateTo(path: string) {
		onClose();
		goto(path);
	}
</script>

<!-- Category Dropdown -->
{#if isOpen}
	<div 
		class={cn(
			"absolute top-full left-0 mt-1 w-[calc(100vw-2rem)] md:w-[600px]",
			"bg-white rounded-sm shadow-lg border border-gray-200 z-[100] overflow-hidden",
			"md:mt-2",
			className
		)}
	>
		<CategoryMobileLayout 
			{activeMainCategory}
			onClose={onClose}
			onCategorySelect={handleCategorySelect}
			onSubcategoryClick={handleSubcategoryClick}
			onNavigateTo={handleNavigateTo}
		/>
		
		<CategoryDesktopLayout 
			{hoveredCategory}
			onCategoryHover={handleCategoryHover}
			onNavigateTo={handleNavigateTo}
		/>
		
		<CategoryDropdownFooter 
			onNavigateTo={handleNavigateTo}
		/>
	</div>
{/if}

<style>
	/* Custom scrollbar for the dropdown */
	:global(.overflow-y-auto) {
		scrollbar-width: thin;
		scrollbar-color: rgb(var(--color-gray-300)) transparent;
	}
	
	:global(.overflow-y-auto::-webkit-scrollbar) {
		width: 6px;
	}
	
	:global(.overflow-y-auto::-webkit-scrollbar-track) {
		background: transparent;
	}
	
	:global(.overflow-y-auto::-webkit-scrollbar-thumb) {
		background-color: rgb(var(--color-gray-300));
		border-radius: var(--radius-sm);
	}
	
	:global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
		background-color: rgb(var(--color-gray-400));
	}
	
	/* Mobile slide up animation */
	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	
	:global(.animate-slide-up) {
		animation: slide-up 0.3s ease-out;
	}
</style>