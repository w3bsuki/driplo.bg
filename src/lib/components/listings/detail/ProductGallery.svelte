<script lang="ts">
	import { Maximize2, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
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

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}

	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	}

	function openFullscreenGallery(index = currentImageIndex) {
		currentImageIndex = index;
		showFullscreenGallery = true;
		document.body.style.overflow = 'hidden';
	}

	function closeFullscreenGallery() {
		showFullscreenGallery = false;
		document.body.style.overflow = '';
	}

	function handleKeydown(e) {
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

	onMount(() => {
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-2">
	<div class="relative bg-white rounded-sm border border-gray-200/60 p-4">
		<button 
			onclick={() => hasImages && openFullscreenGallery()}
			class="relative aspect-[4/5] overflow-hidden rounded-sm bg-gray-50 w-full group cursor-zoom-in max-w-lg mx-auto block"
			disabled={!hasImages}
		>
			{#if hasImages && images[currentImageIndex]}
				<img
					src={images[currentImageIndex]}
					alt={title}
					class="w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
					style="object-fit: contain !important;"
					width={512}
					height={640}
					loading="eager"
				/>
			{:else}
				<div class="w-full h-full bg-gray-100 flex items-center justify-center">
					<span class="text-gray-400">No image available</span>
				</div>
			{/if}
			
			<!-- Zoom indicator -->
			<div class="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<Maximize2 class="w-4 h-4" />
			</div>
			
			<!-- Sold Badge Overlay -->
			{#if status === 'sold'}
				<div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
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

				<!-- Image indicators -->
				<ImageIndicators 
					{images}
					currentIndex={currentImageIndex}
					onSelect={(index) => currentImageIndex = index}
					variant="default"
				/>
			{/if}
		</button>
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

<!-- Full-screen Gallery -->
{#if showFullscreenGallery}
	<div 
		class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
		transition:fade={{ duration: 200 }}
		onclick={closeFullscreenGallery}
	>
		<div class="relative w-full h-full flex items-center justify-center p-3">
			<!-- Close button -->
			<button
				onclick={closeFullscreenGallery}
				class="absolute top-3 right-3 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
			>
				<X class="w-6 h-6" />
			</button>

			<!-- Image container -->
			<div class="relative max-w-full max-h-full" onclick={(e) => e.stopPropagation()}>
				{#if hasImages && images[currentImageIndex]}
					<Image
						src={images[currentImageIndex]}
						alt={title}
						class="max-w-full max-h-[90vh]"
						objectFit="contain"
						preferredSize="full"
						loading="eager"
						priority={true}
					/>
				{:else}
					<div class="w-full h-full flex items-center justify-center">
						<span class="text-white text-sm">No image available</span>
					</div>
				{/if}

				{#if hasMultipleImages}
					<!-- Navigation buttons -->
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
			</div>

			<!-- Thumbnail strip -->
			{#if hasMultipleImages}
				<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
					{#each images as image, index (index)}
						<ImageThumbnail
							{image}
							{index}
							isActive={index === currentImageIndex}
							onClick={() => currentImageIndex = index}
							variant="fullscreen"
							alt="Thumbnail {index + 1}"
						/>
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
</style>