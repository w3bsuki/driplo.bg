<script lang="ts">
	import { onMount } from 'svelte'
	import { getOptimizedImageUrl, getResponsiveImageProps, imageSizes } from '$lib/utils/supabase-images'
	import type { ImageTransformOptions } from '$lib/utils/supabase-images'
	
	export let src: string | null | undefined
	export let alt: string
	export let size: keyof typeof imageSizes = 'card'
	export let customOptions: ImageTransformOptions = {}
	export let sizes: string = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
	export let eager = false
	export let onError: (() => void) | undefined = undefined
	
	// Additional HTML attributes
	export let width: number | undefined = undefined
	export let height: number | undefined = undefined
	export let className: string = ''
	
	let imgElement: HTMLImageElement
	let isIntersecting = eager
	let hasError = false
	
	// Get optimized URLs
	$: optimizedSrc = getOptimizedImageUrl(src, size, customOptions)
	$: responsiveProps = src?.includes('/storage/v1/object/public/') 
		? getResponsiveImageProps(src, alt, sizes)
		: { src: optimizedSrc, alt }
	
	// Set up intersection observer for lazy loading
	onMount(() => {
		if (eager || !imgElement) return
		
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						isIntersecting = true
						observer.disconnect()
					}
				})
			},
			{
				// Start loading when image is 50px away from viewport
				rootMargin: '50px'
			}
		)
		
		observer.observe(imgElement)
		
		return () => observer.disconnect()
	})
	
	function handleError() {
		hasError = true
		if (onError) onError()
	}
</script>

{#if isIntersecting}
	<img
		bind:this={imgElement}
		{...responsiveProps}
		{width}
		{height}
		class={className}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		on:error={handleError}
		on:load
		on:click
	/>
{:else}
	<!-- Placeholder while loading -->
	<div
		bind:this={imgElement}
		class="bg-gray-200 animate-pulse {className}"
		style={width && height ? `width: ${width}px; height: ${height}px` : ''}
		aria-label={alt}
	/>
{/if}

{#if hasError}
	<div class="flex items-center justify-center bg-gray-100 text-gray-400 {className}">
		<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
		</svg>
	</div>
{/if}