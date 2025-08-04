<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema } from '$lib/schemas/listing'
	import { toast } from 'svelte-sonner'
	import { Camera, Package, DollarSign, MapPin, Tag } from 'lucide-svelte'
	import Button from '$lib/components/ui/button.svelte'
	import ImageUpload from '$lib/components/ui/image-upload.svelte'
	import FormSection from '$lib/components/ui/form-section.svelte'
	import ProductDetailsSection from './sections/ProductDetailsSection.svelte'
	import PricingSection from './sections/PricingSection.svelte'
	import ShippingSection from './sections/ShippingSection.svelte'
	import TagsSection from './sections/TagsSection.svelte'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		data: any
		categories: Category[]
		hasPaymentAccount?: boolean
	}
	
	let { data, categories = [], hasPaymentAccount = false }: Props = $props()
	
	let isSubmitting = $state(false)
	
	const { form, enhance, errors } = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Your listing is live!')
			} else if (result.type === 'failure') {
				toast.error('Failed to create listing')
				isSubmitting = false
			}
		}
	})
	
	function handleSubmit(e: SubmitEvent) {
		if (!hasPaymentAccount) {
			e.preventDefault()
			toast.error('Please set up your payment account first')
			return
		}
		
		if (!$form.images?.length) {
			e.preventDefault()
			toast.error('Please add at least one photo')
			return
		}
		
		isSubmitting = true
	}
	
	async function loadSubcategories(categoryId: string) {
		// Load subcategories when category changes
		console.log('Loading subcategories for:', categoryId)
	}
</script>

<form 
	method="POST" 
	action="/sell?/create" 
	use:enhance
	onsubmit={handleSubmit}
	class="space-y-8"
>
	<!-- Images -->
	<FormSection title="Photos" icon={Camera}>
		<ImageUpload 
			bind:images={$form.images}
			maxImages={10}
			maxSize={5}
		/>
	</FormSection>
	
	<!-- Product Details -->
	<ProductDetailsSection
		bind:title={$form.title}
		bind:description={$form.description}
		bind:categoryId={$form.category_id}
		bind:subcategoryId={$form.subcategory_id}
		{categories}
		errors={$errors}
		onCategoryChange={loadSubcategories}
	/>
	
	<!-- Pricing -->
	<PricingSection
		bind:price={$form.price}
		bind:condition={$form.condition}
		bind:color={$form.color}
		bind:brand={$form.brand}
		bind:size={$form.size}
		errors={$errors}
	/>
	
	<!-- Shipping -->
	<ShippingSection
		bind:locationCity={$form.location_city}
		bind:shippingType={$form.shipping_type}
		bind:shippingCost={$form.shipping_cost}
		bind:shipsWorldwide={$form.ships_worldwide}
		errors={$errors}
	/>
	
	<!-- Tags -->
	<TagsSection bind:tags={$form.tags} />
	
	<!-- Actions -->
	<div class="flex items-center justify-end gap-4 pt-4">
		<Button
			type="button"
			variant="outline"
			onclick={() => window.history.back()}
		>
			Cancel
		</Button>
		
		<Button
			type="submit"
			disabled={isSubmitting || !hasPaymentAccount}
		>
			{isSubmitting ? 'Publishing...' : 'Publish Listing'}
		</Button>
	</div>
	
	{#if !hasPaymentAccount}
		<div class="rounded-lg bg-warning/10 border border-warning p-4">
			<p class="text-sm">
				Set up your payment account to start selling.
				<a href="/profile/settings" class="font-medium underline">
					Set up now
				</a>
			</p>
		</div>
	{/if}
</form>