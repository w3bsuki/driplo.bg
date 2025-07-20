<script lang="ts">
	import { ChevronDown, ChevronRight, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { clickOutside } from '$lib/actions';
	import type { Category } from '$lib/types';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		categories?: Category[];
		isOpen?: boolean;
		onToggle?: () => void;
		onClose?: () => void;
		class?: string;
	}

	let { 
		categories = [], 
		isOpen = false, 
		onToggle = () => {}, 
		onClose = () => {},
		class: className = ''
	}: Props = $props();

	let activeMainCategory = $state('');
	let hoveredCategory = $state('');

	// Category hierarchy with subcategories
	const categoryHierarchy = $derived([
		{
			slug: '',
			name: m.category_all(),
			icon: '🔍',
			subcategories: []
		},
		{
			slug: 'women',
			name: m.category_women(),
			icon: '👩',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses', icon: '👗' },
				{ name: m.women_tops_blouses(), slug: 'tops', icon: '👚' },
				{ name: m.women_skirts(), slug: 'skirts', icon: '👗' },
				{ name: m.women_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.women_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.women_shoes(), slug: 'shoes', icon: '👠' },
				{ name: m.women_bags_accessories(), slug: 'bags', icon: '👜' },
				{ name: m.subcategory_jewelry(), slug: 'jewelry', icon: '💍' },
				{ name: m.women_lingerie(), slug: 'lingerie', icon: '👙' },
				{ name: m.women_activewear(), slug: 'activewear', icon: '🏃‍♀️' }
			]
		},
		{
			slug: 'men',
			name: m.category_men(),
			icon: '👨',
			subcategories: [
				{ name: m.men_tshirts(), slug: 'tshirts', icon: '👕' },
				{ name: m.men_shirts(), slug: 'shirts', icon: '👔' },
				{ name: m.men_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.men_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies', icon: '👕' },
				{ name: m.men_shoes(), slug: 'shoes', icon: '👞' },
				{ name: m.men_accessories(), slug: 'accessories', icon: '⌚' },
				{ name: m.men_suits_formal(), slug: 'suits', icon: '🤵' },
				{ name: m.men_activewear(), slug: 'activewear', icon: '🏃‍♂️' },
				{ name: m.men_underwear(), slug: 'underwear', icon: '🩲' }
			]
		},
		{
			slug: 'kids',
			name: m.category_kids(),
			icon: '👶',
			subcategories: [
				{ name: m.kids_baby(), slug: 'baby', icon: '👶' },
				{ name: m.kids_girls(), slug: 'girls', icon: '👧' },
				{ name: m.kids_boys(), slug: 'boys', icon: '👦' },
				{ name: m.kids_shoes(), slug: 'shoes', icon: '👟' },
				{ name: m.kids_school_uniforms(), slug: 'school', icon: '🎒' },
				{ name: m.kids_toys_games(), slug: 'toys', icon: '🧸' },
				{ name: m.kids_maternity(), slug: 'maternity', icon: '🤱' }
			]
		},
		{
			slug: 'designer',
			name: m.category_designer(),
			icon: '💎',
			subcategories: [
				{ name: m.designer_luxury_handbags(), slug: 'handbags', icon: '👜' },
				{ name: m.designer_shoes(), slug: 'shoes', icon: '👠' },
				{ name: m.designer_dresses(), slug: 'dresses', icon: '👗' },
				{ name: m.designer_luxury_watches(), slug: 'watches', icon: '⌚' },
				{ name: m.designer_fine_jewelry(), slug: 'jewelry', icon: '💍' },
				{ name: m.designer_sunglasses(), slug: 'sunglasses', icon: '🕶️' },
				{ name: m.designer_vintage_pieces(), slug: 'vintage', icon: '🕰️' }
			]
		},
		{
			slug: 'home',
			name: m.category_home(),
			icon: '🏠',
			subcategories: [
				{ name: m.home_furniture(), slug: 'furniture', icon: '🪑' },
				{ name: m.home_decor(), slug: 'decor', icon: '🖼️' },
				{ name: m.home_kitchen(), slug: 'kitchen', icon: '🍽️' },
				{ name: m.home_bedding(), slug: 'bedding', icon: '🛏️' },
				{ name: m.home_lighting(), slug: 'lighting', icon: '💡' }
			]
		}
	]);

	function handleMainCategoryClick(categorySlug: string) {
		if (categorySlug === activeMainCategory) {
			// If clicking the same category, toggle it
			activeMainCategory = '';
		} else {
			// Set new active category
			activeMainCategory = categorySlug;
		}
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

	function handleCategoryNavigation(categorySlug: string) {
		onClose();
		if (categorySlug) {
			goto(`/${categorySlug}`);
		} else {
			goto('/browse');
		}
	}
</script>

<!-- Category Dropdown -->
{#if isOpen}
	<div 
		class={cn(
			"absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] md:w-[600px]",
			"bg-white rounded-2xl shadow-xl border border-gray-200 z-[100] overflow-hidden",
			className
		)}
		use:clickOutside={onClose}
	>
		<!-- Mobile Layout -->
		<div class="md:hidden max-h-[60vh] flex flex-col">
			<!-- Quick Filters at Top -->
			<div class="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white relative">
				<button
					onclick={onClose}
					class="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
				>
					<X class="w-4 h-4 text-gray-500" />
				</button>
				<div class="grid grid-cols-2 gap-2">
					<button
						onclick={() => {
							onClose();
							goto('/browse?filter=new-with-tags');
						}}
						class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
					>
						<span class="text-base">🏷️</span>
						<div class="text-left">
							<div class="text-xs font-medium text-gray-900">New Tags</div>
							<div class="text-[10px] text-gray-500">Brand new</div>
						</div>
					</button>
					
					<button
						onclick={() => {
							onClose();
							goto('/browse?filter=sale');
						}}
						class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
					>
						<span class="text-base">💸</span>
						<div class="text-left">
							<div class="text-xs font-medium text-gray-900">On Sale</div>
							<div class="text-[10px] text-gray-500">Deals</div>
						</div>
					</button>
					
					<button
						onclick={() => {
							onClose();
							goto('/browse?sort=favorites_count&order=desc');
						}}
						class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
					>
						<span class="text-base">❤️</span>
						<div class="text-left">
							<div class="text-xs font-medium text-gray-900">Most Liked</div>
							<div class="text-[10px] text-gray-500">Popular</div>
						</div>
					</button>
					
					<button
						onclick={() => {
							onClose();
							goto('/browse?sort=created_at&order=desc');
						}}
						class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
					>
						<span class="text-base">✨</span>
						<div class="text-left">
							<div class="text-xs font-medium text-gray-900">Latest</div>
							<div class="text-[10px] text-gray-500">Just in</div>
						</div>
					</button>
				</div>
			</div>
			
			<!-- Categories List -->
			<div class="flex-1 overflow-y-auto">
				<div class="px-3 py-2">
					<div class="grid grid-cols-2 gap-2">
						{#each categoryHierarchy as category}
							<button
								onclick={() => handleCategoryNavigation(category.slug)}
								class="flex items-center gap-2 px-2 py-2 text-left transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 rounded-lg"
							>
								<div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
									<span class="text-base">{category.icon}</span>
								</div>
								<div class="min-w-0 flex-1">
									<div class="font-medium text-sm text-gray-900 truncate">
										{category.name}
									</div>
									<div class="text-xs text-gray-500">
										{category.subcategories.length} items
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
		
		<!-- Desktop Layout -->
		<div class="hidden md:flex">
			<!-- Left Column - Categories -->
			<div class="flex-1 max-h-[70vh] overflow-y-auto border-r border-gray-100">
				{#each categoryHierarchy as category}
					<button
						onclick={() => handleCategoryNavigation(category.slug)}
						onmouseenter={() => hoveredCategory = category.slug}
						onmouseleave={() => hoveredCategory = ''}
						class={cn(
							"w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-blue-50",
							hoveredCategory === category.slug && "bg-blue-50"
						)}
					>
						<div class="flex items-center gap-3">
							<span class="text-lg">{category.icon}</span>
							<div>
								<div class={cn(
									"font-medium text-sm",
									hoveredCategory === category.slug ? "text-blue-400" : "text-gray-900"
								)}>
									{category.name}
								</div>
								<div class="text-xs text-gray-500">
									{m.category_subcategories_count({ count: category.subcategories.length })}
								</div>
							</div>
						</div>
						
						<ChevronRight class={cn(
							"h-4 w-4 transition-transform duration-200",
							hoveredCategory === category.slug ? "text-blue-400" : "text-gray-400"
						)} />
					</button>
				{/each}
			</div>
			
			<!-- Right Column - Trending/Filters -->
			<div class="w-72 bg-gradient-to-br from-blue-50 to-white p-4">
				<!-- Trending Section -->
				<div class="mb-6">
					<h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
						<span class="text-base">🔥</span> Trending Now
					</h3>
					<div class="space-y-2">
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=new-with-tags');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">🏷️</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">New with Tags</div>
								<div class="text-xs text-gray-500">Brand new items</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=sale');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">💸</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">On Sale</div>
								<div class="text-xs text-gray-500">Discounted items</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?sort=created_at&order=desc');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">✨</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Latest Arrivals</div>
								<div class="text-xs text-gray-500">Just added</div>
							</div>
						</button>
					</div>
				</div>
				
				<!-- Popular Filters -->
				<div>
					<h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
						<span class="text-base">⭐</span> Popular
					</h3>
					<div class="space-y-2">
						<button
							onclick={() => {
								onClose();
								goto('/browse?sort=favorites_count&order=desc');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">❤️</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Most Liked</div>
								<div class="text-xs text-gray-500">Popular items</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?filter=hot');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">🔥</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Hot Items</div>
								<div class="text-xs text-gray-500">Trending fast</div>
							</div>
						</button>
						
						<button
							onclick={() => {
								onClose();
								goto('/browse?price=0-20');
							}}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors group"
						>
							<span class="text-lg">💰</span>
							<div class="text-left">
								<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Under $20</div>
								<div class="text-xs text-gray-500">Budget finds</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="border-t border-gray-200 p-4 bg-gray-50">
			<div class="flex items-center justify-between text-sm">
				<span class="text-gray-600">{m.category_need_help()}</span>
				<button
					onclick={() => {
						onClose();
						goto('/browse');
					}}
					class="text-blue-400 hover:text-blue-500 font-medium"
				>
					{m.category_browse_all_link()}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for the dropdown */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: #e5e7eb transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #e5e7eb;
		border-radius: 3px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: #d1d5db;
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
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>