<script lang="ts">
	import { browser } from '$app/environment';
	import {
		supportsNativeLazyLoading,
		generatePlaceholder,
		createSrcSet,
		getSizesAttribute,
		type LazyLoadingOptions
	} from '$lib/utils/lazy-loading';
	
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		loading?: 'lazy' | 'eager';
		priority?: boolean;
		sizes?: string;
		srcsetSizes?: number[];
		usePlaceholder?: boolean;
		placeholderSrc?: string;
		lowQualitySrc?: string;
		useProgressiveLoading?: boolean;
		blurAmount?: number;
		className?: string;
		style?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
		decoding?: 'sync' | 'async' | 'auto';
		lazyOptions?: LazyLoadingOptions;
		onLoad?: () => void;
		onError?: () => void;
	}
	
	let {
		src,
		alt,
		width,
		height,
		loading = 'lazy',
		priority = false,
		sizes = getSizesAttribute(),
		srcsetSizes = [320, 640, 768, 1024, 1280, 1536],
		usePlaceholder = true,
		placeholderSrc,
		lowQualitySrc,
		useProgressiveLoading = true,
		blurAmount = 20,
		className = '',
		style = '',
		fetchpriority = 'auto',
		decoding = 'async',
		lazyOptions = {},
		onLoad,
		onError
	}: Props = $props();
	
	let imgElement: HTMLImageElement;
	let lowQualityElement: HTMLImageElement;
	let isLoaded = $state(false);
	let isIntersecting = $state(false);
	let hasError = $state(false);
	let lowQualityLoaded = $state(false);
	let isVisible = $state(false);
	
	// Generate placeholder if needed
	const placeholder = placeholderSrc || (usePlaceholder ? generatePlaceholder(width || 40, height || 40) : '');
	
	// Generate low quality version for progressive loading
	const lowQualityUrl = lowQualitySrc || (useProgressiveLoading ? `${src}?q=10&w=40&blur=${blurAmount}` : '');
	
	// Create srcset
	const srcset = createSrcSet(src, srcsetSizes);
	
	// Determine fetch priority
	if (priority) {
		fetchpriority = 'high';
		loading = 'eager';
	}
	
	// Handle image load
	function handleLoad() {
		isLoaded = true;
		onLoad?.();
	}
	
	// Handle image error
	function handleError() {
		hasError = true;
		isLoaded = true;
		onError?.();
	}
	
	// Handle low quality image load
	function handleLowQualityLoad() {
		lowQualityLoaded = true;
	}
	
	// Set up intersection observer for visibility and lazy loading
	$effect(() => {
		if (!browser || !imgElement) {
			return;
		}
		
		const options = {
			rootMargin: lazyOptions.rootMargin || '50px',
			threshold: lazyOptions.threshold || 0.01
		};
		
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting && !isVisible) {
					isVisible = true;
					
					// For browsers without native lazy loading, manually trigger loading
					if (loading === 'lazy' && !supportsNativeLazyLoading()) {
						isIntersecting = true;
						// Force load the image
						if (imgElement) {
							imgElement.src = src;
							if (srcset) {
								imgElement.srcset = srcset;
							}
						}
					}
					
					// Load low quality image first for progressive loading
					if (useProgressiveLoading && lowQualityUrl && lowQualityElement && !lowQualityLoaded) {
						lowQualityElement.src = lowQualityUrl;
					}
				}
			});
		}, options);
		
		observer.observe(imgElement);
		
		return () => {
			observer.unobserve(imgElement);
		};
	});
</script>

<div 
	class="image-wrapper {className}"
	{style}
	class:loaded={isLoaded}
	class:has-error={hasError}
	class:progressive={useProgressiveLoading}
>
	<!-- Static placeholder for initial load -->
	{#if usePlaceholder && !lowQualityLoaded && !isLoaded}
		<div
			class="placeholder static-placeholder"
			aria-hidden="true"
			style="background-image: url('{placeholder}'); background-size: cover;"
		></div>
	{/if}
	
	<!-- Low quality progressive image -->
	{#if useProgressiveLoading && lowQualityUrl && isVisible}
		<img
			bind:this={lowQualityElement}
			class="placeholder low-quality"
			src={lowQualityUrl}
			alt=""
			aria-hidden="true"
			width={width}
			height={height}
			onload={handleLowQualityLoad}
			class:loaded={lowQualityLoaded}
		/>
	{/if}
	
	<!-- High quality main image -->
	<img
		bind:this={imgElement}
		src={loading === 'eager' || isIntersecting || supportsNativeLazyLoading() ? src : ''}
		srcset={loading === 'eager' || isIntersecting || supportsNativeLazyLoading() ? srcset : undefined}
		{alt}
		{width}
		{height}
		{loading}
		{sizes}
		{fetchpriority}
		{decoding}
		onload={handleLoad}
		onerror={handleError}
		class="main-image"
		class:loading={!isLoaded}
	/>
	
	<!-- Loading indicator -->
	{#if !isLoaded && !hasError && isVisible}
		<div class="loading-indicator" aria-hidden="true">
			<div class="loading-spinner"></div>
		</div>
	{/if}
</div>

<style>
	.image-wrapper {
		position: relative;
		overflow: hidden;
		background-color: rgb(var(--color-gray-100));
		display: block;
	}
	
	.placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
	}
	
	.static-placeholder {
		filter: blur(0.5rem);
		transform: scale(1.05);
		opacity: 0.8;
	}
	
	.low-quality {
		filter: blur(1rem);
		transform: scale(1.02);
		opacity: 0;
	}
	
	.low-quality.loaded {
		opacity: 1;
	}
	
	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
		background-color: transparent;
	}
	
	.main-image.loading {
		opacity: 0;
	}
	
	.image-wrapper.loaded .main-image {
		opacity: 1;
	}
	
	/* Hide placeholders when main image loads */
	.image-wrapper.loaded .placeholder {
		opacity: 0;
		pointer-events: none;
	}
	
	/* Progressive loading transition */
	.image-wrapper.progressive.loaded .low-quality {
		transition-delay: 0.1s;
	}
	
	/* Error state */
	.image-wrapper.has-error {
		background-color: rgb(var(--color-gray-200));
	}
	
	.image-wrapper.has-error::after {
		content: '🖼️';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2rem;
		opacity: 0.5;
		z-index: 2;
	}
	
	/* Loading indicator */
	.loading-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
	}
	
	.loading-spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid rgb(var(--color-gray-300));
		border-top-color: rgb(var(--color-primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Performance optimizations */
	.image-wrapper {
		will-change: opacity;
		backface-visibility: hidden;
		transform: translateZ(0);
	}
	
	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.placeholder,
		.main-image {
			transition-duration: 0.1s;
		}
		
		.loading-spinner {
			animation-duration: 2s;
		}
	}
</style>