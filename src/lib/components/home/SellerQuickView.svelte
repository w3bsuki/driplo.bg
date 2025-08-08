<script lang="ts">
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog/DialogContent.svelte';
	import DialogHeader from '$lib/components/ui/dialog/DialogHeader.svelte';
	import DialogTitle from '$lib/components/ui/dialog/DialogTitle.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Star, Package, MapPin, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { Profile } from '$lib/types/unified';
	
	interface Props {
		seller: Profile | null;
		open: boolean;
		onClose: () => void;
	}
	
	let { seller, open = false, onClose }: Props = $props();
	
	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	}
</script>

<Dialog bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
	<DialogContent class="max-w-md">
		{#if seller}
			<DialogHeader>
				<DialogTitle class="sr-only">Seller Profile</DialogTitle>
			</DialogHeader>
			
			<div class="flex flex-col items-center space-y-4">
				<!-- Avatar -->
				<div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-gray-100">
					{#if seller.avatar_url}
						<img 
							src={seller.avatar_url} 
							alt={seller.username}
							class="w-full h-full object-cover"
						/>
					{:else}
						<div class="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
							{seller.username?.slice(0, 2).toUpperCase() || '??'}
						</div>
					{/if}
				</div>
				
				<!-- Username -->
				<h2 class="text-xl font-semibold">{seller.username}</h2>
				
				<!-- Stats -->
				<div class="grid grid-cols-3 gap-4 w-full">
					<div class="text-center">
						<div class="flex items-center justify-center gap-1 text-yellow-500">
							<Star class="w-4 h-4 fill-current" />
							<span class="font-semibold">{seller.seller_rating?.toFixed(1) || '5.0'}</span>
						</div>
						<div class="text-xs text-gray-500">Rating</div>
					</div>
					<div class="text-center">
						<div class="flex items-center justify-center gap-1">
							<Package class="w-4 h-4 text-gray-600" />
							<span class="font-semibold">{seller.total_sales || 0}</span>
						</div>
						<div class="text-xs text-gray-500">Sales</div>
					</div>
					<div class="text-center">
						<div class="flex items-center justify-center gap-1">
							<Calendar class="w-4 h-4 text-gray-600" />
							<span class="font-semibold">
								{seller.created_at ? formatDate(seller.created_at) : 'New'}
							</span>
						</div>
						<div class="text-xs text-gray-500">Joined</div>
					</div>
				</div>
				
				<!-- Bio -->
				{#if seller.bio}
					<div class="w-full p-3 bg-gray-50 rounded-lg">
						<p class="text-sm text-gray-600">{seller.bio}</p>
					</div>
				{/if}
				
				<!-- Location -->
				{#if seller.location}
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<MapPin class="w-4 h-4" />
						<span>{seller.location}</span>
					</div>
				{/if}
				
				<!-- Recent Listings Preview -->
				<div class="w-full">
					<h3 class="text-sm font-semibold mb-2">Recent Listings</h3>
					<div class="grid grid-cols-3 gap-2">
						{#each Array(3) as _, i}
							<div class="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
						{/each}
					</div>
				</div>
				
				<!-- Actions -->
				<div class="flex gap-3 w-full">
					<Button 
						onclick={() => {
							onClose();
							goto(`/profile/${seller.username}`);
						}}
						class="flex-1"
						variant="default"
					>
						View Full Profile
					</Button>
					<Button 
						onclick={onClose}
						class="flex-1"
						variant="outline"
					>
						Close
					</Button>
				</div>
			</div>
		{/if}
	</DialogContent>
</Dialog>