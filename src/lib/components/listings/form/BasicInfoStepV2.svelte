<script lang="ts">
	import { Info, AlertCircle } from 'lucide-svelte'
	import * as m from '$lib/paraglide/messages.js'
	import type { SuperForm } from 'sveltekit-superforms'
	import { cn } from '$lib/utils'
	
	interface Props {
		form: SuperForm<any>
		categories: any[]
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
	
	// Get subcategories for selected category
	const subcategories = $derived(
		categories.find(c => c.id === $formData.category)?.subcategories || []
	)
	
	// Character counter
	const titleLength = $derived($formData.title?.length || 0)
	const descriptionLength = $derived($formData.description?.length || 0)
</script>

<div class="space-y-6">
	<!-- Step Header -->
	<div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">{m.listing_step_basic_info()}</h2>
		<p class="text-gray-600">Tell buyers what you're selling - be specific and honest!</p>
	</div>
	
	<!-- Title Field -->
	<div class="space-y-2">
		<label for="title" class="block text-sm font-medium text-gray-900">
			{m.listing_title_label()} <span class="text-red-500">*</span>
		</label>
		<div class="relative">
			<input
				id="title"
				name="title"
				type="text"
				bind:value={$formData.title}
				placeholder={m.listing_title_placeholder()}
				maxlength="80"
				class={cn(
					"w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400",
					"focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
					"hover:border-gray-400",
					$errors.title && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
				)}
			/>
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
				{titleLength}/80
			</span>
		</div>
		{#if $errors.title}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.title}
			</p>
		{:else}
			<p class="text-xs text-gray-500">
				Include brand, model, size, and color for better visibility
			</p>
		{/if}
	</div>
	
	<!-- Category Selection -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Main Category -->
		<div class="space-y-2">
			<label for="category" class="block text-sm font-medium text-gray-900">
				{m.listing_category_label()} <span class="text-red-500">*</span>
			</label>
			<select
				id="category"
				name="category"
				bind:value={$formData.category}
				class={cn(
					"w-full px-4 py-3 border rounded-xl text-gray-900",
					"focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
					"hover:border-gray-400 cursor-pointer",
					$errors.category && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
				)}
			>
				<option value="">{m.listing_category_placeholder()}</option>
				{#each categories as category}
					<option value={category.id}>
						{category.icon || '📦'} {category.name}
					</option>
				{/each}
			</select>
			{#if $errors.category}
				<p class="text-sm text-red-600 flex items-center gap-1">
					<AlertCircle class="w-3 h-3" />
					{$errors.category}
				</p>
			{/if}
		</div>
		
		<!-- Subcategory -->
		<div class="space-y-2">
			<label for="subcategory" class="block text-sm font-medium text-gray-900">
				{m.listing_subcategory_label()}
			</label>
			<input
				id="subcategory"
				name="subcategory"
				type="text"
				bind:value={$formData.subcategory}
				placeholder={m.listing_subcategory_placeholder()}
				disabled={!$formData.category}
				class={cn(
					"w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400",
					"focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
					"hover:border-gray-400",
					"disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
					$errors.subcategory && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
				)}
			/>
			{#if $errors.subcategory}
				<p class="text-sm text-red-600 flex items-center gap-1">
					<AlertCircle class="w-3 h-3" />
					{$errors.subcategory}
				</p>
			{/if}
		</div>
	</div>
	
	<!-- Description Field -->
	<div class="space-y-2">
		<label for="description" class="block text-sm font-medium text-gray-900">
			{m.listing_description_label()} <span class="text-red-500">*</span>
		</label>
		<div class="relative">
			<textarea
				id="description"
				name="description"
				bind:value={$formData.description}
				placeholder={m.listing_description_placeholder()}
				rows="6"
				maxlength="1000"
				class={cn(
					"w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 resize-none",
					"focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
					"hover:border-gray-400",
					$errors.description && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
				)}
			></textarea>
			<span class="absolute right-3 bottom-3 text-xs text-gray-500">
				{descriptionLength}/1000
			</span>
		</div>
		{#if $errors.description}
			<p class="text-sm text-red-600 flex items-center gap-1">
				<AlertCircle class="w-3 h-3" />
				{$errors.description}
			</p>
		{/if}
		
		<!-- Description Tips -->
		<div class="bg-blue-50 rounded-lg p-3 space-y-2">
			<div class="flex items-start gap-2">
				<Info class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
				<div class="text-sm text-blue-800 space-y-1">
					<p class="font-medium">Tips for a great description:</p>
					<ul class="list-disc list-inside space-y-0.5 text-xs">
						<li>Mention any flaws, wear, or defects</li>
						<li>Include measurements and fit information</li>
						<li>Describe the material and care instructions</li>
						<li>Explain why you're selling</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>