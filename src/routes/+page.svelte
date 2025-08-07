<script lang="ts">
	import type { PageData } from './$types';
	import ListingGrid from '$lib/components/listings/ListingGrid.svelte';
	import ModularHeroSearch from '$lib/components/home/ModularHeroSearch.svelte';
	import RecentlySoldTicker from '$lib/components/home/RecentlySoldTicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	let { data }: { data: PageData } = $props();
</script>

<ModularHeroSearch categories={data.categories} topSellers={data.topSellers} />
<ListingGrid title={m.home_featured_title()} listings={data.featuredListings} />
<RecentlySoldTicker />
<ListingGrid title={m.home_most_viewed_title()} listings={data.popularListings} />
