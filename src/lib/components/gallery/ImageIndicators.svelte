<script lang="ts">
	import { cn } from '$lib/utils';

	let { 
		images,
		currentIndex,
		onSelect = () => {},
		variant = 'default' // 'default' | 'compact'
	}: {
		images: string[];
		currentIndex: number;
		onSelect?: (index: number) => void;
		variant?: 'default' | 'compact';
	} = $props();

	// Variant-specific styling
	const containerClass = variant === 'compact' 
		? "flex gap-0.5"
		: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1";

	const getIndicatorClass = (index: number) => {
		const baseClasses = "rounded-full transition-all";
		const isActive = index === currentIndex;
		
		switch (variant) {
			case 'compact':
				return cn(
					"w-1.5 h-1.5",
					baseClasses,
					isActive ? "bg-primary w-3" : "bg-gray-300"
				);
			default:
				return cn(
					"w-1 h-1",
					baseClasses,
					isActive ? "bg-white w-4" : "bg-white/60"
				);
		}
	};

	// Handle click with event propagation control
	function handleSelect(e: Event, index: number) {
		e.stopPropagation();
		onSelect(index);
	}
</script>

<div class={containerClass}>
	{#each images as _, index (index)}
		<button
			onclick={(e) => handleSelect(e, index)}
			class={getIndicatorClass(index)}
		/>
	{/each}
</div>