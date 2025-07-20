<script lang="ts">
	import { cn } from '$lib/utils';

	let selectedCategory = $state('');

	const mainCategories = [
		{
			name: 'All',
			value: '',
			image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
			count: '5.2M items'
		},
		{
			name: 'Women',
			value: 'women',
			image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
			count: '2.3M items'
		},
		{
			name: 'Men',
			value: 'men',
			image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=400&fit=crop',
			count: '1.8M items'
		},
		{
			name: 'Kids',
			value: 'kids',
			image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=400&fit=crop',
			count: '982K items'
		},
		{
			name: 'Designer',
			value: 'designer',
			image: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=400&h=400&fit=crop',
			count: '156K items'
		},
		{
			name: 'Shoes',
			value: 'shoes',
			image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
			count: '743K items'
		},
		{
			name: 'Bags',
			value: 'bags',
			image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop',
			count: '421K items'
		}
	];

	const subcategories = [
		{ name: 'T-shirts', value: 'tshirts', emoji: '👕' },
		{ name: 'Shirts', value: 'shirts', emoji: '👔' },
		{ name: 'Jeans', value: 'jeans', emoji: '👖' },
		{ name: 'Dresses', value: 'dresses', emoji: '👗' },
		{ name: 'Trainers', value: 'trainers', emoji: '👟' },
		{ name: 'Boots', value: 'boots', emoji: '🥾' },
		{ name: 'Jackets', value: 'jackets', emoji: '🧥' },
		{ name: 'Hoodies', value: 'hoodies', emoji: '👕' },
		{ name: 'Handbags', value: 'handbags', emoji: '👜' },
		{ name: 'Watches', value: 'watches', emoji: '⌚' }
	];

	function selectCategory(category: string) {
		selectedCategory = category;
		const params = new URLSearchParams();
		if (category) {
			params.set('category', category);
		}
		window.location.href = `/browse${params.toString() ? '?' + params.toString() : ''}`;
	}
</script>

<section class="py-8 bg-muted/20 border-b">
	<div class="container px-4">

		<!-- Main Categories with Circle Images -->
		<div class="mb-8">
			<div class="flex items-center space-x-8 overflow-x-auto pb-3 scrollbar-hide px-2">
				{#each mainCategories as category}
					<button
						onclick={() => selectCategory(category.value)}
						class={cn(
							"group flex-shrink-0 text-center transition-all duration-200",
							selectedCategory === category.value && "scale-105"
						)}
					>
						<div class={cn(
							"w-18 h-18 mx-auto mb-3 overflow-hidden rounded-full transition-all duration-200 shadow-sm",
							selectedCategory === category.value 
								? "ring-2 ring-primary ring-offset-2 shadow-lg" 
								: "hover:scale-105 hover:shadow-md"
						)}>
							<img
								src={category.image}
								alt={category.name}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
						<div class="min-w-[64px]">
							<h3 class={cn(
								"text-sm font-medium transition-colors",
								selectedCategory === category.value ? "text-primary" : "text-foreground"
							)}>{category.name}</h3>
							<p class="text-xs text-muted-foreground mt-0.5">{category.count}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Separator -->
		<div class="border-t border-border/50 mb-6"></div>

		<!-- Subcategories - Horizontal Scroll -->
		<div>
			<div class="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-hide px-1">
				{#each subcategories as subcategory}
					<button
						onclick={() => selectCategory(subcategory.value)}
						class="whitespace-nowrap rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 flex-shrink-0 bg-background border border-input hover:bg-muted hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground min-h-[44px] flex items-center gap-2.5 shadow-sm hover:shadow-md"
					>
						<span class="text-base">{subcategory.emoji}</span>
						{subcategory.name}
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Hide scrollbar for clean mobile experience */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>