<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props extends Record<string, any> {
		class?: string
		value?: string
	}
	
	let { class: className, value = $bindable(), ...restProps }: Props = $props()
</script>

<textarea
	bind:value
	class={cn(
		"flex min-h-24 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{...restProps}
/>