<script lang="ts">
	import { Star, MessageCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import Image from '$lib/components/ui/Image.svelte';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { goto } from '$app/navigation';

	type Variant = 'compact' | 'detailed' | 'tab';
	type ActionType = 'follow' | 'message' | 'viewProfile';

	let { 
		seller,
		isOwner = false,
		isFollowing = false,
		isFollowLoading = false,
		onFollow = () => {},
		variant = 'compact',
		actions = ['follow'],
		showJoinDate = false,
		showStats = true
	}: {
		seller: any;
		isOwner?: boolean;
		isFollowing?: boolean;
		isFollowLoading?: boolean;
		onFollow?: () => void;
		variant?: Variant;
		actions?: ActionType[];
		showJoinDate?: boolean;
		showStats?: boolean;
	} = $props();

	// Centralized avatar color logic (eliminates duplication)
	function getAvatarColor(username: string) {
		const colors = [
			'bg-blue-400', 'bg-blue-300', 'bg-blue-500', 
			'bg-cyan-400', 'bg-sky-400', 'bg-indigo-400'
		];
		return colors[username.charCodeAt(0) % colors.length];
	}

	// Computed avatar size based on variant
	const avatarSize = $derived(() => {
		switch (variant) {
			case 'compact': return { w: 'w-8', h: 'h-8', textSize: 'text-xs' };
			case 'detailed': return { w: 'w-12', h: 'h-12', textSize: 'text-sm' };
			case 'tab': return { w: 'w-12', h: 'h-12', textSize: 'text-sm' };
			default: return { w: 'w-8', h: 'h-8', textSize: 'text-xs' };
		}
	});

	// Container classes based on variant
	const containerClass = $derived(() => {
		switch (variant) {
			case 'compact': return 'border border-gray-200 rounded-sm p-3';
			case 'detailed': return 'space-y-3';
			case 'tab': return 'flex items-start gap-3';
			default: return 'border border-gray-200 rounded-sm p-3';
		}
	});

	const layoutClass = $derived(() => {
		switch (variant) {
			case 'compact': return 'flex items-center justify-between';
			case 'detailed': return 'flex items-start gap-3';
			case 'tab': return 'flex items-start gap-3';
			default: return 'flex items-center justify-between';
		}
	});
</script>

<div class={containerClass}>
	<div class={layoutClass}>
		<!-- Avatar and Info Section -->
		<a 
			href="/profile/{seller.username}" 
			class={cn("flex items-center gap-2 group", 
				variant === 'compact' ? 'flex-1' : '',
				variant === 'tab' ? 'flex-1 min-w-0' : ''
			)}
		>
			<!-- Avatar -->
			<div class="relative flex-shrink-0">
				{#if seller.avatar_url}
					<Image
						src={seller.avatar_url}
						alt={seller.username}
						class={cn(avatarSize.w, avatarSize.h, "rounded-full", 
							variant !== 'compact' ? "border-2 border-white shadow-sm" : ""
						)}
						objectFit="cover"
						preferredSize="thumb"
					/>
				{:else}
					<div class={cn(
						avatarSize.w, avatarSize.h, 
						"rounded-full flex items-center justify-center",
						variant !== 'compact' ? "border-2 border-white shadow-sm" : "",
						getAvatarColor(seller.username)
					)}>
						<span class={cn("text-white font-medium", avatarSize.textSize)}>
							{seller.username.charAt(0).toUpperCase()}
						</span>
					</div>
				{/if}
				
				<!-- Verification Badge -->
				{#if seller.seller_verified && variant !== 'compact'}
					<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
						<span class="text-white text-xs">✓</span>
					</div>
				{/if}
			</div>

			<!-- User Info -->
			<div class={variant === 'tab' ? 'flex-1 min-w-0' : ''}>
				<div class="flex items-center gap-1">
					<span class={cn(
						"font-medium group-hover:text-primary transition-colors duration-100",
						variant === 'compact' ? 'text-sm' : 'text-sm',
						variant === 'tab' ? 'truncate' : ''
					)}>
						{seller.username}
					</span>
					{#if seller.seller_verified}
						<BrandBadge 
							size={variant === 'compact' ? 'xs' : 'xs'} 
							isVerified={seller.seller_verified} 
							showText={false} 
						/>
					{/if}
				</div>

				<!-- Rating and Stats -->
				{#if showStats}
					<div class="flex items-center gap-2 mt-1">
						<div class="flex items-center gap-1">
							{#if variant === 'detailed' || variant === 'tab'}
								{#each Array(5) as _, i}
									<Star class={cn("w-3 h-3", 
										(seller.seller_rating || 4.8) > i ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
									)} />
								{/each}
							{:else}
								<Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
							{/if}
							<span class={cn(
								variant === 'compact' ? 'text-xs text-gray-500' : 'text-sm font-medium text-gray-900'
							)}>
								{seller.seller_rating || 4.8}
							</span>
							{#if variant !== 'compact'}
								<span class="text-xs text-gray-500">
									({seller.seller_rating_count || 42} reviews)
								</span>
							{/if}
						</div>
						
						{#if variant === 'compact'}
							<span class="text-xs text-gray-500">•</span>
						{/if}
						
						<div class={cn("flex items-center gap-2 text-xs text-gray-600",
							variant === 'compact' ? '' : 'flex-wrap'
						)}>
							{#if variant === 'compact'}
								<span>{seller.total_sales || 0} sales</span>
							{:else}
								<span class="flex items-center gap-1">
									<span>🏆</span>
									<span>{seller.total_sales || 0} sales</span>
								</span>
								{#if showJoinDate}
									<span>•</span>
									<span>Joined {new Date(seller.created_at || Date.now()).getFullYear()}</span>
								{/if}
							{/if}
						</div>
					</div>
				{/if}

				<!-- Action Buttons for detailed/tab variants -->
				{#if (variant === 'detailed' || variant === 'tab') && !isOwner}
					<div class="flex gap-2 mt-3">
						{#if actions.includes('viewProfile')}
							<a 
								href="/profile/{seller.username}" 
								class="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-sm text-center text-sm font-medium text-gray-700 transition-colors duration-100 min-w-0"
							>
								<span class="truncate">View Profile</span>
							</a>
						{/if}
						{#if actions.includes('message')}
							<button 
								class="p-2 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors duration-100 flex-shrink-0"
								onclick={() => goto(`/messages?user=${seller.username}`)}
								title="Message seller"
							>
								<MessageCircle class="w-4 h-4 text-gray-700" />
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</a>

		<!-- Follow Button (for compact variant) -->
		{#if variant === 'compact' && actions.includes('follow') && !isOwner}
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

		<!-- Follow Button (for detailed/tab variants) -->
		{#if (variant === 'detailed' || variant === 'tab') && actions.includes('follow') && !isOwner}
			<button
				onclick={onFollow}
				disabled={isFollowLoading}
				class={cn("px-4 py-2 rounded-sm text-sm font-medium transition-all",
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