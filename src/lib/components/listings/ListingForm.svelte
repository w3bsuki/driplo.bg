<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema } from '$lib/schemas/listing'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/stores'
	import { user } from '$lib/stores/auth'
	import { Camera, Package, DollarSign, MapPin, Tag, AlertCircle, Loader2 } from 'lucide-svelte'
	import { Button, Input, Label } from '$lib/components/native'
	import { FormField, FormLabel, FormControl, FormMessage } from '$lib/components/ui/form'
	import ImageUploadSection from './sections/ImageUploadSection.svelte'
	import ProductDetailsSection from './sections/ProductDetailsSection.svelte'
	import PricingSection from './sections/PricingSection.svelte'
	import ShippingSection from './sections/ShippingSection.svelte'
	import TagsSection from './sections/TagsSection.svelte'
	import CategorySelector from './CategorySelector.svelte'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		data: any
		categories: Category[]
		hasPaymentAccount?: boolean
	}
	
	let { data, categories = [], hasPaymentAccount = false }: Props = $props()
	
	let isSubmitting = $state(false)
	
	const { form, enhance, errors, constraints } = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		id: 'listing-form',
		warnings: {
			duplicateId: false
		},
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('🎉 Your listing is live!')
			} else if (result.type === 'failure') {
				const error = result.data?.error
				toast.error(error || 'Failed to create listing')
				isSubmitting = false
			}
		}
	})
	
	// Get Supabase client from data prop (passed from page)
	const supabase = $derived(data.supabase || $page.data.supabase)
	
	function handleSubmit(e: SubmitEvent) {
		if (!hasPaymentAccount) {
			e.preventDefault()
			toast.error('Please set up your payment account first')
			return
		}
		
		if (!$form.images?.length) {
			e.preventDefault()
			toast.error('Please add at least one photo')
			document.querySelector('#images-section')?.scrollIntoView({ behavior: 'smooth' })
			return
		}
		
		isSubmitting = true
	}
	
	// Handle image changes from upload section
	function handleImagesChange(images: string[]) {
		$form.images = images
	}
</script>

<form 
	method="POST" 
	action="/sell?/create" 
	use:enhance
	onsubmit={handleSubmit}
	class="space-y-8"
>
	<!-- Images Section -->
	<section id="images-section" class="bg-white rounded-lg border p-6">
		<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<Camera class="w-5 h-5" />
			Photos
		</h2>
		<ImageUploadSection 
			bind:images={$form.images}
			maxImages={10}
			onImagesChange={handleImagesChange}
			{supabase}
			userId={$user?.id}
		/>
	</section>
	
	<!-- Product Details Section -->
	<section class="bg-white rounded-lg border p-6">
		<h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
			<Package class="w-5 h-5" />
			Product Details
		</h2>
		
		<div class="space-y-6">
			<!-- Title -->
			<FormField name="title">
				<FormLabel htmlFor="title" required>Title</FormLabel>
				<FormControl>
					<Input
						id="title"
						bind:value={$form.title}
						placeholder="e.g., Nike Air Max 90 - Black - Size 10"
						maxlength={100}
						{...$constraints.title}
					/>
				</FormControl>
				<FormMessage error={$errors.title} />
				<p class="text-xs text-gray-500 mt-1">{$form.title.length}/100</p>
			</FormField>
			
			<!-- Category -->
			<FormField name="category_id">
				<FormLabel required>Category</FormLabel>
				<CategorySelector
					bind:value={$form.category_id}
					{categories}
					placeholder="Select a category"
				/>
				<FormMessage error={$errors.category_id} />
			</FormField>
			
			<!-- Description -->
			<FormField name="description">
				<FormLabel htmlFor="description" required>Description</FormLabel>
				<FormControl>
					<Textarea
						id="description"
						bind:value={$form.description}
						rows={4}
						placeholder="Describe your item - include condition details, measurements, any flaws..."
						maxlength={2000}
						class="resize-none"
					/>
				</FormControl>
				<FormMessage error={$errors.description} />
				<p class="text-xs text-gray-500 mt-1">{$form.description.length}/2000</p>
			</FormField>
		</div>
	</section>
	
	<!-- Pricing Section -->
	<PricingSection
		bind:price={$form.price}
		bind:condition={$form.condition}
		bind:color={$form.color}
		bind:brand={$form.brand}
		bind:size={$form.size}
		errors={$errors}
	/>
	
	<!-- Shipping Section -->
	<ShippingSection
		bind:locationCity={$form.location_city}
		bind:shippingType={$form.shipping_type}
		bind:shippingCost={$form.shipping_cost}
		bind:shipsWorldwide={$form.ships_worldwide}
		errors={$errors}
	/>
	
	<!-- Tags Section -->
	<section class="bg-white rounded-lg border p-6">
		<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<Tag class="w-5 h-5" />
			Tags <span class="text-sm font-normal text-gray-500">(optional)</span>
		</h2>
		<TagsSection bind:tags={$form.tags} />
	</section>
	
	<!-- Actions -->
	<div class="bg-white rounded-lg border p-6">
		<div class="flex items-center justify-between">
			<p class="text-sm text-gray-600">
				By listing this item, you agree to our terms of service
			</p>
			
			<div class="flex items-center gap-4">
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
					class="min-w-[140px]"
				>
					{#if isSubmitting}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Publishing...
					{:else}
						Publish Listing
					{/if}
				</Button>
			</div>
		</div>
		
		{#if !hasPaymentAccount}
			<div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
				<p class="text-sm text-amber-800 flex items-center gap-2">
					<AlertCircle class="w-4 h-4 flex-shrink-0" />
					You need to set up your payment account before you can list items.
					<a href="/profile/settings" class="font-medium underline hover:text-amber-900">
						Set up now
					</a>
				</p>
			</div>
		{/if}
	</div>
</form>