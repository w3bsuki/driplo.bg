<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, scale as scaleTransition } from 'svelte/transition';
	import NavigationButton from '$lib/components/gallery/NavigationButton.svelte';

	interface Props {
		images: string[];
		currentImageIndex: number;
		title: string;
		hasMultipleImages: boolean;
		imageLoading: Set<number>;
		isTransitioning: boolean;
		scale: number;
		translateX: number;
		translateY: number;
		isZooming: boolean;
		onClose: () => void;
		onPrevImage: () => void;
		onNextImage: () => void;
		onResetZoom: () => void;
		onImageLoad: (index: number) => void;
		onImageError: (index: number) => void;
		onSetCurrentImage: (index: number) => void;
		onFullscreenTouchStart: (e: TouchEvent) => void;
		onFullscreenTouchMove: (e: TouchEvent) => void;
		onFullscreenTouchEnd: (e: TouchEvent) => void;
	}

	let { 
		images,
		currentImageIndex,
		title,
		hasMultipleImages,
		imageLoading,
		isTransitioning,
		scale,
		translateX,
		translateY,
		isZooming,
		onClose,
		onPrevImage,
		onNextImage,
		onResetZoom,
		onImageLoad,
		onImageError,
		onSetCurrentImage,
		onFullscreenTouchStart,
		onFullscreenTouchMove,
		onFullscreenTouchEnd
	}: Props = $props();

	let hasImages = $derived(images.length > 0);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
	class="fixed inset-0 z-[100] bg-black flex items-center justify-center"
	transition:fade={{ duration: 200 }}
	onclick={onClose}
	role="dialog"
	aria-modal="true"
>
	<div 
		class="relative w-full h-full flex items-center justify-center touch-none"
		ontouchstart={onFullscreenTouchStart}
		ontouchmove={onFullscreenTouchMove}
		ontouchend={onFullscreenTouchEnd}
	>
		<!-- Close button -->
		<button
			onclick={onClose}
			class="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 touch-auto"
			aria-label="Close gallery"
		>
			<X class="w-6 h-6" />
		</button>
		
		<!-- Image counter -->
		{#if hasMultipleImages}
			<div class="absolute top-4 left-4 bg-white/10 text-white px-3 py-2 rounded-sm text-sm font-medium z-20">
				{currentImageIndex + 1} / {images.length}
			</div>
		{/if}

		<!-- Image container with zoom support -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class="relative max-w-full max-h-full flex items-center justify-center" 
			onclick={(e) => e.stopPropagation()}
			style="transform: scale({scale}) translate({translateX}px, {translateY}px); transition: {isZooming ? 'none' : 'transform 0.3s ease-out'}"
			role="img"
			aria-label="Zoomed image"
		>
			{#if hasImages && images[currentImageIndex]}
				<!-- Skeleton for fullscreen -->
				{#if imageLoading.has(currentImageIndex)}
					<div class="w-96 h-96 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded-sm flex items-center justify-center">
						<div class="text-white/60 text-sm">Loading...</div>
					</div>
				{/if}
				
				<img
					src={images[currentImageIndex]}
					alt={title}
					class="max-w-full max-h-[90vh] transition-opacity duration-300 {imageLoading.has(currentImageIndex) ? 'opacity-0' : 'opacity-100'}"
					style="object-fit: contain; user-select: none; pointer-events: none;"
					loading="eager"
					onload={() => onImageLoad(currentImageIndex)}
					onerror={() => onImageError(currentImageIndex)}
					draggable="false"
				/>
			{:else}
				<div class="w-full h-full flex items-center justify-center">
					<span class="text-white text-sm">No image available</span>
				</div>
			{/if}
		</div>
		
		<!-- Zoom indicator -->
		{#if scale > 1}
			<div class="absolute top-16 left-4 bg-white/10 text-white px-2 py-1 rounded-sm text-xs z-20" transition:fade>
				{Math.round(scale * 100)}%
			</div>
		{/if}
		
		<!-- Reset zoom button -->
		{#if scale > 1}
			<button
				onclick={onResetZoom}
				class="absolute top-20 right-4 p-2 rounded-sm bg-white/10 text-white hover:bg-white/20 transition-colors text-xs z-20 touch-auto"
				transition:scaleTransition={{ duration: 200 }}
			>
				Reset
			</button>
		{/if}

		{#if hasMultipleImages && scale <= 1}
			<!-- Navigation buttons (hide when zoomed) -->
			<NavigationButton 
				direction="prev" 
				onClick={onPrevImage}
				variant="fullscreen"
			/>
			<NavigationButton 
				direction="next" 
				onClick={onNextImage}
				variant="fullscreen"
			/>
		{/if}
		
		<!-- Mobile swipe hint -->
		{#if hasMultipleImages && scale <= 1}
			<div class="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center pointer-events-none">
				Swipe left or right to navigate
			</div>
		{/if}

		<!-- Dot indicators for fullscreen -->
		{#if hasMultipleImages}
			<div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
				{#each images as _, index (index)}
					<button
						onclick={() => !isTransitioning && onSetCurrentImage(index)}
						class="w-2.5 h-2.5 rounded-full transition-all duration-300 touch-auto {index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}"
						disabled={isTransitioning}
						aria-label="Go to image {index + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.touch-none {
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
	}
	
	.touch-auto {
		touch-action: auto;
	}
</style>