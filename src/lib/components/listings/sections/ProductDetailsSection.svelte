<script lang="ts">
	import { Package } from 'lucide-svelte'
	import FormSection from '$lib/components/ui/form-section.svelte'
	import { Input, Label } from '$lib/components/native'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import CategorySelector from '../CategorySelector.svelte'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		title: string
		description: string
		categoryId?: string
		subcategoryId?: string
		categories: Category[]
		errors?: Record<string, string[]>
		onCategoryChange?: (categoryId: string) => void
	}
	
	let { 
		title = $bindable(''),
		description = $bindable(''),
		categoryId = $bindable(),
		subcategoryId = $bindable(),
		categories = [],
		errors = {},
		onCategoryChange
	}: Props = $props()
</script>

<FormSection title="Product Details" icon={Package}>
	<div class="grid gap-4">
		<!-- Title -->
		<div class="space-y-2">
			<Label for="title">
				Title <span class="text-red-500">*</span>
			</Label>
			<Input
				id="title"
				bind:value={title}
				placeholder="e.g., Nike Air Max 90 - Black - Size 10"
				maxlength={100}
				aria-invalid={!!errors.title}
				aria-describedby={errors.title ? "title-error" : undefined}
			/>
			{#if errors.title}
				<p id="title-error" class="text-sm text-red-500">
					{errors.title[0]}
				</p>
			{/if}
			<p class="text-xs text-gray-500">{title.length}/100</p>
		</div>
		
		<!-- Category -->
		<div class="space-y-2">
			<Label>
				Category <span class="text-red-500">*</span>
			</Label>
			<CategorySelector
				bind:value={categoryId}
				{categories}
				onchange={onCategoryChange}
			/>
			{#if errors.category_id}
				<p class="text-sm text-red-500">
					{errors.category_id[0]}
				</p>
			{/if}
		</div>
		
		<!-- Description -->
		<div class="space-y-2">
			<Label for="description">
				Description <span class="text-red-500">*</span>
			</Label>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="Describe your item..."
				rows={4}
				maxlength={2000}
				aria-invalid={!!errors.description}
			/>
			{#if errors.description}
				<p class="text-sm text-red-500">
					{errors.description[0]}
				</p>
			{/if}
			<p class="text-xs text-gray-500">{description.length}/2000</p>
		</div>
	</div>
</FormSection>