<script lang="ts">
	import { X, ChevronRight, User, LogIn, Star, Percent, ShoppingBag, Heart, Package } from 'lucide-svelte';
	import { navigation } from '$lib/stores/navigation.svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/types';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	// State for expanded categories
	let expandedCategory = $state<string | null>(null);
	
	// Professional category data with icons
	const categoryData = [
		{
			slug: 'women',
			name: m.category_women(),
			color: 'bg-pink-500',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses' },
				{ name: m.women_tops_blouses(), slug: 'tops' },
				{ name: m.women_pants_jeans(), slug: 'pants' },
				{ name: m.women_jackets_coats(), slug: 'jackets' },
				{ name: m.women_shoes(), slug: 'shoes' },
				{ name: m.women_bags_accessories(), slug: 'bags' },
				{ name: m.subcategory_jewelry(), slug: 'jewelry' }
			]
		},
		{
			slug: 'men',
			name: m.category_men(),
			color: 'bg-blue-500',
			subcategories: [
				{ name: m.men_tshirts(), slug: 'tshirts' },
				{ name: m.men_shirts(), slug: 'shirts' },
				{ name: m.men_pants_jeans(), slug: 'pants' },
				{ name: m.men_jackets_coats(), slug: 'jackets' },
				{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies' },
				{ name: m.men_shoes(), slug: 'shoes' },
				{ name: m.men_accessories(), slug: 'accessories' }
			]
		},
		{
			slug: 'kids',
			name: m.category_kids(),
			color: 'bg-amber-500',
			subcategories: [
				{ name: m.kids_boys(), slug: 'boys' },
				{ name: m.kids_girls(), slug: 'girls' },
				{ name: m.kids_baby(), slug: 'baby' },
				{ name: m.kids_shoes(), slug: 'shoes' }
			]
		}
	];

	// Popular brands list
	const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Prada'];
	
	function toggleCategory(slug: string) {
		expandedCategory = expandedCategory === slug ? null : slug;
	}
	
	function handleNavigation(path: string) {
		navigation.closeMobileMenu();
		goto(path);
	}

	function handleBrandClick(brand: string) {
		navigation.closeMobileMenu();
		goto(`/browse?brand=${encodeURIComponent(brand)}`);
	}
</script>

{#if navigation.isMobileMenuOpen}
	<!-- Professional Backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
		onclick={() => navigation.closeMobileMenu()}
		transition:fade={{ duration: 250 }}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
	
	<!-- Professional Sidebar Menu -->
	<nav 
		class="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[61] md:hidden overflow-y-auto"
		transition:fly={{ x: -320, duration: 250 }}
		aria-label="Category menu"
	>
		<!-- Premium Header -->
		<div class="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 flex items-center justify-between shadow-lg z-10">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
					<ShoppingBag class="h-4 w-4 text-white" />
				</div>
				<div>
					<h2 class="text-lg font-semibold">Driplo</h2>
					<p class="text-xs text-white/70">Fashion Marketplace</p>
				</div>
			</div>
			<button
				onclick={() => navigation.closeMobileMenu()}
				class="p-2 hover:bg-white/10 rounded-lg transition-colors"
				aria-label="Close menu"
			>
				<X class="h-5 w-5" />
			</button>
		</div>
		
		<!-- Auth Section -->
		<div class="px-5 py-4 bg-gray-50">
			<div class="grid grid-cols-2 gap-2">
				<button
					onclick={() => handleNavigation('/login')}
					class="flex items-center justify-center gap-1 px-2 py-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 shadow-sm"
				>
					<LogIn class="h-3.5 w-3.5 text-gray-700" />
					<span class="text-[13px] font-medium text-gray-900">{m.auth_sign_in()}</span>
				</button>
				
				<button
					onclick={() => handleNavigation('/register')}
					class="flex items-center justify-center gap-1 px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
				>
					<User class="h-3.5 w-3.5" />
					<span class="text-[13px] font-medium">{m.auth_sign_up()}</span>
				</button>
			</div>
		</div>
		
		<!-- Shop by Category -->
		<div class="px-5 py-4">
			<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
				{m.filter_categories()}
			</h3>
			
			<div class="space-y-2">
				{#each categoryData as category}
					<div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
						<button
							onclick={() => toggleCategory(category.slug)}
							class="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group"
						>
							<div class="flex items-center gap-3">
								<div class={`w-8 h-8 rounded-lg flex items-center justify-center ${
									category.slug === 'women' ? 'bg-pink-50 border border-pink-200' :
									category.slug === 'men' ? 'bg-blue-50 border border-blue-200' :
									'bg-amber-50 border border-amber-200'
								}`}>
									<div class={`w-3 h-3 rounded-full ${
										category.slug === 'women' ? 'bg-pink-500' :
										category.slug === 'men' ? 'bg-blue-500' :
										'bg-amber-500'
									}`}></div>
								</div>
								<span class="text-sm font-semibold text-gray-900">{category.name}</span>
							</div>
							<ChevronRight class={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
								expandedCategory === category.slug ? 'rotate-90' : ''
							}`} />
						</button>
						
						{#if expandedCategory === category.slug}
							<div class="bg-gray-50 border-t border-gray-100 px-3 py-2" transition:fade={{ duration: 150 }}>
								{#each category.subcategories as sub}
									<button
										onclick={() => handleNavigation(`/${category.slug}/${sub.slug}`)}
										class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
									>
										{sub.name}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Popular Brands -->
		<div class="px-5 py-4 bg-gray-50/50">
			<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
				Popular Brands
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each brands as brand}
					<button
						onclick={() => handleBrandClick(brand)}
						class="px-3 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 border border-gray-200 rounded-full transition-colors"
					>
						{brand}
					</button>
				{/each}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="px-5 py-4 bg-gray-50">
			<div class="grid grid-cols-2 gap-3">
				<button
					onclick={() => handleNavigation('/browse?filter=sale')}
					class="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
				>
					<Percent class="h-5 w-5 text-red-500" />
					<span class="text-xs font-medium">{m.quick_filter_sale()}</span>
				</button>
				<button
					onclick={() => handleNavigation('/leaderboard')}
					class="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
				>
					<Star class="h-5 w-5 text-amber-500" />
					<span class="text-xs font-medium">{m.nav_sellers()}</span>
				</button>
				<button
					onclick={() => handleNavigation('/favorites')}
					class="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
				>
					<Heart class="h-5 w-5 text-pink-500" />
					<span class="text-xs font-medium">Favorites</span>
				</button>
				<button
					onclick={() => handleNavigation('/orders')}
					class="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
				>
					<Package class="h-5 w-5 text-blue-500" />
					<span class="text-xs font-medium">Orders</span>
				</button>
			</div>
		</div>

		<!-- Footer -->
		<div class="px-5 py-4 bg-white">
			<div class="flex justify-center gap-4 text-xs">
				<button
					onclick={() => handleNavigation('/privacy')}
					class="text-gray-500 hover:text-gray-700 transition-colors"
				>
					Privacy
				</button>
				<span class="text-gray-300">•</span>
				<button
					onclick={() => handleNavigation('/terms')}
					class="text-gray-500 hover:text-gray-700 transition-colors"
				>
					Terms
				</button>
				<span class="text-gray-300">•</span>
				<button
					onclick={() => handleNavigation('/help')}
					class="text-gray-500 hover:text-gray-700 transition-colors"
				>
					Help
				</button>
			</div>
			<div class="text-center mt-3">
				<p class="text-xs text-gray-400">© 2024 Driplo. All rights reserved.</p>
			</div>
		</div>
	</nav>
{/if}