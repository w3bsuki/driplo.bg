<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Category } from '$lib/types';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		categories?: Category[];
		activeCategory?: string;
		onCategorySelect?: (category: string) => void;
		class?: string;
	}

	let {
		categories = [],
		activeCategory = '',
		onCategorySelect,
		class: className = ''
	}: Props = $props();

	// Main categories with emojis and translations
	const mainCategories = [
		{ slug: '', name: 'All', emoji: '🛍️' },
		{ slug: 'women', name: m.category_women(), emoji: '👗' },
		{ slug: 'men', name: m.category_men(), emoji: '👔' },
		{ slug: 'kids', name: m.category_kids(), emoji: '🧸' },
		{ slug: 'pets', name: m.category_pets(), emoji: '🐾' }
	];

	// Popular subcategories with translations
	const popularSubcategories = [
		{ slug: 'shoes', name: m.women_shoes(), emoji: '👟' },
		{ slug: 'bags', name: m.women_bags_accessories().split(' ')[0], emoji: '👜' },
		{ slug: 'jackets', name: m.women_jackets_coats().split(' ')[0], emoji: '🧥' },
		{ slug: 'dresses', name: m.subcategory_dresses(), emoji: '👗' },
		{ slug: 'shirts', name: m.men_shirts(), emoji: '👕' },
		{ slug: 'pants', name: m.men_pants_jeans().split(' ')[0], emoji: '👖' },
		{ slug: 'accessories', name: m.men_accessories(), emoji: '💍' },
		{ slug: 'watches', name: 'Watches', emoji: '⌚' }
	];

	function handleCategoryClick(slug: string) {
		if (onCategorySelect) {
			onCategorySelect(slug);
		} else {
			if (slug === '') {
				goto('/browse');
			} else {
				goto(`/${slug}`);
			}
		}
	}

	function handleSubcategoryClick(slug: string) {
		// Navigate to browse with filter
		goto(`/browse?subcategory=${slug}`);
	}
</script>

<div class={cn("w-full", className)}>
	<!-- Main Categories Row -->
	<div class="overflow-x-auto scrollbar-hide pb-2">
		<div class="flex gap-2 min-w-max px-1">
			{#each mainCategories as category}
				<button
					onclick={() => handleCategoryClick(category.slug)}
					class={cn(
						"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
						activeCategory === category.slug
							? "bg-blue-500 text-white shadow-sm"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					)}
				>
					<span class="text-sm">{category.emoji}</span>
					<span>{category.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Popular Subcategories Row -->
	<div class="overflow-x-auto scrollbar-hide pt-2 border-t border-gray-100">
		<div class="flex gap-2 min-w-max px-1">
			<span class="text-xs text-gray-500 py-1.5 px-2">Popular:</span>
			{#each popularSubcategories as subcategory}
				<button
					onclick={() => handleSubcategoryClick(subcategory.slug)}
					class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all whitespace-nowrap"
				>
					<span class="text-xs">{subcategory.emoji}</span>
					<span>{subcategory.name}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>