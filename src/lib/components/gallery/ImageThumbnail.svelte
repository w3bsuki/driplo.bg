<script lang="ts">
	import { cn } from '$lib/utils';
	import Image from '$lib/components/ui/Image.svelte';

	let { 
		image,
		index,
		isActive = false,
		onClick = () => {},
		variant = 'default', // 'default' | 'fullscreen' | 'compact'
		alt = `Thumbnail ${index + 1}`
	}: {
		image: string;
		index: number;
		isActive?: boolean;
		onClick?: () => void;
		variant?: 'default' | 'fullscreen' | 'compact';
		alt?: string;
	} = $props();

	// Variant-specific styling
	const getClasses = () => {
		const baseClasses = "rounded overflow-hidden border transition-all";
		
		switch (variant) {
			case 'fullscreen':
				return cn(
					"w-12 h-12 rounded-sm border-2",
					isActive ? "border-white" : "border-white/30 opacity-60 hover:opacity-100"
				);
			case 'compact':
				return cn(
					"flex-shrink-0 w-8 h-8 rounded-sm border",
					baseClasses,
					isActive ? "border-primary" : "border-gray-200 opacity-80 hover:opacity-100"
				);
			default:
				return cn(
					"flex-shrink-0 w-12 h-12 border",
					baseClasses,
					isActive ? "border-primary" : "border-gray-200 opacity-80 hover:opacity-100"
				);
		}
	};

	const imageClasses = variant === 'fullscreen' ? "w-full h-full" : "w-full h-full";
	const imageAspectRatio = variant === 'fullscreen' ? "1/1" : undefined;
</script>

<button
	onclick={onClick}
	class={getClasses()}
>
	{#if image}
		<Image 
			src={image} 
			{alt}
			class={imageClasses}
			aspectRatio={imageAspectRatio}
			objectFit="cover"
			preferredSize="thumb"
			loading="eager"
		/>
	{:else}
		<div class="w-full h-full bg-gray-100"></div>
	{/if}
</button>