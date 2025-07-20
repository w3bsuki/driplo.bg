<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		showEmoji?: boolean;
		className?: string;
	}
	
	let { 
		size = 'md', 
		showEmoji = true,
		className = ''
	}: Props = $props();
	
	const sizeClasses = {
		sm: 'text-lg md:text-xl',
		md: 'text-xl md:text-2xl',
		lg: 'text-2xl md:text-3xl'
	};
	
	const emojiSizes = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-xl'
	};
</script>

<div class={cn("flex items-center gap-1", className)}>
	<span 
		class={cn(
			"font-black tracking-tight text-gray-900",
			sizeClasses[size]
		)}
	>
		Driplo
	</span>
	{#if showEmoji}
		<span 
			class={cn(
				"inline-block",
				emojiSizes[size]
			)}
			role="img"
			aria-label="Clothing"
		>
			👕
		</span>
	{/if}
</div>