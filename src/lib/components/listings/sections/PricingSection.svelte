<script lang="ts">
	import { DollarSign } from 'lucide-svelte'
	import FormSection from '$lib/components/ui/form-section.svelte'
	import Input from '$lib/components/ui/input.svelte'
	import { Label } from '$lib/components/ui'
	import ConditionSelector from '../ConditionSelector.svelte'
	
	interface Props {
		price?: number
		condition?: string
		color?: string
		brand?: string
		size?: string
		errors?: Record<string, string[]>
	}
	
	let { 
		price = $bindable(),
		condition = $bindable('new_with_tags'),
		color = $bindable(''),
		brand = $bindable(''),
		size = $bindable(''),
		errors = {}
	}: Props = $props()
</script>

<FormSection title="Pricing & Details" icon={DollarSign}>
	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<!-- Price -->
		<div class="space-y-2">
			<Label for="price">
				Price <span class="text-destructive">*</span>
			</Label>
			<div class="relative">
				<DollarSign class="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
				<Input
					id="price"
					type="number"
					bind:value={price}
					placeholder="0.00"
					min="0"
					step="0.01"
					class="pl-9"
				/>
			</div>
			{#if errors.price}
				<p class="text-sm text-destructive">{errors.price[0]}</p>
			{/if}
		</div>
		
		<!-- Condition -->
		<div class="space-y-2">
			<Label>
				Condition <span class="text-destructive">*</span>
			</Label>
			<ConditionSelector bind:value={condition} />
			{#if errors.condition}
				<p class="text-sm text-destructive">{errors.condition[0]}</p>
			{/if}
		</div>
		
		<!-- Color -->
		<div class="space-y-2">
			<Label for="color">
				Color <span class="text-destructive">*</span>
			</Label>
			<Input
				id="color"
				bind:value={color}
				placeholder="e.g., Black"
			/>
			{#if errors.color}
				<p class="text-sm text-destructive">{errors.color[0]}</p>
			{/if}
		</div>
		
		<!-- Brand -->
		<div class="space-y-2">
			<Label for="brand">Brand</Label>
			<Input
				id="brand"
				bind:value={brand}
				placeholder="e.g., Nike"
			/>
		</div>
		
		<!-- Size -->
		<div class="space-y-2">
			<Label for="size">Size</Label>
			<Input
				id="size"
				bind:value={size}
				placeholder="e.g., M, 10"
			/>
		</div>
	</div>
</FormSection>