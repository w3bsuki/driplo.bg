<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		class?: string
		size?: 'sm' | 'md' | 'lg'
		color?: 'primary' | 'white' | 'current'
	}
	
	let { class: className, size = 'md', color = 'primary' }: Props = $props()
	
	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-2',
		lg: 'w-12 h-12 border-3'
	}
	
	const colorClasses = {
		primary: 'border-[#87CEEB]/20 border-b-[#87CEEB]',
		white: 'border-white/20 border-b-white',
		current: 'border-current/20 border-b-current'
	}
</script>

<div 
	class={cn("flex items-center justify-center", className)}
	role="status"
	aria-label="Loading"
>
	<div 
		class={cn(
			"animate-spin rounded-full will-change-transform",
			sizeClasses[size],
			colorClasses[color]
		)}
		style="animation: spin 0.75s linear infinite;"
	/>
	<span class="sr-only">Loading...</span>
</div>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>