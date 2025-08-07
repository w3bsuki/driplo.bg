<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { X, Star, Package, MapPin, ExternalLink, UserPlus } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	
	interface Seller {
		id: string;
		username: string;
		avatar_url?: string;
		total_sales?: number;
		seller_rating?: number;
		bio?: string;
		location?: string;
		follower_count?: number;
	}
	
	interface Props {
		seller: Seller | null;
		isOpen: boolean;
		onClose: () => void;
	}
	
	let { seller, isOpen, onClose }: Props = $props();
	
	function handleViewProfile() {
		if (seller) {
			goto(`/profile/${seller.username}`);
			onClose();
		}
	}
	
	function handleFollow() {
		// TODO: Implement follow functionality
		console.log('Follow seller:', seller?.username);
	}
	
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen && seller}
	<div 
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Close button -->
			<button
				onclick={onClose}
				class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
				aria-label="Close"
			>
				<X class="h-5 w-5 text-gray-400" />
			</button>
			
			<!-- Seller info -->
			<div class="flex flex-col items-center text-center">
				<!-- Avatar -->
				<img
					src={seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.username)}&background=random`}
					alt={seller.username}
					class="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg mb-3"
				/>
				
				<!-- Username -->
				<h3 class="text-lg font-semibold text-gray-900 mb-1">
					@{seller.username}
				</h3>
				
				<!-- Bio -->
				{#if seller.bio}
					<p class="text-sm text-gray-600 mb-3 line-clamp-2">
						{seller.bio}
					</p>
				{/if}
				
				<!-- Stats -->
				<div class="flex items-center gap-4 mb-4">
					{#if seller.seller_rating && seller.seller_rating > 0}
						<div class="flex items-center gap-1">
							<Star class="h-4 w-4 text-yellow-500 fill-current" />
							<span class="text-sm font-medium text-gray-700">
								{seller.seller_rating.toFixed(1)}
							</span>
						</div>
					{/if}
					
					{#if seller.total_sales !== undefined}
						<div class="flex items-center gap-1">
							<Package class="h-4 w-4 text-gray-400" />
							<span class="text-sm font-medium text-gray-700">
								{seller.total_sales} sales
							</span>
						</div>
					{/if}
					
					{#if seller.location}
						<div class="flex items-center gap-1">
							<MapPin class="h-4 w-4 text-gray-400" />
							<span class="text-sm font-medium text-gray-700">
								{seller.location}
							</span>
						</div>
					{/if}
				</div>
				
				{#if seller.follower_count !== undefined && seller.follower_count > 0}
					<p class="text-xs text-gray-500 mb-4">
						{seller.follower_count} followers
					</p>
				{/if}
				
				<!-- Action buttons -->
				<div class="flex gap-2 w-full">
					<button
						onclick={handleViewProfile}
						class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
					>
						<ExternalLink class="h-4 w-4" />
						View Profile
					</button>
					<button
						onclick={handleFollow}
						class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
					>
						<UserPlus class="h-4 w-4" />
						Follow
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}