<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms'
	import { Label, Input, Textarea } from '$lib/components/ui'
	import * as m from '$lib/paraglide/messages.js'
	
	interface Props {
		form: SuperForm<any>
		categories: Array<{
			id: string
			name: string
			icon: string
			slug: string
		}>
	}
	
	let { form, categories }: Props = $props()
	const { form: formData, errors } = form
</script>

<div class="space-y-5">
	<div>
		<Label for="title">
			{m.listing_title_label()} <span class="text-red-500">*</span>
		</Label>
		<Input
			id="title"
			bind:value={$formData.title}
			placeholder={m.listing_title_placeholder()}
			maxlength={80}
			class="mt-2"
			aria-invalid={$errors.title ? 'true' : undefined}
			inputmode="text"
			autocapitalize="sentences"
		/>
		{#if $errors.title}
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
		<Textarea
			id="description"
			bind:value={$formData.description}
			placeholder={m.listing_description_placeholder()}
			rows={4}
			maxlength={1000}
			class="mt-2 resize-none"
			aria-invalid={$errors.description ? 'true' : undefined}
			inputmode="text"
			autocapitalize="sentences"
		/>
		{#if $errors.description}
			<p class="text-sm text-red-500 mt-1">{$errors.description}</p>
		{/if}
		<p class="text-xs text-muted-foreground mt-1">
			{m.listing_description_characters({ count: ($formData.description || '').length })}
		</p>
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
	
	{#if $formData.category_id}
		<div>
			<Label for="subcategory">
				{m.listing_subcategory_label()}
			</Label>
			<Input
				id="subcategory"
				bind:value={$formData.subcategory_id}
				placeholder={m.listing_subcategory_placeholder()}
				class="mt-2"
			/>
		</div>
	{/if}
</div>