<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		for?: string;
		required?: boolean;
		class?: string;
		children?: any;
	}
	
	let {
		for: htmlFor,
		required = false,
		class: className = '',
		children,
		...restProps
	}: Props = $props();
</script>

<label
	for={htmlFor}
	class={cn(
		// Simple label styles (clean and minimal)
		'block text-sm font-medium text-gray-700 mb-1',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	{#if required}
		<span class="text-red-500 ml-1">*</span>
	{/if}
</label>