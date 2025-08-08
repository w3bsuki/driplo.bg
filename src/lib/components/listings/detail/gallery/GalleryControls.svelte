<script lang="ts">
	import ImageThumbnail from '$lib/components/gallery/ImageThumbnail.svelte';

	interface Props {
		images: string[];
		currentImageIndex: number;
		hasMultipleImages: boolean;
		isTransitioning: boolean;
		onSetCurrentImage: (index: number) => void;
	}

	let { 
		images,
		currentImageIndex,
		hasMultipleImages,
		isTransitioning,
		onSetCurrentImage
	}: Props = $props();
</script>

{#if hasMultipleImages}
	<!-- Modern dot indicators at bottom -->
	<div class="flex justify-center gap-1.5 mt-3">
		{#each images as _, index (index)}
			<button
				onclick={() => !isTransitioning && onSetCurrentImage(index)}
				class="w-2 h-2 rounded-full transition-all duration-300 {index === currentImageIndex ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'}"
				disabled={isTransitioning}
				aria-label="Go to image {index + 1}"
			></button>
		{/each}
	</div>

	<!-- Thumbnail strip -->
	<div class="flex gap-1.5 overflow-x-auto scrollbar-hide mt-2">
		{#each images as image, index (index)}
			<ImageThumbnail
				{image}
				{index}
				isActive={index === currentImageIndex}
				onClick={() => onSetCurrentImage(index)}
				variant="default"
				alt="Product {index + 1}"
			/>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>