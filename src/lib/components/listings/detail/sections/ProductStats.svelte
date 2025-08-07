<script lang="ts">
	import { Eye, Heart, Clock } from 'lucide-svelte';
	import { formatRelativeTime } from '$lib/utils/date';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte';

	const context = getListingContext();
	const { listing } = context;

	// Mock data for now - replace with actual stats from database
	const viewCount = $derived(listing?.view_count || 234);
	const likeCount = $derived(listing?.likes_count || 12);
	const todayViewCount = $derived(listing?.today_view_count || 8);
	const createdAt = $derived(listing?.created_at ? new Date(listing.created_at) : new Date());

	const formattedTime = $derived(formatRelativeTime(createdAt));
	const showTodayViews = $derived(todayViewCount > 0);
</script>

<div class="bg-gray-50 border border-gray-200 rounded-sm p-3">
	<div class="flex items-center justify-between gap-3 text-sm text-muted-foreground">
		<!-- View Count -->
		<div class="flex items-center gap-1.5">
			<Eye class="h-4 w-4" />
			<span>{m.stats_views_count({ count: viewCount.toString() })}</span>
		</div>
		
		<!-- Like Count -->
		<div class="flex items-center gap-1.5">
			<Heart class="h-4 w-4" />
			<span>{m.stats_likes_count({ count: likeCount.toString() })}</span>
		</div>
		
		<!-- Time Posted -->
		<div class="flex items-center gap-1.5">
			<Clock class="h-4 w-4" />
			<span class="whitespace-nowrap">{m.stats_listed_time_ago({ time: formattedTime })}</span>
		</div>
	</div>
	
	<!-- Today's Viewers - Only show if there are any -->
	{#if showTodayViews}
		<div class="mt-2 pt-2 border-t border-gray-200">
			<div class="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
				<Eye class="h-3.5 w-3.5" />
				<span>{m.stats_people_viewed_today({ count: todayViewCount.toString() })}</span>
			</div>
		</div>
	{/if}
</div>