<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input, Textarea, Skeleton } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	
	interface Category {
		id: string
		name: string
		icon: string
		slug: string
	}
	
	interface Props {
		form: SuperForm<any>
		categories: Category[]
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
	
	let subcategories = $state<Category[]>([])
	let loadingSubcategories = $state(false)
	let touched = $state({
		title: false,
		description: false,
		category_id: false
	})
	
	// Track previous category to avoid infinite loops
	let previousCategoryId = $state<string | null>(null)
	
	// Watch for category changes and load subcategories
	$effect(() => {
		if ($formData.category_id !== previousCategoryId) {
			previousCategoryId = $formData.category_id
			
			if ($formData.category_id) {
				loadSubcategories($formData.category_id)
			} else {
				subcategories = []
				// Only clear subcategory if it was previously set
				if ($formData.subcategory_id) {
					$formData.subcategory_id = null
				}
			}
		}
	})
	
	async function loadSubcategories(categoryId: string) {
		loadingSubcategories = true
		try {
			const supabase = $page.data.supabase
			const { data, error } = await supabase
				.from('categories')
				.select('id, name, icon, slug')
				.eq('parent_id', categoryId)
				.eq('is_active', true)
				.order('display_order')
			
			if (error) {
				console.error('Failed to load subcategories:', error)
				subcategories = []
			} else {
				subcategories = data || []
			}
		} catch (error) {
			console.error('Failed to load subcategories:', error)
			subcategories = []
		} finally {
			loadingSubcategories = false
		}
	}
	
	// Real-time validation helpers
	function validateTitle(value: string) {
		if (!value || value.trim().length < 3) {
			return 'Title must be at least 3 characters'
		}
		if (value.trim().length > 100) {
			return 'Title must be less than 100 characters'
		}
		return null
	}
	
	function validateDescription(value: string) {
		if (!value || value.trim().length < 10) {
			return 'Description must be at least 10 characters'
		}
		if (value.trim().length > 2000) {
			return 'Description must be less than 2000 characters'
		}
		return null
	}
	
	function validateCategory(value: string) {
		if (!value) {
			return 'Please select a category'
		}
		return null
	}
</script>

<div class="space-y-5">
	<div>
		<Label for="title">
			{m.listing_title_label()} <span class="text-red-500">*</span>
		</Label>
		<div class="relative mt-2">
			<Input
				id="title"
				bind:value={$formData.title}
				placeholder={m.listing_title_placeholder()}
				maxlength={80}
				class="{touched.title && validateTitle($formData.title || '') ? 'border-red-500 pr-10' : touched.title && $formData.title ? 'border-green-500 pr-10' : ''}"
				aria-invalid={touched.title && validateTitle($formData.title || '') ? 'true' : undefined}
				inputmode="text"
				autocapitalize="sentences"
				onblur={() => touched.title = true}
			/>
			{#if touched.title}
				{#if validateTitle($formData.title || '')}
					<span class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">❌</span>
				{:else if $formData.title}
					<span class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✅</span>
				{/if}
			{/if}
		</div>
		{#if touched.title && validateTitle($formData.title || '')}
			<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
				<span class="text-xs">⚠️</span>
				{validateTitle($formData.title || '')}
			</p>
		{:else if $errors.title}
			<p class="text-sm text-red-500 mt-1">{$errors.title}</p>
		{/if}
		<p class="text-xs text-muted-foreground mt-1">
			{m.listing_title_characters({ count: ($formData.title || '').length })}
		</p>
	</div>
	
	<div>
		<Label for="description">
			{m.listing_description_label()} <span class="text-red-500">*</span>
		</Label>
		<div class="relative mt-2">
			<Textarea
				id="description"
				bind:value={$formData.description}
				placeholder={m.listing_description_placeholder()}
				rows={4}
				maxlength={1000}
				class="resize-none {touched.description && validateDescription($formData.description || '') ? 'border-red-500' : touched.description && $formData.description ? 'border-green-500' : ''}"
				aria-invalid={touched.description && validateDescription($formData.description || '') ? 'true' : undefined}
				inputmode="text"
				autocapitalize="sentences"
				onblur={() => touched.description = true}
			/>
			{#if touched.description}
				<span class="absolute right-3 top-3 text-sm">
					{#if validateDescription($formData.description || '')}
						❌
					{:else if $formData.description}
						✅
					{/if}
				</span>
			{/if}
		</div>
		{#if touched.description && validateDescription($formData.description || '')}
			<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
				<span class="text-xs">⚠️</span>
				{validateDescription($formData.description || '')}
			</p>
		{:else if $errors.description}
			<p class="text-sm text-red-500 mt-1">{$errors.description}</p>
		{/if}
		<div class="flex justify-between items-center mt-1">
			<p class="text-xs text-muted-foreground">
				{m.listing_description_characters({ count: ($formData.description || '').length })}
			</p>
			{#if ($formData.description || '').length > 800}
				<p class="text-xs text-orange-600">
					{1000 - ($formData.description || '').length} characters remaining
				</p>
			{/if}
		</div>
	</div>
	
	<div>
		<Label for="category">
			{m.listing_category_label()} <span class="text-red-500">*</span>
		</Label>
		<select
			id="category"
			bind:value={$formData.category_id}
			class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			aria-invalid={$errors.category_id ? 'true' : undefined}
		>
			<option value="">{m.listing_category_placeholder()}</option>
			{#each categories as category}
				<option value={category.id}>
					{category.icon} {category.name}
				</option>
			{/each}
		</select>
		{#if $errors.category_id}
			<p class="text-sm text-red-500 mt-1">{$errors.category_id}</p>
		{/if}
	</div>
	
	{#if $formData.category_id && subcategories.length > 0}
		<div>
			<Label for="subcategory">
				{m.listing_subcategory_label()}
			</Label>
			<select
				id="subcategory"
				bind:value={$formData.subcategory_id}
				class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={loadingSubcategories}
			>
				<option value="">{loadingSubcategories ? 'Loading...' : m.listing_subcategory_placeholder()}</option>
				{#each subcategories as subcategory}
					<option value={subcategory.id}>
						{subcategory.icon || ''} {subcategory.name}
					</option>
				{/each}
			</select>
			{#if $errors.subcategory_id}
				<p class="text-sm text-red-500 mt-1">{$errors.subcategory_id}</p>
			{/if}
		</div>
	{/if}
</div>