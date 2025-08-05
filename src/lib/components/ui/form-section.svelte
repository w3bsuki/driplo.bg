<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { ComponentType } from 'svelte'
	import { cn } from '$lib/utils'
	
	interface Props {
		title?: string
		description?: string
		icon?: ComponentType
		children: Snippet
		class?: string
	}
	
	let { 
		title,
		description,
		icon: Icon,
		children,
		class: className = ''
	}: Props = $props()
</script>

<section class={cn("space-y-4", className)}>
	{#if title}
		<div class="space-y-1">
			<h3 class="text-lg font-semibold flex items-center gap-2">
				{#if Icon}
					<Icon class="w-5 h-5 text-gray-500" />
				{/if}
				{title}
			</h3>
			{#if description}
				<p class="text-sm text-gray-600">{description}</p>
			{/if}
		</div>
	{/if}
	
	<div class="space-y-4">
		{@render children()}
	</div>
</section>