<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		children?: any;
		class?: string;
	}
	
	let { children, class: className }: Props = $props();
</script>

<h2 class={cn("text-lg font-semibold leading-none tracking-tight", className)}>
	{@render children?.()}
</h2>