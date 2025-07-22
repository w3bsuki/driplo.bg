<script lang="ts">
	import { Label, Input } from '$lib/components/ui'
	import { cn } from '$lib/utils'
	import { Check, Plus } from 'lucide-svelte'
	import { tokens } from '$lib/design-system/tokens'
	
	interface Props {
		value: string | null | undefined
		onchange?: (value: string) => void
		required?: boolean
		class?: string
	}
	
	let { value = $bindable(), onchange, required = false, class: className }: Props = $props()
	
	let showCustom = $state(false)
	let customColor = $state('')
	
	const COLOR_GROUPS = {
		basics: [
			{ name: 'Black', hex: tokens.colors.neutral[950] },
			{ name: 'White', hex: tokens.colors.neutral[0] },
			{ name: 'Gray', hex: tokens.colors.neutral[500] },
			{ name: 'Beige', hex: '#D4A574' },
			{ name: 'Brown', hex: '#92400E' },
			{ name: 'Navy', hex: tokens.colors.brand[900] }
		],
		vibrant: [
			{ name: 'Red', hex: tokens.colors.semantic.error.main },
			{ name: 'Pink', hex: tokens.colors.accent.pink.main },
			{ name: 'Orange', hex: '#F97316' },
			{ name: 'Yellow', hex: tokens.colors.semantic.warning.main },
			{ name: 'Green', hex: tokens.colors.semantic.success.main },
			{ name: 'Blue', hex: tokens.colors.brand[500] },
			{ name: 'Purple', hex: tokens.colors.accent.purple.main },
			{ name: 'Cyan', hex: tokens.colors.accent.cyan.main }
		]
	}
	
	function handleSelect(colorName: string) {
		value = colorName
		onchange?.(colorName)
	}
	
	function handleCustomColor() {
		if (customColor.trim()) {
			value = customColor.trim()
			onchange?.(customColor.trim())
			customColor = ''
			showCustom = false
		}
	}
	
	const allColors = $derived([...COLOR_GROUPS.basics, ...COLOR_GROUPS.vibrant])
	const selectedColor = $derived(allColors.find(c => c.name === value))
</script>

<div class={cn("space-y-3", className)}>
	<Label class="text-sm font-medium text-neutral-700">
		Color {#if required}<span class="text-red-500">*</span>{/if}
	</Label>
	
	<!-- Compact grid for all colors -->
	<div class="grid grid-cols-8 sm:grid-cols-10 gap-2">
		{#each allColors as color}
			<button
				type="button"
				onclick={() => handleSelect(color.name)}
				class={cn(
					"group relative rounded-lg transition-all duration-200",
					"hover:scale-110 hover:shadow-md",
					value === color.name && "ring-2 ring-brand-500 ring-offset-2 scale-110 shadow-md"
				)}
				title={color.name}
			>
				<div 
					class="w-10 h-10 rounded-lg border-2 border-neutral-200"
					style="background-color: {color.hex}"
				>
					{#if value === color.name}
						<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
							<Check class="w-4 h-4 text-white drop-shadow-md" />
						</div>
					{/if}
				</div>
			</button>
		{/each}
		
		<!-- Add custom color button -->
		<button
			type="button"
			onclick={() => showCustom = true}
			class={cn(
				"w-10 h-10 rounded-lg border-2 border-dashed transition-all duration-200",
				"flex items-center justify-center group",
				showCustom 
					? "border-brand-500 bg-brand-50" 
					: "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
			)}
			title="Add custom color"
		>
			<Plus class="w-4 h-4 text-neutral-500 group-hover:text-neutral-700" />
		</button>
	</div>
	
	<!-- Selected color display -->
	{#if value && !selectedColor}
		<div class="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
			<div class="w-6 h-6 rounded bg-gradient-to-br from-neutral-300 to-neutral-400 border border-neutral-300" />
			<span class="text-sm font-medium text-neutral-700">{value}</span>
		</div>
	{:else if selectedColor}
		<div class="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
			<div 
				class="w-6 h-6 rounded border border-neutral-300"
				style="background-color: {selectedColor.hex}"
			/>
			<span class="text-sm font-medium text-neutral-700">{selectedColor.name}</span>
		</div>
	{/if}
	
	<!-- Custom color input -->
	{#if showCustom}
		<div class="flex gap-2 animate-in slide-in-from-top-2 duration-200">
			<Input
				bind:value={customColor}
				placeholder="Enter custom color (e.g., Teal, Maroon)"
				class="flex-1 h-9 text-sm"
				onkeydown={(e) => e.key === 'Enter' && handleCustomColor()}
			/>
			<button
				type="button"
				onclick={handleCustomColor}
				disabled={!customColor.trim()}
				class={cn(
					"px-3 h-9 text-sm font-medium rounded-lg transition-colors",
					customColor.trim()
						? "bg-brand-500 text-white hover:bg-brand-600"
						: "bg-neutral-200 text-neutral-400 cursor-not-allowed"
				)}
			>
				Add
			</button>
			<button
				type="button"
				onclick={() => { showCustom = false; customColor = '' }}
				class="px-3 h-9 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
			>
				Cancel
			</button>
		</div>
	{/if}
</div>