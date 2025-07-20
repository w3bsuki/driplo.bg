<!-- Example Mobile-Optimized Implementation -->
<script lang="ts">
	// ... existing imports and props ...
	
	let isSticky = $state(false);
	let heroRef: HTMLElement;
	
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		const observer = new IntersectionObserver(
			([entry]) => {
				isSticky = !entry.isIntersecting;
			},
			{ threshold: 0, rootMargin: '-100px 0px 0px 0px' }
		);
		
		if (heroRef) observer.observe(heroRef);
		return () => observer.disconnect();
	});
</script>

<section bind:this={heroRef} class="hero-search-section">
	<!-- Desktop: Keep current integrated design -->
	<div class="hidden md:block">
		<!-- Current desktop implementation stays exactly the same -->
	</div>
	
	<!-- Mobile: Optimized stacked layout -->
	<div class="block md:hidden mobile-hero-container">
		<!-- Search Bar - Full Width -->
		<div class="search-bar-mobile">
			<input
				type="search"
				placeholder={m.browse_search_placeholder()}
				bind:value={searchQuery}
				class="search-input-mobile"
			/>
			<button onclick={handleSearch} class="search-button-mobile">
				<Search class="h-5 w-5" />
			</button>
		</div>
		
		<!-- Categories & Quick Filters Row -->
		<div class="categories-row-mobile">
			<!-- Your beloved categories button -->
			<button
				onclick={toggleCategoryDropdown}
				class="categories-button-original"
			>
				<span>{m.header_categories()}</span>
				<ChevronDown class="h-4 w-4" />
			</button>
			
			<!-- Quick filters -->
			{#each quickFilters as filter}
				<button
					onclick={() => handleQuickFilter(filter.action)}
					class="quick-filter-pill"
				>
					<span>{filter.icon}</span>
					<span>{filter.name}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<!-- Sticky Mobile Search -->
{#if isSticky}
	<div class="sticky-search-mobile">
		<!-- Compact categories icon + expanded search -->
	</div>
{/if}

<style>
	/* Mobile-first responsive approach */
	.mobile-hero-container {
		@apply space-y-3;
	}
	
	.search-bar-mobile {
		@apply bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center px-4;
		/* Now uses 100% width instead of competing for space */
	}
	
	.search-input-mobile {
		@apply flex-1 py-4 text-base placeholder:text-gray-400 focus:outline-none;
		/* Much more room for typing! */
	}
	
	.categories-row-mobile {
		@apply flex items-center gap-2 overflow-x-auto;
		/* Categories still prominent but not cramping search */
	}
	
	.categories-button-original {
		/* Preserves your exact gradient design */
		@apply flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm;
		@apply bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200;
	}
	
	.sticky-search-mobile {
		@apply fixed top-0 left-0 right-0 z-50 bg-white shadow-md;
		animation: slideDown 300ms ease-out;
	}
</style>