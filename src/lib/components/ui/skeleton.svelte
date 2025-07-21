<script lang="ts">
	import { cn } from '$lib/utils/cn'
	
	interface Props {
		class?: string
	}
	
	let { class: className }: Props = $props()
</script>

<div 
	class={cn("animate-pulse rounded-md bg-gray-200", className)}
	role="status"
	aria-label="Loading..."
>
	<span class="sr-only">Loading...</span>
</div>