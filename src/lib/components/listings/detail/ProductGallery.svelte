<script lang="ts">
	import { Maximize2, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade, scale as scaleTransition } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import Image from '$lib/components/ui/Image.svelte';
	import ImageThumbnail from '$lib/components/gallery/ImageThumbnail.svelte';
	import NavigationButton from '$lib/components/gallery/NavigationButton.svelte';
	import ImageIndicators from '$lib/components/gallery/ImageIndicators.svelte';

	let { 
		images = [],
		title = '',
		status = '',
		showFullscreenGallery = $bindable(false)
	} = $props();

	let currentImageIndex = $state(0);
	let hasMultipleImages = $derived(images.length > 1);
	let hasImages = $derived(images.length > 0);
	
	// Touch and gesture state
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchEndX = $state(0);
	let touchEndY = $state(0);
	let isTouching = $state(false);
	let isTransitioning = $state(false);
	
	// Image loading state
	let imageLoading = $state(new Set<number>());
	let imageLoadError = $state(new Set<number>());
	
	// Zoom state for fullscreen mode
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);
	let lastPinchDistance = $state(0);
	let isZooming = $state(false);
	
	// Element references
	let galleryContainer: HTMLElement;
	let fullscreenContainer: HTMLElement;
	
	const MIN_SWIPE_DISTANCE = 50;
	const MIN_SWIPE_VELOCITY = 0.3;
	const TRANSITION_DURATION = 300;

	function nextImage() {
		if (isTransitioning || !hasMultipleImages) return;
		isTransitioning = true;
		currentImageIndex = (currentImageIndex + 1) % images.length;
		preloadAdjacentImages();
		setTimeout(() => isTransitioning = false, TRANSITION_DURATION);
	}

	function prevImage() {
		if (isTransitioning || !hasMultipleImages) return;
		isTransitioning = true;
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
		preloadAdjacentImages();
		setTimeout(() => isTransitioning = false, TRANSITION_DURATION);
	}
	
	function preloadAdjacentImages() {
		if (!hasImages) return;
		
		const nextIndex = (currentImageIndex + 1) % images.length;
		const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
		
		[nextIndex, prevIndex].forEach(index => {
			if (images[index] && !imageLoading.has(index) && !imageLoadError.has(index)) {
				const img = new Image();
				img.onload = () => {
					imageLoading = new Set([...imageLoading].filter(i => i !== index));
				};
				img.onerror = () => {
					imageLoading = new Set([...imageLoading].filter(i => i !== index));
					imageLoadError = new Set([...imageLoadError, index]);
				};
				imageLoading = new Set([...imageLoading, index]);
				img.src = images[index];
			}
		});
	}

	function openFullscreenGallery(index = currentImageIndex) {
		currentImageIndex = index;
		showFullscreenGallery = true;
		document.body.style.overflow = 'hidden';
		resetZoom();
		preloadAdjacentImages();
	}

	function closeFullscreenGallery() {
		showFullscreenGallery = false;
		document.body.style.overflow = '';
		resetZoom();
	}
	
	function resetZoom() {
		scale = 1;
		translateX = 0;
		translateY = 0;
		lastPinchDistance = 0;
		isZooming = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showFullscreenGallery) return;
		
		switch(e.key) {
			case 'ArrowLeft':
				prevImage();
				break;
			case 'ArrowRight':
				nextImage();
				break;
			case 'Escape':
				closeFullscreenGallery();
				break;
		}
	}
	
	// Touch event handlers for swipe gestures
	function handleTouchStart(e: TouchEvent) {
		if (!hasMultipleImages) return;
		
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		isTouching = true;
	}
	
	function handleTouchMove(e: TouchEvent) {
		if (!isTouching) return;
		
		const touch = e.touches[0];
		touchEndX = touch.clientX;
		touchEndY = touch.clientY;
		
		// Prevent scrolling if it's a horizontal swipe
		const deltaX = Math.abs(touchEndX - touchStartX);
		const deltaY = Math.abs(touchEndY - touchStartY);
		
		if (deltaX > deltaY && deltaX > 10) {
			e.preventDefault();
		}
	}
	
	function handleTouchEnd(e: TouchEvent) {
		if (!isTouching) return;
		
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const time = Date.now() - (e.timeStamp - 100); // Approximate touch duration
		const velocity = distance / time;
		
		// Check if it's a horizontal swipe
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
			if (deltaX > 0) {
				prevImage(); // Swipe right = previous image
			} else {
				nextImage(); // Swipe left = next image
			}
		}
		
		isTouching = false;
		touchStartX = 0;
		touchStartY = 0;
		touchEndX = 0;
		touchEndY = 0;
	}
	
	// Pinch-to-zoom handlers for fullscreen mode
	function getDistance(touches: TouchList) {
		const touch1 = touches[0];
		const touch2 = touches[1];
		return Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) + 
			Math.pow(touch2.clientY - touch1.clientY, 2)
		);
	}
	
	function handleFullscreenTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Pinch gesture
			lastPinchDistance = getDistance(e.touches);
			isZooming = true;
			e.preventDefault();
		} else if (e.touches.length === 1 && !isZooming) {
			// Single touch for pan or swipe
			handleTouchStart(e);
		}
	}
	
	function handleFullscreenTouchMove(e: TouchEvent) {
		if (e.touches.length === 2 && isZooming) {
			// Pinch zoom
			const currentDistance = getDistance(e.touches);
			const scaleChange = currentDistance / lastPinchDistance;
			const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 3);
			
			scale = newScale;
			lastPinchDistance = currentDistance;
			e.preventDefault();
		} else if (e.touches.length === 1 && !isZooming) {
			if (scale > 1) {
				// Pan when zoomed
				const touch = e.touches[0];
				const deltaX = touch.clientX - touchStartX;
				const deltaY = touch.clientY - touchStartY;
				
				translateX += deltaX * 0.5;
				translateY += deltaY * 0.5;
				
				touchStartX = touch.clientX;
				touchStartY = touch.clientY;
				e.preventDefault();
			} else {
				// Regular swipe handling
				handleTouchMove(e);
			}
		}
	}
	
	function handleFullscreenTouchEnd(e: TouchEvent) {
		if (isZooming && e.touches.length < 2) {
			isZooming = false;
			lastPinchDistance = 0;
		} else if (!isZooming && scale <= 1) {
			handleTouchEnd(e);
		}
	}
	
	// Image loading handlers
	function handleImageLoad(index: number) {
		imageLoading = new Set([...imageLoading].filter(i => i !== index));
	}
	
	function handleImageError(index: number) {
		imageLoading = new Set([...imageLoading].filter(i => i !== index));
		imageLoadError = new Set([...imageLoadError, index]);
	}
	
	function startImageLoad(index: number) {
		if (!imageLoading.has(index) && !imageLoadError.has(index)) {
			imageLoading = new Set([...imageLoading, index]);
		}
	}

	onMount(() => {
		// Preload the first few images
		preloadAdjacentImages();
		
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-2">
	<div class="relative bg-white rounded-sm border border-gray-200/60 p-4 sm:p-2">
		<div 
			bind:this={galleryContainer}
			class="relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-sm bg-gray-50 w-full max-w-lg mx-auto touch-pan-y"
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
		>
			<!-- Image Container with smooth transitions -->
			<div 
				class="relative w-full h-full transition-transform duration-300 ease-out"
				style="transform: translateX({isTransitioning ? (isTouching ? (touchEndX - touchStartX) * 0.3 : 0) : 0}px)"
			>
				{#if hasImages && images[currentImageIndex]}
					<!-- Main Image -->
					<button 
						onclick={() => hasImages && openFullscreenGallery()}
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
							onload={() => handleImageLoad(currentImageIndex)}
							onerror={() => handleImageError(currentImageIndex)}
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
					onClick={() => prevImage()}
					variant="default"
				/>
				<NavigationButton 
					direction="next" 
					onClick={() => nextImage()}
					variant="default"
				/>
			{/if}
		</div>
		
		<!-- Modern dot indicators at bottom -->
		{#if hasMultipleImages}
			<div class="flex justify-center gap-1.5 mt-3">
				{#each images as _, index (index)}
					<button
						onclick={() => !isTransitioning && (currentImageIndex = index)}
						class="w-2 h-2 rounded-full transition-all duration-300 {index === currentImageIndex ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'}"
						disabled={isTransitioning}
						aria-label="Go to image {index + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Thumbnail strip -->
	{#if hasMultipleImages}
		<div class="flex gap-1.5 overflow-x-auto scrollbar-hide">
			{#each images as image, index (index)}
				<ImageThumbnail
					{image}
					{index}
					isActive={index === currentImageIndex}
					onClick={() => currentImageIndex = index}
					variant="default"
					alt="Product {index + 1}"
				/>
			{/each}
		</div>
	{/if}
</div>

<!-- Full-screen Gallery with Touch Support -->
{#if showFullscreenGallery}
	<div 
		class="fixed inset-0 z-[100] bg-black flex items-center justify-center"
		transition:fade={{ duration: 200 }}
		onclick={closeFullscreenGallery}
	>
		<div 
			bind:this={fullscreenContainer}
			class="relative w-full h-full flex items-center justify-center touch-none"
			ontouchstart={handleFullscreenTouchStart}
			ontouchmove={handleFullscreenTouchMove}
			ontouchend={handleFullscreenTouchEnd}
		>
			<!-- Close button -->
			<button
				onclick={closeFullscreenGallery}
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
			<div 
				class="relative max-w-full max-h-full flex items-center justify-center" 
				onclick={(e) => e.stopPropagation()}
				style="transform: scale({scale}) translate({translateX}px, {translateY}px); transition: {isZooming ? 'none' : 'transform 0.3s ease-out'}"
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
						onload={() => handleImageLoad(currentImageIndex)}
						onerror={() => handleImageError(currentImageIndex)}
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
					onclick={resetZoom}
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
					onClick={() => prevImage()}
					variant="fullscreen"
				/>
				<NavigationButton 
					direction="next" 
					onClick={() => nextImage()}
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
							onclick={() => !isTransitioning && (currentImageIndex = index)}
							class="w-2.5 h-2.5 rounded-full transition-all duration-300 touch-auto {index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}"
							disabled={isTransitioning}
							aria-label="Go to image {index + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	/* Smooth skeleton animation */
	@keyframes shimmer {
		0% { background-position: -200px 0; }
		100% { background-position: calc(200px + 100%) 0; }
	}
	
	.animate-shimmer {
		animation: shimmer 2s ease-in-out infinite;
		background: linear-gradient(
			90deg,
			var(--color-gray-200) 0px,
			var(--color-gray-300) 40px,
			var(--color-gray-200) 80px
		);
		background-size: 200px;
	}
	
	/* Touch feedback */
	.touch-feedback {
		transition: transform 0.1s ease-out;
	}
	
	.touch-feedback:active {
		transform: scale(0.98);
	}
	
	/* Prevent text selection during swipe */
	.touch-pan-y {
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
	}
	
	.touch-none {
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
	}
	
	.touch-auto {
		touch-action: auto;
	}
</style>