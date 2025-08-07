<script lang="ts">
	import { CheckCircle, Clock } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import { getListingContext } from '$lib/contexts/listing.svelte';

	let { 
		class: className = '',
		compact = false 
	} = $props();

	const context = getListingContext();
	const { listing } = context;

	const seller = $derived(listing?.seller);
	
	// Mock data for now - replace with actual seller data from database
	const isVerified = $derived(seller?.is_verified || false);
	const rating = $derived(seller?.rating || 4.8);
	const responseTime = $derived(seller?.response_time || '1 hour');
	const avatarUrl = $derived(seller?.avatar_url || null);
	const displayName = $derived(seller?.display_name || seller?.username || 'Anonymous');
	const initials = $derived(displayName.slice(0, 2).toUpperCase());

	const formattedRating = $derived(rating.toFixed(1));
	const hasRating = $derived(rating > 0);
</script>

<div class={cn('flex items-center gap-2', className)}>
	<!-- Seller Avatar -->
	<div class="relative">
		{#if avatarUrl}
			<img 
				src={avatarUrl} 
				alt={displayName}
				class="h-8 w-8 rounded-full object-cover border border-gray-200"
			/>
		{:else}
			<div class="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
				{initials}
			</div>
		{/if}
		
		<!-- Verification Badge -->
		{#if isVerified}
			<div class="absolute -top-1 -right-1 bg-white rounded-full">
				<CheckCircle class="h-3.5 w-3.5 text-green-500" />
			</div>
		{/if}
	</div>

	<!-- Seller Info -->
	{#if !compact}
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-1.5">
				<span class="text-sm font-medium text-foreground truncate">
					{displayName}
				</span>
				{#if isVerified}
					<span class="text-xs text-green-600 font-medium">
						{m.seller_verified()}
					</span>
				{/if}
			</div>
			
			<div class="flex items-center gap-3 text-xs text-muted-foreground">
				<!-- Rating -->
				{#if hasRating}
					<span class="text-yellow-600">
						{m.seller_rating({ rating: formattedRating })}
					</span>
				{/if}
				
				<!-- Response Time -->
				<div class="flex items-center gap-1">
					<Clock class="h-3 w-3" />
					<span>{m.seller_responds_in({ time: responseTime })}</span>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex items-center gap-1">
			{#if isVerified}
				<CheckCircle class="h-3.5 w-3.5 text-green-500" />
			{/if}
			{#if hasRating}
				<span class="text-xs text-yellow-600 font-medium">
					{formattedRating}★
				</span>
			{/if}
		</div>
	{/if}
</div>