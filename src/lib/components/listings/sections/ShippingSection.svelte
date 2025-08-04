<script lang="ts">
	import { MapPin, Truck } from 'lucide-svelte'
	import FormSection from '$lib/components/ui/form-section.svelte'
	import { Input, Label } from '$lib/components/native'
	import Checkbox from '$lib/components/ui/checkbox.svelte'
	
	interface Props {
		locationCity?: string
		shippingType?: string
		shippingCost?: number
		shipsWorldwide?: boolean
		errors?: Record<string, string[]>
	}
	
	let { 
		locationCity = $bindable(''),
		shippingType = $bindable('standard'),
		shippingCost = $bindable(0),
		shipsWorldwide = $bindable(false),
		errors = {}
	}: Props = $props()
	
	const shippingTypes = [
		{ value: 'standard', label: 'Standard delivery', icon: '📮' },
		{ value: 'express', label: 'Express delivery', icon: '⚡' },
		{ value: 'pickup', label: 'Pickup only', icon: '🚶' }
	]
</script>

<FormSection title="Location & Shipping" icon={Truck}>
	<div class="grid sm:grid-cols-2 gap-4">
		<!-- Location -->
		<div class="space-y-2">
			<Label for="location">
				Your City <span class="text-destructive">*</span>
			</Label>
			<div class="relative">
				<MapPin class="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
				<Input
					id="location"
					bind:value={locationCity}
					placeholder="e.g., Sofia"
					class="pl-9"
				/>
			</div>
			{#if errors.location_city}
				<p class="text-sm text-destructive">{errors.location_city[0]}</p>
			{/if}
		</div>
		
		<!-- Shipping Type -->
		<div class="space-y-2">
			<Label for="shipping-type">Shipping Method</Label>
			<select
				id="shipping-type"
				bind:value={shippingType}
				class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
			>
				{#each shippingTypes as type}
					<option value={type.value}>
						{type.icon} {type.label}
					</option>
				{/each}
			</select>
		</div>
		
		<!-- Shipping Cost -->
		{#if shippingType !== 'pickup'}
			<div class="space-y-2">
				<Label for="shipping-cost">
					Shipping Cost <span class="text-muted-foreground">(BGN)</span>
				</Label>
				<Input
					id="shipping-cost"
					type="number"
					bind:value={shippingCost}
					placeholder="0.00"
					min="0"
					step="0.01"
				/>
				<p class="text-xs text-muted-foreground">Leave 0 for free shipping</p>
			</div>
			
			<!-- Ships Worldwide -->
			<div class="flex items-center space-x-2">
				<Checkbox
					id="worldwide"
					bind:checked={shipsWorldwide}
				/>
				<Label for="worldwide" class="text-sm font-normal cursor-pointer">
					Ships worldwide 🌍
				</Label>
			</div>
		{/if}
	</div>
</FormSection>