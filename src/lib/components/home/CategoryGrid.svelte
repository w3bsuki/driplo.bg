<script lang="ts">
	interface Category {
		name: string;
		slug: string;
		icon?: string;
		product_count?: Array<{ count: number }>;
	}

	interface Props {
		categories: Category[];
	}

	let { categories = [] }: Props = $props();

	// Process categories with image placeholders and counts
	const processedCategories = $derived(categories.map(category => {
		// Category-specific images
		const images = {
			'women': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
			'men': 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=500&fit=crop',
			'kids': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop',
			'designer': 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=400&h=500&fit=crop',
			'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
			'accessories': 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=500&fit=crop',
			'bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
			'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop',
			'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop'
		};

		const count = category.product_count?.[0]?.count || 0;
		const displayCount = count > 1000 
			? `${(count / 1000).toFixed(1)}K items`
			: `${count} items`;

		return {
			name: category.name,
			href: `/${category.slug}`,
			image: images[category.slug as keyof typeof images] || images.accessories,
			count: displayCount
		};
	}));
</script>

<section class="py-3">
	<div class="container px-2">
		<h2 class="text-base font-semibold mb-3">Browse by style</h2>
		
		<!-- Desktop: Horizontal scrollable categories -->
		<div class="hidden md:block">
			<div class="flex items-center space-x-2 overflow-x-auto pb-2">
				{#each processedCategories as category}
					<a 
						href={category.href}
						class="group flex-shrink-0 text-center"
					>
						<div class="w-10 h-10 mx-auto mb-1 overflow-hidden rounded-sm bg-muted">
							<img
								src={category.image}
								alt={category.name}
								class="h-full w-full object-cover transition-transform duration-100 group-hover:scale-110"
								loading="lazy"
							/>
						</div>
						<h3 class="text-xs font-medium">{category.name}</h3>
					</a>
				{/each}
			</div>
		</div>

		<!-- Mobile: Horizontal scroll (like main categories) -->
		<div class="md:hidden">
			<div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
				{#each processedCategories as category}
					<a 
						href={category.href}
						class="group flex-shrink-0 text-center"
					>
						<div class="w-10 h-10 mx-auto mb-1 overflow-hidden rounded-sm bg-muted">
							<img
								src={category.image}
								alt={category.name}
								class="h-full w-full object-cover transition-transform duration-100 group-hover:scale-110"
								loading="lazy"
							/>
						</div>
						<h3 class="text-xs font-medium whitespace-nowrap">{category.name}</h3>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>