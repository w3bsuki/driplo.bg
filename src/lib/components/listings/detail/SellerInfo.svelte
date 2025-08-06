<script lang="ts">
	import { Star, MessageCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import Image from '$lib/components/ui/Image.svelte';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { goto } from '$app/navigation';

	let { 
		seller,
		isOwner = false,
		isFollowing = false,
		isFollowLoading = false,
		onFollow = () => {}
	} = $props();

	function getAvatarColor(username) {
		const colors = [
			'bg-blue-400', 'bg-blue-300', 'bg-blue-500', 
			'bg-cyan-400', 'bg-sky-400', 'bg-indigo-400'
		];
		return colors[username.charCodeAt(0) % colors.length];
	}
</script>

<!-- Compact Seller Card -->
<div class="border border-gray-200 rounded-sm p-3">
	<div class="flex items-center justify-between">
		<a href="/profile/{seller.username}" class="flex items-center gap-2 group flex-1">
			{#if seller.avatar_url}
				<Image
					src={seller.avatar_url}
					alt={seller.username}
					class="w-8 h-8 rounded-full"
					objectFit="cover"
					preferredSize="thumb"
				/>
			{:else}
				<div class={cn("w-8 h-8 rounded-full flex items-center justify-center", getAvatarColor(seller.username))}>
					<span class="text-white text-xs font-medium">{seller.username.charAt(0).toUpperCase()}</span>
				</div>
			{/if}
			<div>
				<div class="flex items-center gap-1">
					<span class="text-sm font-medium group-hover:text-primary transition-colors duration-100">
						{seller.username}
					</span>
					{#if seller.seller_verified}
						<BrandBadge size="xs" isVerified={seller.seller_verified} showText={false} />
					{/if}
				</div>
				<div class="flex items-center gap-1 text-xs text-gray-500">
					<Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
					<span>{seller.seller_rating || 4.8}</span>
					<span>•</span>
					<span>{seller.total_sales || 0} sales</span>
				</div>
			</div>
		</a>
		{#if !isOwner}
			<button
				onclick={onFollow}
				disabled={isFollowLoading}
				class={cn("px-3 py-1.5 rounded-sm text-xs font-medium transition-all",
					isFollowing 
						? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
						: "bg-primary text-white hover:bg-primary/90",
					isFollowLoading && "opacity-50 cursor-not-allowed"
				)}
			>
				{#if isFollowLoading}
					<Spinner size="sm" color={isFollowing ? "current" : "white"} />
				{:else}
					{isFollowing ? "Following" : "Follow"}
				{/if}
			</button>
		{/if}
	</div>
</div>

