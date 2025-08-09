<script lang="ts">
	import { X, ChevronRight, ChevronDown, Home, Search, Tag, Star, Percent, Instagram, Music, Mail, Shield, FileText, HelpCircle } from 'lucide-svelte';
	import { navigation } from '$lib/stores/navigation.svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/types';
	
	interface Props {
		categories?: Category[];
	}
	
	let { categories = [] }: Props = $props();
	
	// State for expanded categories
	let expandedCategories = $state<Set<string>>(new Set());
	
	// Category data with translations
	const categoryData = [
		{
			slug: 'women',
			name: m.category_women(),
			icon: '👩',
			color: 'from-pink-500 to-rose-500',
			subcategories: [
				{ name: m.subcategory_dresses(), slug: 'dresses', icon: '👗' },
				{ name: m.women_tops_blouses(), slug: 'tops', icon: '👚' },
				{ name: m.women_skirts(), slug: 'skirts', icon: '👗' },
				{ name: m.women_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.women_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.women_shoes(), slug: 'shoes', icon: '👠' },
				{ name: m.women_bags_accessories(), slug: 'bags', icon: '👜' },
				{ name: m.subcategory_jewelry(), slug: 'jewelry', icon: '💍' }
			]
		},
		{
			slug: 'men',
			name: m.category_men(),
			icon: '👨',
			color: 'from-blue-500 to-indigo-500',
			subcategories: [
				{ name: m.men_tshirts(), slug: 'tshirts', icon: '👕' },
				{ name: m.men_shirts(), slug: 'shirts', icon: '👔' },
				{ name: m.men_pants_jeans(), slug: 'pants', icon: '👖' },
				{ name: m.men_jackets_coats(), slug: 'jackets', icon: '🧥' },
				{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies', icon: '👕' },
				{ name: m.men_shoes(), slug: 'shoes', icon: '👞' },
				{ name: m.men_accessories(), slug: 'accessories', icon: '⌚' }
			]
		},
		{
			slug: 'kids',
			name: m.category_kids(),
			icon: '👶',
			color: 'from-yellow-500 to-orange-500',
			subcategories: [
				{ name: m.kids_boys(), slug: 'boys', icon: '👦' },
				{ name: m.kids_girls(), slug: 'girls', icon: '👧' },
				{ name: m.kids_baby(), slug: 'baby', icon: '👶' },
				{ name: m.kids_shoes(), slug: 'shoes', icon: '👟' }
			]
		}
	];
	
	// Popular brands
	const popularBrands = [
		{ name: 'Nike', icon: '👟', color: 'bg-gray-900' },
		{ name: 'Adidas', icon: '⚡', color: 'bg-gray-800' },
		{ name: 'Zara', icon: '👗', color: 'bg-gray-700' },
		{ name: 'H&M', icon: '🛍️', color: 'bg-gray-600' },
		{ name: 'Gucci', icon: '💎', color: 'bg-gray-900' },
		{ name: 'Prada', icon: '👜', color: 'bg-gray-800' }
	];
	
	function toggleCategory(slug: string) {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(slug)) {
			newExpanded.delete(slug);
		} else {
			newExpanded.add(slug);
		}
		expandedCategories = newExpanded;
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
	<!-- Enhanced Backdrop with blur -->
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
		onclick={() => navigation.closeMobileMenu()}
		transition:fade={{ duration: 300 }}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
	
	<!-- Modern Sidebar Menu -->
	<nav 
		class="fixed top-0 left-0 h-full w-[90%] max-w-sm bg-white shadow-2xl z-[61] md:hidden overflow-y-auto"
		transition:fly={{ x: -400, duration: 300, opacity: 0.8 }}
		aria-label="Category menu"
	>
		<!-- Modern Header with gradient -->
		<div class="sticky top-0 bg-gradient-to-r from-black to-gray-900 text-white px-6 py-5 flex items-center justify-between shadow-lg">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
					<span class="text-2xl">👕</span>
				</div>
				<div>
					<h2 class="text-xl font-bold">Driplo</h2>
					<p class="text-white/70 text-xs">Premium Fashion</p>
				</div>
			</div>
			<button
				onclick={() => navigation.closeMobileMenu()}
				class="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
				aria-label="Close menu"
			>
				<X class="h-5 w-5 text-white" />
			</button>
		</div>
		
		<!-- Quick Navigation Cards -->
		<div class="p-6 space-y-3">
			<button
				onclick={() => handleNavigation('/')}
				class="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100"
			>
				<div class="p-2 bg-black rounded-xl">
					<Home class="h-5 w-5 text-white" />
				</div>
				<div class="text-left">
					<span class="font-semibold text-gray-900">Home</span>
					<p class="text-xs text-gray-500">Back to main page</p>
				</div>
			</button>
			
			<button
				onclick={() => handleNavigation('/browse')}
				class="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-100"
			>
				<div class="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
					<Search class="h-5 w-5 text-white" />
				</div>
				<div class="text-left">
					<span class="font-semibold text-gray-900">{m.category_all()}</span>
					<p class="text-xs text-gray-500">Browse all items</p>
				</div>
			</button>
		</div>
		
		<!-- Categories Section -->
		<div class="px-6 pb-4">
			<div class="flex items-center gap-2 mb-4">
				<Tag class="h-4 w-4 text-gray-400" />
				<h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
					{m.filter_categories()}
				</h3>
			</div>
			
			<div class="space-y-2">
				{#each categoryData as category}
					<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
						<!-- Category Header -->
						<button
							onclick={() => toggleCategory(category.slug)}
							class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200"
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-gradient-to-r {category.color} rounded-xl flex items-center justify-center shadow-sm">
									<span class="text-lg">{category.icon}</span>
								</div>
								<span class="font-semibold text-gray-900">{category.name}</span>
							</div>
							<ChevronDown class={cn(
								"h-5 w-5 text-gray-400 transition-transform duration-300",
								expandedCategories.has(category.slug) && "rotate-180"
							)} />
						</button>
						
						<!-- Subcategories -->
						{#if expandedCategories.has(category.slug)}
							<div class="bg-gray-50 border-t border-gray-100" transition:fade={{ duration: 200 }}>
								<div class="p-2 space-y-1">
									{#each category.subcategories as sub}
										<button
											onclick={() => handleNavigation(`/${category.slug}/${sub.slug}`)}
											class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all duration-200 text-left group"
										>
											<span class="text-base group-hover:scale-110 transition-transform duration-200">{sub.icon}</span>
											<span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{sub.name}</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Popular Brands -->
		<div class="px-6 pb-4">
			<div class="flex items-center gap-2 mb-4">
				<Star class="h-4 w-4 text-gray-400" />
				<h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
					{m.filter_popular_brands()}
				</h3>
			</div>
			<div class="grid grid-cols-2 gap-3">
				{#each popularBrands as brand}
					<button
						onclick={() => handleBrandClick(brand.name)}
						class="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100 group"
					>
						<div class="w-8 h-8 {brand.color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
							<span class="text-sm text-white">{brand.icon}</span>
						</div>
						<span class="text-sm font-semibold text-gray-900">{brand.name}</span>
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Footer Links -->
		<div class="px-6 pb-4 space-y-3 border-t border-gray-100 pt-6">
			<button
				onclick={() => handleNavigation('/leaderboard')}
				class="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 shadow-sm hover:shadow-md border border-yellow-100"
			>
				<div class="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
					<Star class="h-5 w-5 text-white" />
				</div>
				<div class="text-left">
					<span class="font-semibold text-gray-900">{m.nav_sellers()}</span>
					<p class="text-xs text-gray-500">Top performers</p>
				</div>
			</button>
			
			<button
				onclick={() => handleNavigation('/browse?filter=sale')}
				class="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md border border-green-100"
			>
				<div class="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
					<Percent class="h-5 w-5 text-white" />
				</div>
				<div class="text-left">
					<span class="font-semibold text-gray-900">{m.quick_filter_sale()}</span>
					<p class="text-xs text-gray-500">Special offers</p>
				</div>
			</button>
		</div>

		<!-- Social Media Links -->
		<div class="px-6 pb-4">
			<div class="flex items-center gap-2 mb-3">
				<div class="flex-1 h-px bg-gray-200"></div>
				<span class="text-xs font-medium text-gray-500">Follow us</span>
				<div class="flex-1 h-px bg-gray-200"></div>
			</div>
			
			<div class="flex justify-center gap-4">
				<a 
					href="https://instagram.com/driplo.bg" 
					target="_blank" 
					rel="noopener noreferrer"
					class="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<Instagram class="h-5 w-5" />
				</a>
				<a 
					href="https://tiktok.com/@driplo.bg" 
					target="_blank" 
					rel="noopener noreferrer"
					class="p-3 bg-black rounded-2xl text-white hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<Music class="h-5 w-5" />
				</a>
				<button
					onclick={() => handleNavigation('/contact')}
					class="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<Mail class="h-5 w-5" />
				</button>
			</div>
		</div>

		<!-- GDPR & Legal Footer -->
		<div class="px-6 pb-6 border-t border-gray-100 pt-4 bg-gray-50">
			<!-- Legal Links -->
			<div class="grid grid-cols-2 gap-3 mb-4">
				<button
					onclick={() => handleNavigation('/privacy')}
					class="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200"
				>
					<Shield class="h-4 w-4 text-gray-600" />
					<span class="text-xs font-medium text-gray-700">Privacy Policy</span>
				</button>
				<button
					onclick={() => handleNavigation('/terms')}
					class="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200"
				>
					<FileText class="h-4 w-4 text-gray-600" />
					<span class="text-xs font-medium text-gray-700">Terms of Use</span>
				</button>
			</div>

			<!-- GDPR Notice -->
			<div class="bg-white rounded-xl p-4 border border-gray-100">
				<div class="flex items-start gap-3">
					<div class="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
						<Shield class="h-4 w-4 text-blue-600" />
					</div>
					<div>
						<p class="text-xs font-medium text-gray-900 mb-1">GDPR Compliant</p>
						<p class="text-xs text-gray-600 leading-relaxed">
							We protect your data according to EU regulations. You have full control over your personal information.
						</p>
						<button 
							onclick={() => handleNavigation('/gdpr')}
							class="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 underline"
						>
							Learn more
						</button>
					</div>
				</div>
			</div>

			<!-- Copyright -->
			<div class="text-center mt-4 pt-3 border-t border-gray-200">
				<p class="text-xs text-gray-500">© 2024 Driplo. All rights reserved.</p>
			</div>
		</div>
	</nav>
{/if}