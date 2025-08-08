<script lang="ts">
	import { onMount } from 'svelte';
	import GalleryMain from './gallery/GalleryMain.svelte';
	import FullscreenGallery from './gallery/FullscreenGallery.svelte';
	import GalleryControls from './gallery/GalleryControls.svelte';
	import { 
		createGalleryGestureHandler, 
		type GalleryGestureState 
	} from './gallery/GalleryGestureHandler.js';
	import { 
		createImageLoader, 
		type ImageLoaderState 
	} from './gallery/GalleryImageLoader.js';

	let { 
		images = [],
		title = '',
		status = '',
		showFullscreenGallery = $bindable(false)
	} = $props();

	let currentImageIndex = $state(0);
	let hasMultipleImages = $derived(images.length > 1);
	let hasImages = $derived(images.length > 0);
	
	// Gesture state
	let gestureState: GalleryGestureState = $state({
		touchStartX: 0,
		touchStartY: 0,
		touchEndX: 0,
		touchEndY: 0,
		isTouching: false,
		isTransitioning: false,
		scale: 1,
		translateX: 0,
		translateY: 0,
		lastPinchDistance: 0,
		isZooming: false
	});
	
	// Image loading state
	let imageLoaderState: ImageLoaderState = $state({
		imageLoading: new Set<number>(),
		imageLoadError: new Set<number>()
	});
	
	// Create handlers
	const imageLoader = createImageLoader(imageLoaderState);
	const gestureHandler = createGalleryGestureHandler(
		images, 
		{ 
			value: currentImageIndex, 
			set: (value: number) => currentImageIndex = value 
		},
		() => imageLoader.preloadAdjacentImages(currentImageIndex, images),
		gestureState
	);

	function openFullscreenGallery(index = currentImageIndex) {
		currentImageIndex = index;
		showFullscreenGallery = true;
		document.body.style.overflow = 'hidden';
		gestureHandler.resetZoom();
		imageLoader.preloadAdjacentImages(currentImageIndex, images);
	}

	function closeFullscreenGallery() {
		showFullscreenGallery = false;
		document.body.style.overflow = '';
		gestureHandler.resetZoom();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showFullscreenGallery) return;
		
		switch(e.key) {
			case 'ArrowLeft':
				gestureHandler.prevImage();
				break;
			case 'ArrowRight':
				gestureHandler.nextImage();
				break;
			case 'Escape':
				closeFullscreenGallery();
				break;
		}
	}

	onMount(() => {
		// Preload the first few images
		imageLoader.preloadAdjacentImages(currentImageIndex, images);
		
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-2">
	<!-- Main Gallery Display -->
	<GalleryMain 
		{images}
		{currentImageIndex}
		{title}
		{status}
		{hasMultipleImages}
		imageLoading={imageLoaderState.imageLoading}
		isTransitioning={gestureState.isTransitioning}
		isTouching={gestureState.isTouching}
		touchEndX={gestureState.touchEndX}
		touchStartX={gestureState.touchStartX}
		onOpenFullscreen={openFullscreenGallery}
		onPrevImage={gestureHandler.prevImage}
		onNextImage={gestureHandler.nextImage}
		onImageLoad={imageLoader.handleImageLoad}
		onImageError={imageLoader.handleImageError}
		onTouchStart={gestureHandler.handleTouchStart}
		onTouchMove={gestureHandler.handleTouchMove}
		onTouchEnd={gestureHandler.handleTouchEnd}
	/>

	<!-- Gallery Controls (dots and thumbnails) -->
	<GalleryControls 
		{images}
		{currentImageIndex}
		{hasMultipleImages}
		isTransitioning={gestureState.isTransitioning}
		onSetCurrentImage={(index) => currentImageIndex = index}
	/>
</div>

<!-- Fullscreen Gallery Modal -->
{#if showFullscreenGallery}
	<FullscreenGallery 
		{images}
		{currentImageIndex}
		{title}
		{hasMultipleImages}
		imageLoading={imageLoaderState.imageLoading}
		isTransitioning={gestureState.isTransitioning}
		scale={gestureState.scale}
		translateX={gestureState.translateX}
		translateY={gestureState.translateY}
		isZooming={gestureState.isZooming}
		onClose={closeFullscreenGallery}
		onPrevImage={gestureHandler.prevImage}
		onNextImage={gestureHandler.nextImage}
		onResetZoom={gestureHandler.resetZoom}
		onImageLoad={imageLoader.handleImageLoad}
		onImageError={imageLoader.handleImageError}
		onSetCurrentImage={(index) => currentImageIndex = index}
		onFullscreenTouchStart={gestureHandler.handleFullscreenTouchStart}
		onFullscreenTouchMove={gestureHandler.handleFullscreenTouchMove}
		onFullscreenTouchEnd={gestureHandler.handleFullscreenTouchEnd}
	/>
{/if}

<style lang="postcss">
	/* Smooth skeleton animation */
	@keyframes shimmer {
		0% { background-position: -200px 0; }
		100% { background-position: calc(200px + 100%) 0; }
	}
	
	:global(.animate-shimmer) {
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
	:global(.touch-feedback) {
		transition: transform 0.1s ease-out;
	}
	
	:global(.touch-feedback:active) {
		transform: scale(0.98);
	}
</style>