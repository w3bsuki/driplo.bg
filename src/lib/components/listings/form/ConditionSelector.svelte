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
	<Label class="text-sm font-medium text-gray-700 flex items-center gap-1">
		<span class="text-base">✨</span>
		Condition {#if required}<span class="text-red-500">*</span>{/if}
	</Label>
	
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
		{#each CONDITION_VALUES as condition}
			{@const config = getConditionConfig(condition)}
			<button
				type="button"
				onclick={() => handleSelect(condition)}
				class={cn(
					"relative p-3 rounded-xl border-2 transition-all duration-200",
					"flex flex-col items-center gap-2 group cursor-pointer",
					"hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
					value === condition 
						? "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-lg ring-4 ring-blue-100" 
						: "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
				)}
			>
				<!-- Subtle background glow when selected -->
				{#if value === condition}
					<div class="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100/30 to-transparent pointer-events-none" />
				{/if}
				
				<!-- Condition title with emoji -->
				<div class="relative z-10 text-center">
					<div class="text-2xl mb-1">
						{#if condition === 'new_with_tags'}
							🏷️
						{:else if condition === 'new_without_tags'}
							✨
						{:else if condition === 'very_good'}
							💎
						{:else if condition === 'good'}
							👍
						{:else if condition === 'fair'}
							💝
						{/if}
					</div>
					<div class={cn(
						"text-sm font-semibold transition-colors",
						value === condition ? "text-gray-900" : "text-gray-700"
					)}>
						{#if condition === 'new_with_tags'}
							New with tags
						{:else if condition === 'new_without_tags'}
							New without tags
						{:else if condition === 'very_good'}
							Very good
						{:else if condition === 'good'}
							Good
						{:else if condition === 'fair'}
							Fair
						{/if}
					</div>
				</div>
				
				<!-- Description text -->
				<span class={cn(
					"text-xs text-center transition-colors relative z-10",
					value === condition ? "text-gray-700 font-medium" : "text-gray-500"
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
					<div class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
						<Check class="w-3.5 h-3.5 text-white stroke-[3]" />
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	@keyframes zoom-in-50 {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	.animate-in {
		animation-duration: 200ms;
		animation-fill-mode: both;
	}
	
	.zoom-in-50 {
		animation-name: zoom-in-50;
	}
</style>