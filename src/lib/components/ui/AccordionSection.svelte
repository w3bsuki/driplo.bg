<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	interface Props {
		title: string;
		isOpen?: boolean;
		class?: string;
		headerClass?: string;
		contentClass?: string;
		children?: any;
	}
	
	let { 
		title,
		isOpen = $bindable(false),
		class: className = '',
		headerClass = '',
		contentClass = '',
		children
	}: Props = $props();
	
	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class={cn("border-b border-gray-200 last:border-b-0", className)}>
	<!-- Accordion Header -->
	<button
		onclick={toggle}
		class={cn(
			"flex w-full items-center justify-between py-4 px-0 text-left",
			"min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
			"hover:bg-gray-50/50 transition-colors duration-100 rounded-sm",
			"text-sm font-medium text-foreground",
			headerClass
		)}
		type="button"
		aria-expanded={isOpen}
	>
		<span>{title}</span>
		<ChevronDown 
			class={cn(
				"h-4 w-4 transition-transform duration-300 text-muted-foreground",
				isOpen && "rotate-180"
			)} 
		/>
	</button>
	
	<!-- Accordion Content -->
	{#if isOpen}
		<div 
			transition:slide={{ duration: 300 }}
			class={cn("pb-4", contentClass)}
		>
			{@render children?.()}
		</div>
	{/if}
</div>