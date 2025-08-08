<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		name?: string
		class?: string
		children?: import('svelte').Snippet
	}
	
	let { name, class: className = '', children }: Props = $props()
</script>

<div class={cn("space-y-2", className)} data-field={name}>
	{@render children?.()}
</div>