<script lang="ts">
	import { cn } from '$lib/utils'
	import { Check } from 'lucide-svelte'
	
	interface Props {
		value?: string | null
		onchange?: (color: string) => void
		label?: string
		required?: boolean
		class?: string
	}
	
	let { value = $bindable(), onchange, label, required = false, class: className }: Props = $props()
	
	// Popular clothing colors using design tokens
	const colors = [
		{ name: 'Black', value: 'var(--color-product-black)', emoji: '⚫' },
		{ name: 'White', value: 'var(--color-product-white)', emoji: '⚪' },
		{ name: 'Gray', value: 'var(--color-product-gray)', emoji: '🩶' },
		{ name: 'Navy', value: 'var(--color-product-navy)', emoji: '🔵' },
		{ name: 'Blue', value: 'var(--color-product-blue)', emoji: '💙' },
		{ name: 'Red', value: 'var(--color-product-red)', emoji: '❤️' },
		{ name: 'Pink', value: 'var(--color-product-pink)', emoji: '💗' },
		{ name: 'Green', value: 'var(--color-product-green)', emoji: '💚' },
		{ name: 'Yellow', value: 'var(--color-product-yellow)', emoji: '💛' },
		{ name: 'Orange', value: 'var(--color-product-orange)', emoji: '🧡' },
		{ name: 'Purple', value: 'var(--color-product-purple)', emoji: '💜' },
		{ name: 'Brown', value: 'var(--color-product-brown)', emoji: '🤎' },
		{ name: 'Beige', value: 'var(--color-product-beige)', emoji: '🟤' },
		{ name: 'Multi', value: 'multi', emoji: '🌈' },
	]
	
	function handleSelect(color: typeof colors[0]) {
		value = color.value
		onchange?.(color.value)
	}
	
	// Helper to determine if we need dark or light text
	function needsDarkText(colorValue: string): boolean {
		if (colorValue === 'multi') return false
		if (colorValue === 'var(--color-product-white)') return true
		if (colorValue === 'var(--color-product-yellow)') return true
		if (colorValue === 'var(--color-product-beige)') return true
		return false
	}
</script>

<div class={cn("space-y-2", className)}>
	{#if label}
		<label class="block text-sm font-medium text-gray-700">
			<span class="text-lg">🎨</span>
			{label}
			{#if required}<span class="text-red-500 ml-1">*</span>{/if}
		</label>
	{/if}
	
	<div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
		{#each colors as color}
			<button
				type="button"
				onclick={() => handleSelect(color)}
				class={cn(
					"relative group aspect-square rounded-xl border-2 transition-all duration-200",
					"flex flex-col items-center justify-center p-2",
					"hover:scale-105 active:scale-95",
					value === color.value 
						? "ring-2 ring-offset-2 ring-blue-500 shadow-lg" 
						: "hover:shadow-md"
				)}
				style={color.value !== 'multi' ? `background-color: ${color.value}` : 'background: linear-gradient(to br, var(--color-product-red), var(--color-product-yellow), var(--color-product-green), var(--color-product-blue), var(--color-product-purple))'}
				aria-label={`Select ${color.name}`}
			>
				<!-- Emoji indicator -->
				<span class="text-2xl mb-1 drop-shadow-sm">
					{color.emoji}
				</span>
				
				<!-- Color name -->
				<span class={cn(
					"text-xs font-medium",
					needsDarkText(color.value) ? "text-gray-900" : "text-white",
					"drop-shadow-sm"
				)}>
					{color.name}
				</span>
				
				<!-- Selected checkmark -->
				{#if value === color.value}
					<div class={cn(
						"absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
						"bg-blue-500 text-white shadow-md animate-in zoom-in-50 duration-200"
					)}>
						<Check class="w-3.5 h-3.5 stroke-[3]" />
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