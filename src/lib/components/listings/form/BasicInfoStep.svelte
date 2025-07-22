<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input, Textarea, Skeleton } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	import { page } from '$app/stores'
	import { formTokens, designTokens } from '$lib/design-tokens'
	import { cn } from '$lib/utils'
	
	interface Category {
		id: string
		name: string
		icon: string
		slug: string
	}
	
	interface Props {
		form: SuperForm<any>
		categories: Category[]
		isMobile?: boolean
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

<div class={formTokens.form.section}>
	<!-- Title Field -->
	<div class={formTokens.fieldGroup.withHelper}>
		<Label for="title" class={formTokens.label.base}>
			<span class="text-lg">✏️</span>
			{m.listing_title_label()} <span class={formTokens.label.required}>*</span>
		</Label>
		<div class="relative">
			<Input
				id="title"
				bind:value={$formData.title}
				placeholder={m.listing_title_placeholder()}
				maxlength={80}
				class={cn(
					formTokens.input.base,
					touched.title && validateTitle($formData.title || '') 
						? formTokens.input.error
						: touched.title && $formData.title 
							? formTokens.input.success 
							: ""
				)}
				aria-invalid={touched.title && validateTitle($formData.title || '') ? 'true' : undefined}
				inputmode="text"
				autocapitalize="sentences"
				onblur={() => touched.title = true}
			/>
		</div>
		<div class="flex items-center justify-between">
			<p class={cn(designTokens.fontSize.sm, "text-gray-500")}>
				{($formData.title || '').length}/80
			</p>
			{#if touched.title && validateTitle($formData.title || '')}
				<p class={formTokens.label.error}>
					{validateTitle($formData.title || '')}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Description Field -->
	<div class={formTokens.fieldGroup.withHelper}>
		<Label for="description" class={formTokens.label.base}>
			<span class="text-lg">📝</span>
			{m.listing_description_label()} <span class={formTokens.label.required}>*</span>
		</Label>
		<Textarea
			id="description"
			bind:value={$formData.description}
			placeholder={m.listing_description_placeholder()}
			rows={3}
			maxlength={1000}
			class={cn(
				formTokens.textarea.base,
				touched.description && validateDescription($formData.description || '') 
					? formTokens.input.error
					: touched.description && $formData.description 
						? formTokens.input.success 
						: ""
			)}
			aria-invalid={touched.description && validateDescription($formData.description || '') ? 'true' : undefined}
			inputmode="text"
			autocapitalize="sentences"
			onblur={() => touched.description = true}
		/>
		<div class="flex items-center justify-between">
			<p class={cn(designTokens.fontSize.sm, "text-gray-500")}>
				{($formData.description || '').length}/1000
			</p>
			{#if touched.description && validateDescription($formData.description || '')}
				<p class={formTokens.label.error}>
					{validateDescription($formData.description || '')}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Category Field -->
	<div class={formTokens.fieldGroup.base}>
		<Label for="category" class={formTokens.label.base}>
			<span class="text-lg">🏷️</span>
			{m.listing_category_label()} <span class={formTokens.label.required}>*</span>
		</Label>
		<select
			id="category"
			bind:value={$formData.category_id}
			class={cn(
				formTokens.select.base,
				$errors.category_id && formTokens.input.error
			)}
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
			<p class={formTokens.label.error}>{$errors.category_id}</p>
		{/if}
	</div>
	
	<!-- Subcategory Field -->
	{#if $formData.category_id && subcategories.length > 0}
		<div class={cn(formTokens.fieldGroup.base, "animate-in fade-in slide-in-from-bottom-2 duration-200")}>
			<Label for="subcategory" class={formTokens.label.base}>
				<span class="text-lg">📋</span>
				{m.listing_subcategory_label()}
			</Label>
			<select
				id="subcategory"
				bind:value={$formData.subcategory_id}
				class={cn(
					formTokens.select.base,
					$errors.subcategory_id && formTokens.input.error
				)}
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
				<p class={formTokens.label.error}>{$errors.subcategory_id}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes slide-in-from-bottom-2 {
		from {
			transform: translateY(0.5rem);
		}
		to {
			transform: translateY(0);
		}
	}
	
	.animate-in {
		animation-duration: 200ms;
		animation-fill-mode: both;
	}
	
	.fade-in {
		animation-name: fade-in;
	}
	
	.slide-in-from-bottom-2 {
		animation-name: slide-in-from-bottom-2;
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>