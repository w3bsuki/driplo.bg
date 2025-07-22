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
	
	// Get current locale
	const locale = $derived($page.data.locale || 'en')
	
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
	
	// Cyrillic regex for Bulgarian validation
	const cyrillicRegex = /[\u0400-\u04FF]/
	const hasCyrillic = (text: string) => cyrillicRegex.test(text)
	
	// Real-time validation helpers
	function validateTitle(value: string) {
		if (!value || value.trim().length < 3) {
			return 'Title must be at least 3 characters'
		}
		if (value.trim().length > 100) {
			return 'Title must be less than 100 characters'
		}
		// Bulgarian locale validation
		if (locale === 'bg' && value.trim().length > 0 && !hasCyrillic(value)) {
			return 'Заглавието трябва да бъде на български език'
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
		// Bulgarian locale validation
		if (locale === 'bg' && value.trim().length > 0 && !hasCyrillic(value)) {
			return 'Описанието трябва да бъде на български език'
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

<div class="space-y-[var(--space-3)]">
	<!-- Title Field -->
	<div class="space-y-[var(--space-1)]">
		<Label for="title" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_title_label()} <span class="text-[var(--color-error-main)]">*</span>
		</Label>
		<div class="relative">
			<Input
				id="title"
				bind:value={$formData.title}
				placeholder={m.listing_title_placeholder()}
				maxlength={80}
				class="input-size-md {touched.title && validateTitle($formData.title || '') ? 'border-[var(--color-error-light)] focus:border-[var(--color-error-main)] focus:ring-[var(--color-error-main)]' : touched.title && $formData.title ? 'border-[var(--color-success-light)] focus:border-[var(--color-success-main)] focus:ring-[var(--color-success-main)]' : 'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]'} rounded-[var(--radius-lg)]"
				aria-invalid={touched.title && validateTitle($formData.title || '') ? 'true' : undefined}
				inputmode="text"
				autocapitalize="sentences"
				onblur={() => touched.title = true}
			/>
		</div>
		<div class="flex items-center justify-between">
			<p class="text-[var(--text-xs)] text-[var(--color-neutral-500)]">
				{($formData.title || '').length}/80
			</p>
			{#if touched.title && validateTitle($formData.title || '')}
				<p class="text-[var(--text-xs)] text-[var(--color-error-main)]">
					{validateTitle($formData.title || '')}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Description Field -->
	<div class="space-y-[var(--space-1)]">
		<Label for="description" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_description_label()} <span class="text-[var(--color-error-main)]">*</span>
		</Label>
		<Textarea
			id="description"
			bind:value={$formData.description}
			placeholder={m.listing_description_placeholder()}
			rows={3}
			maxlength={1000}
			class="resize-none text-[var(--text-sm)] {touched.description && validateDescription($formData.description || '') ? 'border-[var(--color-error-light)] focus:border-[var(--color-error-main)] focus:ring-[var(--color-error-main)]' : touched.description && $formData.description ? 'border-[var(--color-success-light)] focus:border-[var(--color-success-main)] focus:ring-[var(--color-success-main)]' : 'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]'} rounded-[var(--radius-lg)]"
			aria-invalid={touched.description && validateDescription($formData.description || '') ? 'true' : undefined}
			inputmode="text"
			autocapitalize="sentences"
			onblur={() => touched.description = true}
		/>
		<div class="flex items-center justify-between">
			<p class="text-[var(--text-xs)] text-[var(--color-neutral-500)]">
				{($formData.description || '').length}/1000
			</p>
			{#if touched.description && validateDescription($formData.description || '')}
				<p class="text-[var(--text-xs)] text-[var(--color-error-main)]">
					{validateDescription($formData.description || '')}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Category Field -->
	<div class="space-y-[var(--space-1)]">
		<Label for="category" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
			{m.listing_category_label()} <span class="text-[var(--color-error-main)]">*</span>
		</Label>
		<select
			id="category"
			bind:value={$formData.category_id}
			class="flex input-size-md w-full rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-0)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] disabled:cursor-not-allowed disabled:opacity-50"
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
			<p class="text-[var(--text-xs)] text-[var(--color-error-main)] mt-[var(--space-1)]">{$errors.category_id}</p>
		{/if}
	</div>
	
	<!-- Subcategory Field -->
	{#if $formData.category_id && subcategories.length > 0}
		<div class="space-y-[var(--space-1)]">
			<Label for="subcategory" class="text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-neutral-700)]">
				{m.listing_subcategory_label()}
			</Label>
			<select
				id="subcategory"
				bind:value={$formData.subcategory_id}
				class="flex input-size-md w-full rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-0)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] disabled:cursor-not-allowed disabled:opacity-50"
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
				<p class="text-[var(--text-xs)] text-[var(--color-error-main)] mt-[var(--space-1)]">{$errors.subcategory_id}</p>
			{/if}
		</div>
	{/if}
</div>