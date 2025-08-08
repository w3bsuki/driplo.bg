<script lang="ts">
	import { ChevronRight, ChevronLeft, X } from 'lucide-svelte';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { getCategoryHierarchy, popularBrands } from './CategoryData.ts';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		activeMainCategory: string;
		onClose: () => void;
		onCategorySelect: (category: string) => void;
		onSubcategoryClick: (mainCategory: string, subcategory: string) => void;
		onNavigateTo: (path: string) => void;
	}

	let { 
		activeMainCategory, 
		onClose, 
		onCategorySelect,
		onSubcategoryClick,
		onNavigateTo 
	}: Props = $props();

	const categoryHierarchy = getCategoryHierarchy();
</script>

<!-- Mobile Layout - Simplified and Touch-Optimized -->
<div class="md:hidden flex flex-col">
	<!-- Header - Cleaner with Close Button -->
	<div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
		<h3 class="text-base font-semibold text-gray-900">
			{getLocale() === 'bg' ? 'Намери това, което търсиш' : 'Find what you\'re looking for'}
		</h3>
		<button
			type="button"
			onclick={onClose}
			class="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
			aria-label="Close menu"
		>
			<X class="w-5 h-5 text-gray-500" />
		</button>
	</div>
	
	<!-- Content - Unified Scrollable List -->
	<div class="overflow-y-auto max-h-[70vh] bg-gray-50">
		{#if activeMainCategory}
			<!-- Subcategory View -->
			{@const selectedCategory = categoryHierarchy.find(cat => cat.slug === activeMainCategory)}
			{#if selectedCategory}
				<div class="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
					<button
						onclick={() => onCategorySelect('')}
						class="flex items-center gap-2 text-sm text-blue-500 font-medium"
					>
						<ChevronLeft class="h-4 w-4" />
						<span>{getLocale() === 'bg' ? 'Всички категории' : 'All Categories'}</span>
					</button>
					<h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2 mt-2">
						<span class="text-2xl">{selectedCategory.icon}</span>
						<span>{selectedCategory.name}</span>
					</h3>
				</div>
				<div class="p-4 space-y-1">
					{#each selectedCategory.subcategories as subcat}
						<button
							onclick={() => onSubcategoryClick(selectedCategory.slug, subcat.slug)}
							class="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors text-left"
						>
							<span class="text-2xl flex-shrink-0">{subcat.icon}</span>
							<span class="text-base font-medium text-gray-900">{subcat.name}</span>
							<ChevronRight class="h-4 w-4 text-gray-400 ml-auto" />
						</button>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Main View - All Categories -->
			<div class="p-4 space-y-6">
				<!-- Main Categories Section -->
				<div>
					<h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
						{getLocale() === 'bg' ? 'Категории' : 'Categories'}
					</h4>
					<div class="space-y-1">
						{#each categoryHierarchy.filter(cat => cat.slug !== '') as category}
							<button
								onclick={() => {
									if (category.subcategories.length > 0) {
										onCategorySelect(category.slug);
									} else {
										onNavigateTo(category.slug ? `/${category.slug}` : '/browse');
									}
								}}
								class="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors text-left"
							>
								<span class="text-2xl flex-shrink-0">{category.icon}</span>
								<div class="flex-1">
									<div class="text-base font-medium text-gray-900">{category.name}</div>
									{#if category.subcategories.length > 0}
										<div class="text-xs text-gray-500">
											{m.category_subcategories_count({ count: category.subcategories.length })}
										</div>
									{/if}
								</div>
								{#if category.subcategories.length > 0}
									<ChevronRight class="h-4 w-4 text-gray-400" />
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Quick Actions Section -->
				<div>
					<h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
						{getLocale() === 'bg' ? 'Бързи филтри' : 'Quick Filters'}
					</h4>
					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={() => onNavigateTo('/browse?filter=sale')}
							class="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium text-sm shadow-sm"
						>
							<span class="text-lg">🔥</span>
							<span>{getLocale() === 'bg' ? 'Намаления' : 'On Sale'}</span>
						</button>
						<button
							onclick={() => onNavigateTo('/browse?condition=new_with_tags')}
							class="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm shadow-sm"
						>
							<span class="text-lg">🏷️</span>
							<span>{getLocale() === 'bg' ? 'С етикети' : 'With Tags'}</span>
						</button>
						<button
							onclick={() => onNavigateTo('/browse?sort=created_at&order=desc')}
							class="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
						>
							<span class="text-lg">✨</span>
							<span>{getLocale() === 'bg' ? 'Най-нови' : 'Newest'}</span>
						</button>
						<button
							onclick={() => onNavigateTo('/browse?sort=favorites_count&order=desc')}
							class="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
						>
							<span class="text-lg">❤️</span>
							<span>{getLocale() === 'bg' ? 'Популярни' : 'Popular'}</span>
						</button>
					</div>
				</div>

				<!-- Popular Brands Section -->
				<div>
					<h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
						{getLocale() === 'bg' ? 'Популярни марки' : 'Popular Brands'}
					</h4>
					<div class="grid grid-cols-4 gap-2">
						{#each popularBrands.slice(0, 8) as brand}
							<button
								onclick={() => onNavigateTo(`/browse?brand=${encodeURIComponent(brand.name)}`)}
								class="flex flex-col items-center gap-1 p-3 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
							>
								<span class="text-2xl">{brand.emoji}</span>
								<span class="text-xs font-medium text-gray-700 text-center">{brand.name}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Bottom Action Bar -->
	<div class="border-t border-gray-100 bg-white px-4 py-3">
		<button
			onclick={() => onNavigateTo('/browse')}
			class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base transition-colors"
		>
			{getLocale() === 'bg' ? '🔍 Разгледай всички' : '🔍 Browse All Items'}
		</button>
	</div>
</div>