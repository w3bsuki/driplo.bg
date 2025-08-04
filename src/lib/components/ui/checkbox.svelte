<script lang="ts">
	import { cn } from '$lib/utils'
	import { Check } from 'lucide-svelte'
	
	interface Props {
		checked?: boolean
		disabled?: boolean
		id?: string
		name?: string
		value?: string
		class?: string
		onchange?: (e: Event) => void
		oncheckedchange?: (checked: boolean) => void
	}
	
	let { 
		checked = $bindable(false),
		disabled = false,
		id,
		name,
		value,
		class: className = '',
		onchange,
		oncheckedchange
	}: Props = $props()
	
	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement
		checked = input.checked
		onchange?.(e)
		oncheckedchange?.(checked)
	}
</script>

<div class="relative flex items-center">
	<input
		type="checkbox"
		{id}
		{name}
		{value}
		{disabled}
		bind:checked
		onchange={handleChange}
		class={cn(
			"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
			"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
			className
		)}
		data-state={checked ? 'checked' : 'unchecked'}
	/>
	{#if checked}
		<Check class="pointer-events-none absolute left-0 h-4 w-4 p-0.5 text-primary-foreground" />
	{/if}
</div>