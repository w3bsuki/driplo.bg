<script lang="ts">
	import { CONDITION_VALUES, getConditionConfig } from '$lib/config/conditions'
	import ConditionBadge from '$lib/components/badges/ConditionBadge.svelte'
	import { Label } from '$lib/components/ui'
	import { cn } from '$lib/utils'
	import { Check } from 'lucide-svelte'
	
	interface Props {
		value: string | null | undefined
		onchange?: (value: string) => void
		required?: boolean
		class?: string
	}
	
	let { value = $bindable(), onchange, required = false, class: className }: Props = $props()
	
	function handleSelect(condition: string) {
		value = condition
		onchange?.(condition)
	}
</script>

<div class={cn("space-y-3", className)}>
	<Label class="text-sm font-medium text-neutral-700">
		Condition {#if required}<span class="text-red-500">*</span>{/if}
	</Label>
	
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
		{#each CONDITION_VALUES as condition}
			{@const config = getConditionConfig(condition)}
			<button
				type="button"
				onclick={() => handleSelect(condition)}
				class={cn(
					"relative p-4 rounded-xl border-2 transition-all duration-200",
					"flex flex-col items-center gap-2 group",
					"hover:shadow-md hover:scale-[1.02]",
					value === condition 
						? "border-brand-500 bg-gradient-to-br from-brand-50 to-white shadow-md scale-[1.02]" 
						: "border-neutral-200 hover:border-neutral-300 bg-white"
				)}
			>
				<!-- Subtle background glow when selected -->
				{#if value === condition}
					<div class="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-100/20 to-transparent" />
				{/if}
				
				<!-- Condition badge -->
				<div class="relative z-10">
					<ConditionBadge {condition} size="md" />
				</div>
				
				<!-- Description text -->
				<span class={cn(
					"text-xs text-center transition-colors relative z-10",
					value === condition ? "text-neutral-800 font-medium" : "text-neutral-600"
				)}>
					{#if condition === 'new_with_tags'}
						Brand new, unworn
					{:else if condition === 'new_without_tags'}
						New, no tags
					{:else if condition === 'very_good'}
						Gently used
					{:else if condition === 'good'}
						Some wear
					{:else if condition === 'fair'}
						Well loved
					{/if}
				</span>
				
				<!-- Selected indicator -->
				{#if value === condition}
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
						<Check class="w-3 h-3 text-white" />
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>