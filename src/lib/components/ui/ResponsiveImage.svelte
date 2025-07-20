<script lang="ts">
	import { cn } from '$lib/utils';
	import { getResponsiveImageUrl } from '$lib/utils/responsive-image';
	import { onMount } from 'svelte';

	interface Props {
		src: string | Record<string, string>;
		alt: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		sizes?: string;
		aspectRatio?: string;
		objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
		preferredSize?: 'thumb' | 'small' | 'medium' | 'large' | 'full';
		fallbackSrc?: string;
		onload?: () => void;
		onerror?: (e: Event) => void;
	}

	let {
		src,
		alt,
		class: className,
		loading = 'lazy',
		sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
		aspectRatio = '1/1',
		objectFit = 'cover',
		preferredSize = 'medium',
		fallbackSrc = '/images/placeholder.jpg',
		onload,
		onerror
	}: Props = $props();

	let isLoaded = $state(false);
	let hasError = $state(false);
	let imgElement: HTMLImageElement;
	let observerSupported = $state(true);

	// Get the appropriate image URL
	const imageUrl = $derived(
		hasError ? fallbackSrc : getResponsiveImageUrl(src, preferredSize)
	);

	// Generate srcset if src is an object with multiple URLs
	const srcSet = $derived(() => {
		if (typeof src === 'string' || hasError) return undefined;
		
		const srcSetParts: string[] = [];
		const suffixWidths: Record<string, number> = {
			thumb: 150,
			small: 400,
			medium: 800,
			large: 1200,
			full: 2400
		};

		for (const [suffix, url] of Object.entries(src)) {
			const width = suffixWidths[suffix];
			if (width && url) {
				srcSetParts.push(`${url} ${width}w`);
			}
		}

		return srcSetParts.length > 0 ? srcSetParts.join(', ') : undefined;
	});

	function handleLoad() {
		isLoaded = true;
		onload?.();
	}

	function handleError(e: Event) {
		console.error('Image failed to load:', imageUrl);
		hasError = true;
		onerror?.(e);
	}

	// Intersection Observer for native lazy loading fallback
	onMount(() => {
		// Check if browser supports loading attribute
		observerSupported = 'loading' in HTMLImageElement.prototype;

		if (!observerSupported && loading === 'lazy' && imgElement) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target as HTMLImageElement;
							img.src = imageUrl;
							if (srcSet()) {
								img.srcset = srcSet()!;
							}
							observer.unobserve(img);
						}
					});
				},
				{
					rootMargin: '50px'
				}
			);

			observer.observe(imgElement);

			return () => {
				observer.disconnect();
			};
		}
	});
</script>

<div 
	class={cn('relative overflow-hidden', className)}
	style:aspect-ratio={aspectRatio}
>
	{#if !isLoaded}
		<div class="absolute inset-0 bg-muted animate-pulse"></div>
	{/if}
	
	<img
		bind:this={imgElement}
		src={observerSupported || loading === 'eager' ? imageUrl : undefined}
		srcset={observerSupported || loading === 'eager' ? srcSet() : undefined}
		{alt}
		{sizes}
		{loading}
		class={cn(
			'w-full h-full transition-opacity duration-300',
			!isLoaded && 'opacity-0',
			isLoaded && 'opacity-100'
		)}
		style:object-fit={objectFit}
		onload={handleLoad}
		onerror={handleError}
		decoding="async"
	/>
</div>

<style>
	/* Preload animation */
	@keyframes pulse {
		0%, 100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.6;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>