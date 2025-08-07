<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { 
		direction,
		onClick = () => {},
		variant = 'default', // 'default' | 'fullscreen'
		disabled = false
	}: {
		direction: 'prev' | 'next';
		onClick?: (e: Event) => void;
		variant?: 'default' | 'fullscreen';
		disabled?: boolean;
	} = $props();

	// Variant-specific positioning and styling
	const getClasses = () => {
		const baseClasses = "flex items-center justify-center transition-all duration-100";
		const positionClasses = direction === 'prev' 
			? "left-2 top-1/2 -translate-y-1/2" 
			: "right-2 top-1/2 -translate-y-1/2";

		switch (variant) {
			case 'fullscreen':
				return cn(
					"absolute p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-100",
					positionClasses,
					baseClasses
				);
			default:
				return cn(
					"absolute w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 hover:bg-white",
					positionClasses,
					baseClasses
				);
		}
	};

	const iconSize = variant === 'fullscreen' ? "w-6 h-6" : "w-4 h-4";
	const IconComponent = direction === 'prev' ? ChevronLeft : ChevronRight;

	// Handle click with event propagation control
	function handleClick(e: Event) {
		e.stopPropagation();
		onClick(e);
	}
</script>

<button
	onclick={handleClick}
	class={getClasses()}
	{disabled}
>
	<IconComponent class={iconSize} />
</button>