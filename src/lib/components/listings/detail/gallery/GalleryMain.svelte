<script lang="ts">
	import { Maximize2 } from 'lucide-svelte';
	import NavigationButton from '$lib/components/gallery/NavigationButton.svelte';

	interface Props {
		images: string[];
		currentImageIndex: number;
		title: string;
		status: string;
		hasMultipleImages: boolean;
		imageLoading: Set<number>;
		isTransitioning: boolean;
		isTouching: boolean;
		touchEndX: number;
		touchStartX: number;
		onOpenFullscreen: (index?: number) => void;
		onPrevImage: () => void;
		onNextImage: () => void;
		onImageLoad: (index: number) => void;
		onImageError: (index: number) => void;
		onTouchStart: (e: TouchEvent) => void;
		onTouchMove: (e: TouchEvent) => void;
		onTouchEnd: (e: TouchEvent) => void;
	}

	let { 
		images,
		currentImageIndex,
		title,
		status,
		hasMultipleImages,
		imageLoading,
		isTransitioning,
		isTouching,
		touchEndX,
		touchStartX,
		onOpenFullscreen,
		onPrevImage,
		onNextImage,
		onImageLoad,
		onImageError,
		onTouchStart,
		onTouchMove,
		onTouchEnd
	}: Props = $props();

	let hasImages = $derived(images.length > 0);
</script>

<div class="relative bg-white rounded-sm border border-gray-200/60 p-4 sm:p-2">
	<div 
		class="relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-sm bg-gray-50 w-full max-w-lg mx-auto touch-pan-y"
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
	>
		<!-- Image Container with smooth transitions -->
		<div 
			class="relative w-full h-full transition-transform duration-300 ease-out"
			style="transform: translateX({isTransitioning ? (isTouching ? (touchEndX - touchStartX) * 0.3 : 0) : 0}px)"
		>
			{#if hasImages && images[currentImageIndex]}
				<!-- Main Image -->
				<button 
					onclick={() => hasImages && onOpenFullscreen()}
					class="relative w-full h-full group cursor-zoom-in block"
					disabled={!hasImages}
				>
					<!-- Skeleton loader -->
					{#if imageLoading.has(currentImageIndex)}
						<div class="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
							<div class="w-full h-full bg-gray-100 flex items-center justify-center">
								<div class="text-gray-400 text-sm">Loading...</div>
							</div>
						</div>
					{/if}
					
					<!-- Actual Image -->
					<img
						src={images[currentImageIndex]}
						alt={title}
						class="w-full h-full transition-all duration-300 group-hover:scale-[1.02] {imageLoading.has(currentImageIndex) ? 'opacity-0' : 'opacity-100'}"
						style="object-fit: contain !important;"
						width={512}
						height={640}
						loading="lazy"
						onload={() => onImageLoad(currentImageIndex)}
						onerror={() => onImageError(currentImageIndex)}
					/>
					
					<!-- Image counter badge -->
					{#if hasMultipleImages}
						<div class="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-sm text-xs font-medium">
							{currentImageIndex + 1}/{images.length}
						</div>
					{/if}
					
					<!-- Zoom indicator -->
					<div class="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Maximize2 class="w-4 h-4" />
					</div>
				</button>
			{:else}
				<div class="w-full h-full bg-gray-100 flex items-center justify-center">
					<span class="text-gray-400">No image available</span>
				</div>
			{/if}
		</div>
		
		<!-- Sold Badge Overlay -->
		{#if status === 'sold'}
			<div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-medium z-10">
				Sold
			</div>
		{/if}
	
		{#if hasMultipleImages}
			<!-- Navigation buttons -->
			<NavigationButton 
				direction="prev" 
				onClick={onPrevImage}
				variant="default"
			/>
			<NavigationButton 
				direction="next" 
				onClick={onNextImage}
				variant="default"
			/>
		{/if}
	</div>
</div>

<style lang="postcss">
	/* Prevent text selection during swipe */
	.touch-pan-y {
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
	}
</style>