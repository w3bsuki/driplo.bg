<script lang="ts">
	import { X, ChevronRight, Check, AlertCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { debounce } from '$lib/utils/performance';
	import * as m from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	
	// Constants
	const ANIMATION_DURATION = 300; // ms
	const DEBOUNCE_DELAY = 500; // ms
	const FOCUS_TRAP_SELECTOR = 'button, a, input, select, textarea';
	
	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		class?: string;
	}
	
	let { isOpen = false, onClose = () => {}, class: className = '' }: Props = $props();
	
	// State
	let selectedFilters = $state({
		category: '',
		subcategory: '',
		price: '',
		size: '',
		brand: '',
		condition: '',
		sort: 'recent'
	});
	
	let isApplying = $state(false);
	let applyError = $state<string | null>(null);
	let drawerRef = $state<HTMLDivElement>();
	
	// TODO: Fetch these from database
	// Main categories
	const categories = [
		{ slug: 'women', name: m.category_women(), icon: '👩', count: m.category_women_count() },
		{ slug: 'men', name: m.category_men(), icon: '👨', count: m.category_men_count() },
		{ slug: 'kids', name: m.category_kids(), icon: '👶', count: m.category_kids_count() },
		{ slug: 'designer', name: m.category_designer(), icon: '💎', count: m.category_designer_count() },
		{ slug: 'home', name: m.category_home(), icon: '🏠', count: m.category_home_count() }
	];
	
	// Subcategories
	const subcategories = [
		{ slug: 'dresses', name: m.subcategory_dresses(), icon: '👗' },
		{ slug: 'shoes', name: m.subcategory_shoes(), icon: '👠' },
		{ slug: 'bags', name: m.subcategory_bags(), icon: '👜' },
		{ slug: 'jackets', name: m.subcategory_jackets(), icon: '🧥' },
		{ slug: 'jeans', name: m.subcategory_jeans(), icon: '👖' },
		{ slug: 'tops', name: m.subcategory_tops(), icon: '👚' },
		{ slug: 'accessories', name: m.subcategory_accessories(), icon: '⌚' },
		{ slug: 'jewelry', name: m.subcategory_jewelry(), icon: '💍' }
	];
	
	// Filter options
	const priceRanges = [
		{ label: m.filter_price_under_20(), value: '0-20', ariaLabel: m.filter_price_under_20_aria ? m.filter_price_under_20_aria() : m.filter_price_under_20() },
		{ label: m.filter_price_20_50(), value: '20-50', ariaLabel: m.filter_price_20_50_aria ? m.filter_price_20_50_aria() : m.filter_price_20_50() },
		{ label: m.filter_price_50_100(), value: '50-100', ariaLabel: m.filter_price_50_100_aria ? m.filter_price_50_100_aria() : m.filter_price_50_100() },
		{ label: m.filter_price_100_200(), value: '100-200', ariaLabel: m.filter_price_100_200_aria ? m.filter_price_100_200_aria() : m.filter_price_100_200() },
		{ label: m.filter_price_200_plus(), value: '200-999', ariaLabel: m.filter_price_200_plus_aria ? m.filter_price_200_plus_aria() : m.filter_price_200_plus() }
	];
	
	const sizes = [
		{ label: 'XS', value: 'xs' },
		{ label: 'S', value: 's' },
		{ label: 'M', value: 'm' },
		{ label: 'L', value: 'l' },
		{ label: 'XL', value: 'xl' },
		{ label: 'XXL', value: 'xxl' }
	];
	
	// TODO: Fetch popular brands from database
	const brands = [
		{ label: 'Nike', value: 'nike' },
		{ label: 'Adidas', value: 'adidas' },
		{ label: 'Zara', value: 'zara' },
		{ label: 'H&M', value: 'hm' },
		{ label: 'Gucci', value: 'gucci' },
		{ label: 'Louis Vuitton', value: 'lv' },
		{ label: 'Chanel', value: 'chanel' },
		{ label: 'Prada', value: 'prada' }
	];
	
	const conditions = [
		{ label: m.listing_condition_new(), value: 'new' },
		{ label: m.listing_condition_like_new(), value: 'likenew' },
		{ label: m.condition_good(), value: 'verygood' },
		{ label: m.condition_good(), value: 'good' },
		{ label: m.condition_fair(), value: 'fair' }
	];
	
	const sortOptions = [
		{ label: m.filter_sort_recent(), value: 'recent', icon: '🆕' },
		{ label: m.filter_sort_price_low(), value: 'price-low', icon: '📈' },
		{ label: m.filter_sort_price_high(), value: 'price-high', icon: '📉' },
		{ label: m.filter_sort_popular(), value: 'popular', icon: '🔥' },
		{ label: m.filter_sort_ending(), value: 'ending', icon: '⏰' }
	];
	
	function selectFilter(type: keyof typeof selectedFilters, value: string) {
		selectedFilters[type] = selectedFilters[type] === value ? '' : value;
		applyError = null; // Clear any previous errors
	}
	
	function clearAllFilters() {
		selectedFilters = {
			category: '',
			subcategory: '',
			price: '',
			size: '',
			brand: '',
			condition: '',
			sort: 'recent'
		};
	}
	
	const applyFilters = debounce(async () => {
		try {
			isApplying = true;
			applyError = null;
			
			const params = new URLSearchParams();
			
			Object.entries(selectedFilters).forEach(([key, value]) => {
				if (value && value !== 'recent') {
					params.set(key, value);
				}
			});
			
			const url = selectedFilters.category 
				? `/${selectedFilters.category}${params.toString() ? '?' + params.toString() : ''}`
				: `/browse${params.toString() ? '?' + params.toString() : ''}`;
			
			await goto(url);
			onClose();
		} catch (error) {
			console.error('Filter application error:', error);
			applyError = m.filter_error ? m.filter_error() : 'Failed to apply filters';
		} finally {
			isApplying = false;
		}
	}, DEBOUNCE_DELAY);
	
	// Derived state
	const activeFilterCount = $derived(
		Object.values(selectedFilters).filter(v => v && v !== 'recent').length
	);
	
	// Focus management
	$effect(() => {
		if (isOpen && drawerRef) {
			// Focus first interactive element
			const firstFocusable = drawerRef.querySelector(FOCUS_TRAP_SELECTOR) as HTMLElement;
			if (firstFocusable) {
				firstFocusable.focus();
			}
			
			// Trap focus within drawer
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					onClose();
				}
				
				// Tab focus trap
				if (e.key === 'Tab' && drawerRef) {
					const focusables = Array.from(
						drawerRef.querySelectorAll(FOCUS_TRAP_SELECTOR)
					) as HTMLElement[];
					
					const firstFocusable = focusables[0];
					const lastFocusable = focusables[focusables.length - 1];
					
					if (e.shiftKey && document.activeElement === firstFocusable) {
						e.preventDefault();
						lastFocusable?.focus();
					} else if (!e.shiftKey && document.activeElement === lastFocusable) {
						e.preventDefault();
						firstFocusable?.focus();
					}
				}
			};
			
			document.addEventListener('keydown', handleKeyDown);
			
			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<!-- Backdrop -->
{#if isOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-{ANIMATION_DURATION}"
		onclick={onClose}
		aria-hidden="true"
	></div>
{/if}

<!-- Drawer -->
<div 
	bind:this={drawerRef}
	class={cn(
		"fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[70] transition-transform duration-{ANIMATION_DURATION} ease-out",
		isOpen ? "translate-y-0" : "translate-y-full",
		className
	)}
	role="dialog"
	aria-modal="true"
	aria-labelledby="filter-title"
	aria-describedby="filter-description"
>
	<div class="max-h-[80vh] flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between p-3 border-b border-gray-200">
			<div class="flex items-center gap-2">
				<h2 id="filter-title" class="text-base font-bold text-gray-900">{m.nav_filters()}</h2>
				{#if activeFilterCount > 0}
					<span class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full" aria-label={m.filter_active_count ? m.filter_active_count({ count: activeFilterCount }) : `${activeFilterCount} active filters`}>
						{activeFilterCount}
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				{#if activeFilterCount > 0}
					<button
						onclick={clearAllFilters}
						class="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
						aria-label={m.filter_clear_all_aria ? m.filter_clear_all_aria() : m.filter_clear_all()}
					>
						{m.filter_clear_all()}
					</button>
				{/if}
				<button
					onclick={onClose}
					class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
					aria-label={m.close_filters ? m.close_filters() : 'Close filters'}
				>
					<X class="h-4 w-4 text-gray-500" aria-hidden="true" />
				</button>
			</div>
		</div>
		
		<!-- Content -->
		<div class="flex-1 overflow-y-auto px-4 py-3 space-y-4" id="filter-description">
			<!-- Categories -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_categories()}</h3>
				<div class="grid grid-cols-2 gap-2">
					{#each categories as category (category.slug)}
						<button
							onclick={() => selectFilter('category', category.slug)}
							class={cn(
								"flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-left",
								selectedFilters.category === category.slug
									? "bg-blue-50 border-blue-300 text-blue-700"
									: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
							)}
							aria-pressed={selectedFilters.category === category.slug}
							aria-label={`${category.name} category`}
						>
							<span class="text-base" aria-hidden="true">{category.icon}</span>
							<div class="flex-1 min-w-0">
								<div class="font-medium text-xs">{category.name}</div>
								<div class="text-[10px] text-gray-500">{category.count}</div>
							</div>
							{#if selectedFilters.category === category.slug}
								<Check class="h-3 w-3 text-blue-600 flex-shrink-0" aria-hidden="true" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Subcategories -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_what_looking_for()}</h3>
				<div class="grid grid-cols-2 gap-2">
					{#each subcategories as subcategory (subcategory.slug)}
						<button
							onclick={() => selectFilter('subcategory', subcategory.slug)}
							class={cn(
								"flex items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 text-left",
								selectedFilters.subcategory === subcategory.slug
									? "bg-blue-50 border-blue-300 text-blue-700"
									: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
							)}
							aria-pressed={selectedFilters.subcategory === subcategory.slug}
							aria-label={`${subcategory.name} subcategory`}
						>
							<span class="text-sm" aria-hidden="true">{subcategory.icon}</span>
							<span class="font-medium text-xs flex-1">{subcategory.name}</span>
							{#if selectedFilters.subcategory === subcategory.slug}
								<Check class="h-3 w-3 text-blue-600 flex-shrink-0" aria-hidden="true" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Price Range -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_price_range()}</h3>
				<div class="grid grid-cols-2 gap-2">
					{#each priceRanges as price (price.value)}
						<button
							onclick={() => selectFilter('price', price.value)}
							class={cn(
								"p-2 rounded-lg border text-center font-medium text-xs transition-all duration-200",
								selectedFilters.price === price.value
									? "bg-blue-500 border-blue-500 text-white"
									: "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
							)}
							aria-pressed={selectedFilters.price === price.value}
							aria-label={price.ariaLabel}
						>
							{price.label}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Size -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_size()}</h3>
				<div class="flex flex-wrap gap-2">
					{#each sizes as size (size.value)}
						<button
							onclick={() => selectFilter('size', size.value)}
							class={cn(
								"px-3 py-1.5 rounded-lg border font-medium text-xs transition-all duration-200 min-w-[45px]",
								selectedFilters.size === size.value
									? "bg-blue-500 border-blue-500 text-white"
									: "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
							)}
							aria-pressed={selectedFilters.size === size.value}
							aria-label={`Size ${size.label}`}
						>
							{size.label}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Brand -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_brand()}</h3>
				<div class="grid grid-cols-2 gap-2">
					{#each brands as brand (brand.value)}
						<button
							onclick={() => selectFilter('brand', brand.value)}
							class={cn(
								"p-2 rounded-lg border text-center font-medium text-xs transition-all duration-200",
								selectedFilters.brand === brand.value
									? "bg-blue-500 border-blue-500 text-white"
									: "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
							)}
							aria-pressed={selectedFilters.brand === brand.value}
							aria-label={`Brand ${brand.label}`}
						>
							{brand.label}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Condition -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_condition()}</h3>
				<div class="space-y-2">
					{#each conditions as condition (condition.value)}
						<button
							onclick={() => selectFilter('condition', condition.value)}
							class={cn(
								"w-full p-2 rounded-lg border text-left font-medium text-xs transition-all duration-200 flex items-center justify-between",
								selectedFilters.condition === condition.value
									? "bg-primary/10 border-primary/30 text-primary"
									: "bg-background border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
							)}
							aria-pressed={selectedFilters.condition === condition.value}
							aria-label={`Condition: ${condition.label}`}
						>
							<span>{condition.label}</span>
							{#if selectedFilters.condition === condition.value}
								<Check class="h-3 w-3 text-blue-600" aria-hidden="true" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Sort -->
			<div>
				<h3 class="text-sm font-semibold text-gray-900 mb-2">{m.filter_sort_by()}</h3>
				<div class="space-y-2">
					{#each sortOptions as sort (sort.value)}
						<button
							onclick={() => selectFilter('sort', sort.value)}
							class={cn(
								"w-full p-2 rounded-lg border text-left font-medium text-xs transition-all duration-200 flex items-center gap-2",
								selectedFilters.sort === sort.value
									? "bg-primary/10 border-primary/30 text-primary"
									: "bg-background border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
							)}
							aria-pressed={selectedFilters.sort === sort.value}
							aria-label={`Sort by: ${sort.label}`}
						>
							<span class="text-sm" aria-hidden="true">{sort.icon}</span>
							<span class="flex-1">{sort.label}</span>
							{#if selectedFilters.sort === sort.value}
								<Check class="h-3 w-3 text-blue-600" aria-hidden="true" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="border-t border-gray-200 p-3 bg-gray-50">
			{#if applyError}
				<div class="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
					<AlertCircle class="h-3 w-3 flex-shrink-0" aria-hidden="true" />
					<span role="alert">{applyError}</span>
				</div>
			{/if}
			<button
				onclick={() => applyFilters()}
				class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={isApplying}
				aria-busy={isApplying}
			>
				{#if isApplying}
					<span class="inline-flex items-center gap-2">
						<span class="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" aria-hidden="true"></span>
						{m.filter_applying ? m.filter_applying() : 'Applying...'}
					</span>
				{:else if activeFilterCount > 0}
					{m.filter_apply_count({ count: activeFilterCount })}
				{:else}
					{m.filter_browse_all()}
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	/* Animation duration variable */
	.duration-300 {
		transition-duration: 300ms;
	}
</style>