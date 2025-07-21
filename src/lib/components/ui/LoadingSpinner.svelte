<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		class?: string
		size?: 'sm' | 'md' | 'lg'
	}
	
	let { class: className, size = 'md' }: Props = $props()
	
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	}
</script>

<div class={cn("flex items-center justify-center", className)}>
	<div 
		class={cn(
			"animate-spin rounded-full border-b-2 border-[#87CEEB]",
			sizeClasses[size]
		)} 
	/>
</div>