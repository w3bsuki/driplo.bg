<script lang="ts">
	import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Image from '$lib/components/ui/Image.svelte';

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
				<button
					onclick={(e) => { e.stopPropagation(); prevImage(); }}
					class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200 hover:bg-white transition-all duration-100"
				>
					<ChevronLeft class="w-4 h-4" />
				</button>
				<button
					onclick={(e) => { e.stopPropagation(); nextImage(); }}
					class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200 hover:bg-white transition-all duration-100"
				>
					<ChevronRight class="w-4 h-4" />
				</button>

				<!-- Image indicators -->
				<div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
					{#each images as _, index (index)}
						<button
							onclick={(e) => { e.stopPropagation(); currentImageIndex = index; }}
							class={cn("w-1 h-1 rounded-full transition-all", 
								index === currentImageIndex ? "bg-white w-4" : "bg-white/60"
							)}
						/>
					{/each}
				</div>
			{/if}
		</button>
	</div>

	<!-- Thumbnail strip -->
	{#if hasMultipleImages}
		<div class="flex gap-1.5 overflow-x-auto scrollbar-hide">
			{#each images as image, index (index)}
				<button
					onclick={() => currentImageIndex = index}
					class={cn("flex-shrink-0 w-12 h-12 rounded overflow-hidden border transition-all",
						index === currentImageIndex ? "border-primary " : "border-gray-200 opacity-80 hover:opacity-100"
					)}
				>
					{#if image}
						<Image 
							src={image} 
							alt="Product {index + 1}" 
							class="w-full h-full" 
							objectFit="cover"
							preferredSize="thumb"
							loading="eager"
						/>
					{:else}
						<div class="w-full h-full bg-gray-100"></div>
					{/if}
				</button>
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
					<button
						onclick={(e) => { e.stopPropagation(); prevImage(); }}
						class="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-100"
					>
						<ChevronLeft class="w-6 h-6" />
					</button>
					<button
						onclick={(e) => { e.stopPropagation(); nextImage(); }}
						class="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-100"
					>
						<ChevronRight class="w-6 h-6" />
					</button>
				{/if}
			</div>

			<!-- Thumbnail strip -->
			{#if hasMultipleImages}
				<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
					{#each images as _, index (index)}
						<button
							onclick={(e) => { e.stopPropagation(); currentImageIndex = index; }}
							class={cn("w-12 h-12 rounded-sm overflow-hidden border-2 transition-all",
								index === currentImageIndex ? "border-white" : "border-white/30 opacity-60 hover:opacity-100"
							)}
						>
							<Image 
								src={images[index]} 
								alt="Thumbnail {index + 1}" 
								class="w-full h-full"
								aspectRatio="1/1"
								objectFit="cover"
								preferredSize="thumb"
								loading="eager"
							/>
						</button>
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