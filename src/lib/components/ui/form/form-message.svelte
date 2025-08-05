<script lang="ts">
	import { cn } from '$lib/utils'
	import { AlertCircle } from 'lucide-svelte'
	
	interface Props {
		class?: string
		error?: string | string[] | null
		children?: any
	}
	
	let { class: className, error, children }: Props = $props()
	
	const errorMessage = $derived(
		Array.isArray(error) ? error[0] : error
	)
</script>

{#if errorMessage || children}
	<p class={cn("text-sm text-red-500 mt-1 flex items-center gap-1", className)}>
		{#if errorMessage}
			<AlertCircle class="w-3 h-3 flex-shrink-0" />
			{errorMessage}
		{:else}
			{@render children?.()}
		{/if}
	</p>
{/if}