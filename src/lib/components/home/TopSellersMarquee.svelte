<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import type { Profile } from '$lib/types/unified';
	import SellerQuickView from './SellerQuickView.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		sellers: Profile[];
	}

	let { sellers = [] }: Props = $props();

	let containerRef: HTMLDivElement;
	let animationRef: HTMLDivElement;
	let animationId: number;
	let startTime: number;
	let isPaused = $state(false);
	let selectedSeller = $state<Profile | null>(null);
	let showQuickView = $state(false);

	const speed = 30; // pixels per second
	const gap = 16; // gap between avatars
	let containerWidth = $state(0);
	let contentWidth = $state(0);
	let currentTranslation = $state(0);

	function updateSizes() {
		if (containerRef && animationRef) {
			containerWidth = containerRef.getBoundingClientRect().width;
			const avatarWidth = 48; // w-12 = 48px
			contentWidth = (avatarWidth + gap) * sellers.length;
		}
	}

	function animate() {
		if (isPaused || !contentWidth) {
			animationId = requestAnimationFrame(animate);
			return;
		}

		if (!startTime) startTime = performance.now();
		const elapsed = performance.now() - startTime;
		
		// Move from right to left
		const distance = (elapsed * speed) / 1000;
		currentTranslation = -(distance % contentWidth);

		animationId = requestAnimationFrame(animate);
	}

	function startAnimation() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		startTime = performance.now();
		animate();
	}

	function handleSellerClick(seller: Profile) {
		selectedSeller = seller;
		showQuickView = true;
	}

	function handleMouseEnter() {
		isPaused = true;
	}

	function handleMouseLeave() {
		isPaused = false;
	}

	onMount(() => {
		updateSizes();
		startAnimation();

		const resizeObserver = new ResizeObserver(updateSizes);
		if (containerRef) {
			resizeObserver.observe(containerRef);
		}

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			resizeObserver.disconnect();
		};
	});

	// Display sellers, duplicate if needed for seamless loop
	const displaySellers = sellers.length > 0 ? [...sellers, ...sellers] : [];
</script>

<!-- Top Sellers Marquee -->
{#if sellers.length > 0}
<div class="bg-gradient-to-r from-gray-50 to-blue-50 border-y border-gray-200 py-3">
	<div class="container px-4">
		<div class="flex items-center gap-3 mb-2">
			<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
				<span>⭐</span>
				<span>{m.home_top_sellers_title()}</span>
			</div>
			<ChevronRight class="h-4 w-4 text-gray-400" />
		</div>
		
		<div 
			bind:this={containerRef}
			class="overflow-hidden"
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
		>
			<div
				bind:this={animationRef}
				class="flex items-center"
				style:transform="translateX({currentTranslation}px)"
				style:gap="{gap}px"
				style:transition={isPaused ? 'transform 0.3s ease' : 'none'}
			>
				{#each displaySellers as seller, index (seller.id + '-' + index)}
					<button
						onclick={() => handleSellerClick(seller)}
						class="flex-shrink-0 group relative"
						aria-label="View {seller.username}'s profile"
					>
						<!-- Avatar with hover effect -->
						<div class="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-400 group-hover:shadow-md transition-all duration-200">
							{#if seller.avatar_url}
								<img
									src={seller.avatar_url}
									alt={seller.username}
									class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
								/>
							{:else}
								<div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
									{seller.username?.slice(0, 2).toUpperCase() || '??'}
								</div>
							{/if}
						</div>

						<!-- Username tooltip on hover -->
						<div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
							{seller.username}
							{#if seller.seller_rating}
								<span class="text-yellow-400">★{seller.seller_rating}</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Seller Quick View Dialog -->
{#if selectedSeller && showQuickView}
	<SellerQuickView
		seller={selectedSeller}
		isOpen={showQuickView}
		onClose={() => {
			showQuickView = false;
			selectedSeller = null;
		}}
	/>
{/if}
{/if}