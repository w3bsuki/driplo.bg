<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { getCategoryHierarchy } from './CategoryData.ts';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		hoveredCategory: string;
		onCategoryHover: (category: string) => void;
		onNavigateTo: (path: string) => void;
	}

	let { 
		hoveredCategory, 
		onCategoryHover,
		onNavigateTo 
	}: Props = $props();

	const categoryHierarchy = getCategoryHierarchy();
</script>

<!-- Desktop Layout -->
<div class="hidden md:flex">
	<!-- Left Column - Categories -->
	<div class="flex-1 max-h-[70vh] overflow-y-auto border-r border-gray-100">
		{#each categoryHierarchy as category}
			<button
				onclick={() => onNavigateTo(category.slug ? `/${category.slug}` : '/browse')}
				onmouseenter={() => onCategoryHover(category.slug)}
				onmouseleave={() => onCategoryHover('')}
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
				<span class="text-base">🔥</span> {getLocale() === 'bg' ? 'Популярни сега' : 'Trending Now'}
			</h3>
			<div class="space-y-2">
				<button
					onclick={() => onNavigateTo('/browse?filter=new-with-tags')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
				>
					<span class="text-lg">🏷️</span>
					<div class="text-left">
						<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Нови с етикети' : 'New with Tags'}</div>
						<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Чисто нови артикули' : 'Brand new items'}</div>
					</div>
				</button>
				
				<button
					onclick={() => onNavigateTo('/browse?filter=sale')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
				>
					<span class="text-lg">💸</span>
					<div class="text-left">
						<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Намаление' : 'On Sale'}</div>
						<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Намалени артикули' : 'Discounted items'}</div>
					</div>
				</button>
				
				<button
					onclick={() => onNavigateTo('/browse?sort=created_at&order=desc')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
				>
					<span class="text-lg">✨</span>
					<div class="text-left">
						<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Най-нови' : 'Latest Arrivals'}</div>
						<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Току-що добавени' : 'Just added'}</div>
					</div>
				</button>
			</div>
		</div>
		
		<!-- Popular Filters -->
		<div>
			<h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
				<span class="text-base">⭐</span> {getLocale() === 'bg' ? 'Популярни' : 'Popular'}
			</h3>
			<div class="space-y-2">
				<button
					onclick={() => onNavigateTo('/browse?sort=favorites_count&order=desc')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
				>
					<span class="text-lg">❤️</span>
					<div class="text-left">
						<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">{getLocale() === 'bg' ? 'Най-харесвани' : 'Most Liked'}</div>
						<div class="text-xs text-gray-500">{getLocale() === 'bg' ? 'Популярни артикули' : 'Popular items'}</div>
					</div>
				</button>
				
				<button
					onclick={() => onNavigateTo('/browse?filter=hot')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
				>
					<span class="text-lg">🔥</span>
					<div class="text-left">
						<div class="text-sm font-medium text-gray-900 group-hover:text-blue-500">Hot Items</div>
						<div class="text-xs text-gray-500">Trending fast</div>
					</div>
				</button>
				
				<button
					onclick={() => onNavigateTo('/browse?price=0-20')}
					class="w-full flex items-center gap-3 p-3 rounded-sm bg-white hover:bg-blue-50 transition-colors group"
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