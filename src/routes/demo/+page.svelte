<script lang="ts">
	import LandingCategories from '$lib/components/home/LandingCategories.svelte';
	import FilterSection from '$lib/components/home/FilterSection.svelte';
	import FilterSectionWithDropdown from '$lib/components/home/FilterSectionWithDropdown.svelte';
	import FilterSectionIconDropdown from '$lib/components/home/FilterSectionIconDropdown.svelte';
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	
	let currentView = $state('current');
	
	const views = [
		{ id: 'current', label: 'Current (Clean)', description: 'Removed text labels, clean circle categories' },
		{ id: 'dropdown', label: 'Vinted with Text', description: 'Categories dropdown with text next to search' },
		{ id: 'icon-dropdown', label: 'Vinted Icon Only', description: 'Icon-only dropdown, more space for search' }
	];
</script>

<svelte:head>
	<title>UI Design Comparison - Threadly</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- View Selector -->
	<div class="bg-muted/20 border-b">
		<div class="container px-4 py-4">
			<h1 class="text-2xl font-bold mb-4">UI/UX Design Comparison</h1>
			
			<div class="flex gap-2 flex-wrap">
				{#each views as view}
					<button
						onclick={() => currentView = view.id}
						class={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
							currentView === view.id
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-input bg-background hover:bg-muted'
						}`}
					>
						{view.label}
					</button>
				{/each}
			</div>
			
			<p class="text-sm text-muted-foreground mt-2">
				{views.find(v => v.id === currentView)?.description}
			</p>
		</div>
	</div>
	
	<!-- Content -->
	<div class="pb-20">
		{#if currentView === 'current'}
			<!-- Current Design: Categories + FilterSection (cleaned up) -->
			<LandingCategories />
			<FilterSection />
			<ListingGrid title="" />
			
		{:else if currentView === 'dropdown'}
			<!-- Vinted-style with text: FilterSectionWithDropdown -->
			<FilterSectionWithDropdown />
			<ListingGrid title="" />
			
		{:else if currentView === 'icon-dropdown'}
			<!-- Vinted-style icon only: FilterSectionIconDropdown -->
			<FilterSectionIconDropdown />
			<ListingGrid title="" />
		{/if}
	</div>
</div>

<!-- Demo Notes -->
<div class="fixed top-4 right-4 bg-background border border-border rounded-lg p-4 max-w-sm shadow-lg z-40 hidden md:block">
	<h3 class="font-semibold mb-2">Design Notes</h3>
	
	{#if currentView === 'current'}
		<ul class="text-sm space-y-1 text-muted-foreground">
			<li>✅ Categories are very discoverable</li>
			<li>✅ Fast clicking, no extra steps</li>
			<li>✅ Clean without text labels</li>
			<li>❓ Takes more vertical space</li>
			<li>❓ Still feels a bit "stacked"</li>
		</ul>
	{:else if currentView === 'dropdown'}
		<ul class="text-sm space-y-1 text-muted-foreground">
			<li>✅ Compact, Vinted-like design</li>
			<li>✅ Categories right next to search</li>
			<li>✅ Less vertical space used</li>
			<li>❓ Categories less discoverable</li>
			<li>❓ "Categories" text takes space</li>
		</ul>
	{:else if currentView === 'icon-dropdown'}
		<ul class="text-sm space-y-1 text-muted-foreground">
			<li>✅ Maximum space for search bar</li>
			<li>✅ Clean, minimal design</li>
			<li>✅ Icon is recognizable</li>
			<li>✅ Less cluttered feeling</li>
			<li>❓ Categories even less discoverable</li>
		</ul>
	{/if}
	
	<div class="mt-3 pt-3 border-t text-xs text-muted-foreground">
		💡 Consider using bottom nav for quick category access
	</div>
</div>