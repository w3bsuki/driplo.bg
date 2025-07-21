<script lang="ts">
	import { cn } from '$lib/utils';
	import { 
		parseStorageUrl, 
		generatePictureSources,
		getTransformedImageUrl 
	} from '$lib/utils/supabase-image-transform';
	import { onMount } from 'svelte';

	interface Props {
		src: string; // Supabase storage URL
		alt: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		sizes?: string;
		aspectRatio?: string;
		objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
		widths?: number[];
		quality?: number;
		priority?: boolean; // High priority images get eager loading + preload
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
		widths = [400, 800, 1200, 1600],
		quality = 80,
		priority = false,
		fallbackSrc = '/images/placeholder.jpg',
		onload,
		onerror
	}: Props = $props();

	let isLoaded = $state(false);
	let hasError = $state(false);
	let imgElement: HTMLImageElement;

	// Parse the storage URL
	const storageInfo = $derived(parseStorageUrl(hasError ? fallbackSrc : src));
	
	// Generate picture sources for modern formats
	const pictureSources = $derived(() => {
		if (!storageInfo || hasError) return [];
		
		return generatePictureSources(storageInfo.bucket, storageInfo.path, {
			widths,
			formats: ['avif', 'webp'], // Skip jpg as it's the fallback
			quality
		});
	});
	
	// Generate fallback image URL
	const fallbackUrl = $derived(() => {
		if (!storageInfo) return hasError ? fallbackSrc : src;
		
		return getTransformedImageUrl({
			bucket: storageInfo.bucket,
			path: storageInfo.path,
			width: widths[Math.floor(widths.length / 2)], // Middle size as default
			quality,
			format: 'jpg'
		});
	});

	// Generate srcset for the fallback image
	const fallbackSrcSet = $derived(() => {
		if (!storageInfo || hasError) return undefined;
		
		return widths
			.map(width => {
				const url = getTransformedImageUrl({
					bucket: storageInfo.bucket,
					path: storageInfo.path,
					width,
					quality,
					format: 'jpg'
				});
				return `${url} ${width}w`;
			})
			.join(', ');
	});

	function handleLoad() {
		isLoaded = true;
		onload?.();
	}

	function handleError(e: Event) {
		console.error('Image failed to load:', src);
		hasError = true;
		onerror?.(e);
	}

	// Preload high priority images
	onMount(() => {
		if (priority && storageInfo) {
			// Preload the largest image for LCP optimization
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = getTransformedImageUrl({
				bucket: storageInfo.bucket,
				path: storageInfo.path,
				width: widths[widths.length - 1],
				quality,
				format: 'webp' // WebP has good browser support
			});
			link.type = 'image/webp';
			document.head.appendChild(link);
			
			return () => {
				document.head.removeChild(link);
			};
		}
	});
</script>

<div 
	class={cn('relative overflow-hidden', className)}
	style:aspect-ratio={aspectRatio}
>
	{#if !isLoaded}
		<div class="absolute inset-0 bg-muted animate-pulse" aria-hidden="true"></div>
	{/if}
	
	<picture>
		{#each pictureSources() as source}
			<source 
				type={source.type} 
				srcset={source.srcset}
				{sizes}
			/>
		{/each}
		
		<img
			bind:this={imgElement}
			src={fallbackUrl()}
			srcset={fallbackSrcSet()}
			{alt}
			{sizes}
			loading={priority ? 'eager' : loading}
			fetchpriority={priority ? 'high' : 'auto'}
			class={cn(
				'w-full h-full transition-opacity duration-300',
				!isLoaded && 'opacity-0',
				isLoaded && 'opacity-100'
			)}
			style:object-fit={objectFit}
			onload={handleLoad}
			onerror={handleError}
			decoding={priority ? 'sync' : 'async'}
			width={widths[Math.floor(widths.length / 2)]}
			height={aspectRatio ? Math.round(widths[Math.floor(widths.length / 2)] / eval(aspectRatio)) : undefined}
		/>
	</picture>
</div>

<style>
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