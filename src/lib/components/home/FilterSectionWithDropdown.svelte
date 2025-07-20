<script lang="ts">
	import { X, Search } from 'lucide-svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';

	let searchQuery = $state('');
	let selectedPriceRange = $state('');
	let selectedSize = $state('');
	let selectedBrand = $state('');
	let selectedCondition = $state('');

	const priceRanges = [
		{ name: 'Under £20', value: '0-20' },
		{ name: '£20-50', value: '20-50' },
		{ name: '£50-100', value: '50-100' },
		{ name: '£100+', value: '100-999' }
	];

	const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16'];
	
	const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'ASOS', 'Gucci', 'Prada'];
	
	const conditions = ['New with tags', 'Very good', 'Good', 'Fair'];

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery.trim()) {
			params.set('q', searchQuery.trim());
		}
		if (selectedPriceRange) params.set('price', selectedPriceRange);
		if (selectedSize) params.set('size', selectedSize);
		if (selectedBrand) params.set('brand', selectedBrand);
		if (selectedCondition) params.set('condition', selectedCondition);
		
		const queryString = params.toString();
		window.location.href = `/browse${queryString ? '?' + queryString : ''}`;
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchQuery.trim()) params.set('q', searchQuery.trim());
		if (selectedPriceRange) params.set('price', selectedPriceRange);
		if (selectedSize) params.set('size', selectedSize);
		if (selectedBrand) params.set('brand', selectedBrand);
		if (selectedCondition) params.set('condition', selectedCondition);
		
		const queryString = params.toString();
		window.location.href = `/browse${queryString ? '?' + queryString : ''}`;
	}

	function clearFilters() {
		searchQuery = '';
		selectedPriceRange = '';
		selectedSize = '';
		selectedBrand = '';
		selectedCondition = '';
	}

	function clearFilter(filterType: string) {
		switch(filterType) {
			case 'search': searchQuery = ''; break;
			case 'price': selectedPriceRange = ''; break;
			case 'size': selectedSize = ''; break;
			case 'brand': selectedBrand = ''; break;
			case 'condition': selectedCondition = ''; break;
		}
	}

	const hasActiveFilters = $derived(searchQuery || selectedPriceRange || selectedSize || selectedBrand || selectedCondition);
</script>

<section class="py-4 border-b bg-background">
	<div class="container px-4">
		<!-- Search Bar with Categories Dropdown -->
		<div class="max-w-4xl mx-auto mb-4">
			<div class="flex gap-3">
				<!-- Categories Dropdown -->
				<div class="flex-shrink-0">
					<CategoryDropdown />
				</div>
				
				<!-- Search Input -->
				<div class="relative flex-1">
					<Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						placeholder="Search for items, brands, or users..."
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full rounded-lg border border-input bg-background pl-12 pr-4 py-2.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm"
					/>
				</div>
			</div>
		</div>

		{#if hasActiveFilters}
			<div class="flex justify-end mb-3">
				<button
					onclick={clearFilters}
					class="text-sm text-muted-foreground hover:text-foreground"
				>
					Clear all
				</button>
			</div>
		{/if}

		<!-- Mobile Filters -->
		<div class="flex gap-1.5 overflow-x-auto pb-1 md:hidden scrollbar-hide">
			<!-- Price -->
			<select
				bind:value={selectedPriceRange}
				onchange={applyFilters}
				class="rounded-full border border-input bg-background px-2.5 py-1.5 text-xs flex-shrink-0 min-w-[75px]"
			>
				<option value="">Price</option>
				{#each priceRanges as range}
					<option value={range.value}>{range.name}</option>
				{/each}
			</select>
			
			<!-- Size -->
			<select
				bind:value={selectedSize}
				onchange={applyFilters}
				class="rounded-full border border-input bg-background px-2.5 py-1.5 text-xs flex-shrink-0 min-w-[60px]"
			>
				<option value="">Size</option>
				{#each sizes as size}
					<option value={size}>{size}</option>
				{/each}
			</select>
			
			<!-- Brand -->
			<select
				bind:value={selectedBrand}
				onchange={applyFilters}
				class="rounded-full border border-input bg-background px-2.5 py-1.5 text-xs flex-shrink-0 min-w-[70px]"
			>
				<option value="">Brand</option>
				{#each brands as brand}
					<option value={brand}>{brand}</option>
				{/each}
			</select>
			
			<!-- Condition -->
			<select
				bind:value={selectedCondition}
				onchange={applyFilters}
				class="rounded-full border border-input bg-background px-2.5 py-1.5 text-xs flex-shrink-0 min-w-[80px]"
			>
				<option value="">Condition</option>
				{#each conditions as condition}
					<option value={condition}>{condition}</option>
				{/each}
			</select>
		</div>

		<!-- Desktop Filters -->
		<div class="hidden md:flex items-center gap-3">
			<!-- Price -->
			<select
				bind:value={selectedPriceRange}
				onchange={applyFilters}
				class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
			>
				<option value="">Price</option>
				{#each priceRanges as range}
					<option value={range.value}>{range.name}</option>
				{/each}
			</select>
			
			<!-- Size -->
			<select
				bind:value={selectedSize}
				onchange={applyFilters}
				class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
			>
				<option value="">Size</option>
				{#each sizes as size}
					<option value={size}>{size}</option>
				{/each}
			</select>
			
			<!-- Brand -->
			<select
				bind:value={selectedBrand}
				onchange={applyFilters}
				class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
			>
				<option value="">Brand</option>
				{#each brands as brand}
					<option value={brand}>{brand}</option>
				{/each}
			</select>
			
			<!-- Condition -->
			<select
				bind:value={selectedCondition}
				onchange={applyFilters}
				class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
			>
				<option value="">Condition</option>
				{#each conditions as condition}
					<option value={condition}>{condition}</option>
				{/each}
			</select>
		</div>

		<!-- Active Filter Pills -->
		{#if hasActiveFilters}
			<div class="flex flex-wrap gap-2 mt-3">
				{#if searchQuery}
					<div class="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
						<span>"{searchQuery}"</span>
						<button onclick={() => clearFilter('search')}>
							<X class="h-3 w-3" />
						</button>
					</div>
				{/if}
				{#if selectedPriceRange}
					<div class="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
						<span>{priceRanges.find(r => r.value === selectedPriceRange)?.name}</span>
						<button onclick={() => clearFilter('price')}>
							<X class="h-3 w-3" />
						</button>
					</div>
				{/if}
				{#if selectedSize}
					<div class="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
						<span>Size {selectedSize}</span>
						<button onclick={() => clearFilter('size')}>
							<X class="h-3 w-3" />
						</button>
					</div>
				{/if}
				{#if selectedBrand}
					<div class="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
						<span>{selectedBrand}</span>
						<button onclick={() => clearFilter('brand')}>
							<X class="h-3 w-3" />
						</button>
					</div>
				{/if}
				{#if selectedCondition}
					<div class="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
						<span>{selectedCondition}</span>
						<button onclick={() => clearFilter('condition')}>
							<X class="h-3 w-3" />
						</button>
					</div>
				{/if}
			</div>
		{/if}
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