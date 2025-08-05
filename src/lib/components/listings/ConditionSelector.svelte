<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		value?: string
		class?: string
	}
	
	let { 
		value = $bindable('new_with_tags'),
		class: className = ''
	}: Props = $props()
	
	const conditions = [
		{ value: 'new_with_tags', label: 'New with tags', icon: '🏷️' },
		{ value: 'new_without_tags', label: 'New without tags', icon: '✨' },
		{ value: 'very_good', label: 'Very good', icon: '⭐' },
		{ value: 'good', label: 'Good', icon: '👍' },
		{ value: 'fair', label: 'Fair', icon: '👌' }
	]
</script>

<select
	bind:value
	class={cn(
		"flex h-9 w-full rounded-md border border-gray-300",
		"bg-white px-3 py-1 text-sm shadow-sm",
		"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
>
	{#each conditions as condition}
		<option value={condition.value}>
			{condition.icon} {condition.label}
		</option>
	{/each}
</select>