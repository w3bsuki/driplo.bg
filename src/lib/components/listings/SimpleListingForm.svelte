<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema } from '$lib/schemas/listing'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/stores'
	import { user } from '$lib/stores/auth'
	import { Button, Input } from '$lib/components/native'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import { cn } from '$lib/utils'
	import { Upload, X, Loader2, AlertCircle } from 'lucide-svelte'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		data: any
		categories: Category[]
		hasPaymentAccount?: boolean
	}
	
	let { data, categories = [], hasPaymentAccount = false }: Props = $props()
	
	let isSubmitting = $state(false)
	let isUploading = $state(false)
	let fileInput: HTMLInputElement
	
	const { form, enhance, errors } = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		id: 'simple-listing-form',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Your listing is live!')
			} else if (result.type === 'failure') {
				toast.error(result.data?.error || 'Failed to create listing')
				isSubmitting = false
			}
		}
	})
	
	// Initialize defaults
	if (!$form.images) $form.images = []
	if (!$form.shipping_type) $form.shipping_type = 'standard'
	if (!$form.shipping_cost) $form.shipping_cost = 0
	if (!$form.tags) $form.tags = []
	
	const supabase = $page.data.supabase
	const userId = $user?.id
	
	// Handle file selection
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files || [])
		await uploadImages(files)
		input.value = ''
	}
	
	// Upload images to Supabase
	async function uploadImages(files: File[]) {
		if (!userId || !supabase) {
			toast.error('Please log in to upload images')
			return
		}
		
		const validFiles = files.filter(file => {
			if (!file.type.startsWith('image/')) {
				toast.error(`${file.name} is not an image`)
				return false
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`${file.name} is too large (max 5MB)`)
				return false
			}
			return true
		})
		
		if ($form.images.length + validFiles.length > 10) {
			toast.error('Maximum 10 images allowed')
			return
		}
		
		isUploading = true
		
		try {
			for (const file of validFiles) {
				const timestamp = Date.now()
				const randomString = Math.random().toString(36).substring(2, 8)
				const extension = file.name.split('.').pop()
				const filename = `${userId}/${timestamp}-${randomString}.${extension}`
				
				const { data, error } = await supabase.storage
					.from('listings')
					.upload(filename, file)
				
				if (error) {
					console.error('Upload error:', error)
					toast.error(`Failed to upload ${file.name}`)
					continue
				}
				
				const { data: { publicUrl } } = supabase.storage
					.from('listings')
					.getPublicUrl(filename)
				
				$form.images = [...$form.images, publicUrl]
			}
			
			if (validFiles.length > 0) {
				toast.success(`Uploaded ${validFiles.length} image(s)`)
			}
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to upload images')
		} finally {
			isUploading = false
		}
	}
	
	// Remove image
	function removeImage(index: number) {
		$form.images = $form.images.filter((_, i) => i !== index)
	}
	
	// Handle form submission
	function handleSubmit(e: SubmitEvent) {
		if (!hasPaymentAccount) {
			e.preventDefault()
			toast.error('Please set up your payment account first')
			return
		}
		
		if ($form.images.length === 0) {
			e.preventDefault()
			toast.error('Please add at least one photo')
			return
		}
		
		isSubmitting = true
	}
</script>

<form 
	method="POST" 
	action="/sell?/create" 
	use:enhance
	onsubmit={handleSubmit}
	class="space-y-6"
>
	<!-- Image Upload -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Photos <span class="text-red-500">*</span>
		</label>
		
		{#if $form.images.length > 0}
			<div class="grid grid-cols-3 gap-3 mb-4">
				{#each $form.images as image, index}
					<div class="relative group">
						<img 
							src={image} 
							alt="Product {index + 1}"
							class="w-full aspect-square object-cover rounded-lg"
						/>
						<button
							type="button"
							onclick={() => removeImage(index)}
							class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<X class="w-3 h-3" />
						</button>
						{#if index === 0}
							<span class="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
								Main
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
		
		<button
			type="button"
			onclick={() => fileInput?.click()}
			disabled={isUploading || $form.images.length >= 10}
			class={cn(
				"w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors",
				"hover:border-gray-400 hover:bg-gray-50",
				"disabled:opacity-50 disabled:cursor-not-allowed"
			)}
		>
			{#if isUploading}
				<Loader2 class="w-6 h-6 mx-auto mb-2 animate-spin" />
				<p class="text-sm text-gray-600">Uploading...</p>
			{:else}
				<Upload class="w-6 h-6 mx-auto mb-2 text-gray-400" />
				<p class="text-sm text-gray-600">
					{$form.images.length === 0 ? 'Click to upload photos' : `Add more photos (${10 - $form.images.length} remaining)`}
				</p>
			{/if}
		</button>
		
		<input
			bind:this={fileInput}
			type="file"
			multiple
			accept="image/*"
			onchange={handleFileSelect}
			class="hidden"
		/>
		
		{#if $errors.images}
			<p class="text-red-500 text-sm mt-1">{$errors.images}</p>
		{/if}
	</div>
	
	<!-- Title -->
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
			Title <span class="text-red-500">*</span>
		</label>
		<Input
			id="title"
			bind:value={$form.title}
			placeholder="e.g., Nike Air Max 90 - Black - Size 10"
			maxlength={100}
		/>
		{#if $errors.title}
			<p class="text-red-500 text-sm mt-1">{$errors.title}</p>
		{/if}
	</div>
	
	<!-- Category -->
	<div>
		<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
			Category <span class="text-red-500">*</span>
		</label>
		<select
			id="category"
			bind:value={$form.category_id}
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			<option value="">Select a category</option>
			{#each categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
		{#if $errors.category_id}
			<p class="text-red-500 text-sm mt-1">{$errors.category_id}</p>
		{/if}
	</div>
	
	<!-- Description -->
	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
			Description <span class="text-red-500">*</span>
		</label>
		<Textarea
			id="description"
			bind:value={$form.description}
			rows={4}
			placeholder="Describe your item..."
			maxlength={2000}
		/>
		{#if $errors.description}
			<p class="text-red-500 text-sm mt-1">{$errors.description}</p>
		{/if}
	</div>
	
	<!-- Price & Details -->
	<div class="grid grid-cols-2 gap-4">
		<!-- Price -->
		<div>
			<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
				Price (EUR) <span class="text-red-500">*</span>
			</label>
			<Input
				id="price"
				type="number"
				bind:value={$form.price}
				placeholder="0.00"
				min="0"
				step="0.01"
			/>
			{#if $errors.price}
				<p class="text-red-500 text-sm mt-1">{$errors.price}</p>
			{/if}
		</div>
		
		<!-- Condition -->
		<div>
			<label for="condition" class="block text-sm font-medium text-gray-700 mb-2">
				Condition <span class="text-red-500">*</span>
			</label>
			<select
				id="condition"
				bind:value={$form.condition}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="">Select condition</option>
				<option value="new_with_tags">New with tags</option>
				<option value="new_without_tags">New without tags</option>
				<option value="very_good">Very good</option>
				<option value="good">Good</option>
				<option value="fair">Fair</option>
			</select>
			{#if $errors.condition}
				<p class="text-red-500 text-sm mt-1">{$errors.condition}</p>
			{/if}
		</div>
		
		<!-- Color -->
		<div>
			<label for="color" class="block text-sm font-medium text-gray-700 mb-2">
				Color <span class="text-red-500">*</span>
			</label>
			<Input
				id="color"
				bind:value={$form.color}
				placeholder="e.g., Black"
			/>
			{#if $errors.color}
				<p class="text-red-500 text-sm mt-1">{$errors.color}</p>
			{/if}
		</div>
		
		<!-- Brand -->
		<div>
			<label for="brand" class="block text-sm font-medium text-gray-700 mb-2">
				Brand
			</label>
			<Input
				id="brand"
				bind:value={$form.brand}
				placeholder="e.g., Nike"
			/>
		</div>
		
		<!-- Size -->
		<div>
			<label for="size" class="block text-sm font-medium text-gray-700 mb-2">
				Size
			</label>
			<Input
				id="size"
				bind:value={$form.size}
				placeholder="e.g., M, 42"
			/>
		</div>
		
		<!-- Location -->
		<div>
			<label for="location" class="block text-sm font-medium text-gray-700 mb-2">
				City <span class="text-red-500">*</span>
			</label>
			<Input
				id="location"
				bind:value={$form.location_city}
				placeholder="e.g., Sofia"
			/>
			{#if $errors.location_city}
				<p class="text-red-500 text-sm mt-1">{$errors.location_city}</p>
			{/if}
		</div>
	</div>
	
	<!-- Shipping -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Shipping
		</label>
		<div class="flex gap-3">
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={$form.shipping_type}
					value="standard"
					class="mr-2"
				/>
				Standard
			</label>
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={$form.shipping_type}
					value="express"
					class="mr-2"
				/>
				Express
			</label>
			<label class="flex items-center">
				<input
					type="radio"
					bind:group={$form.shipping_type}
					value="pickup"
					class="mr-2"
				/>
				Pickup only
			</label>
		</div>
		
		{#if $form.shipping_type !== 'pickup'}
			<div class="mt-3">
				<label for="shipping_cost" class="block text-sm font-medium text-gray-700 mb-2">
					Shipping Cost (EUR)
				</label>
				<Input
					id="shipping_cost"
					type="number"
					bind:value={$form.shipping_cost}
					placeholder="0.00"
					min="0"
					step="0.01"
				/>
			</div>
		{/if}
	</div>
	
	<!-- Submit -->
	<div class="flex items-center justify-between pt-4">
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
			{#if isSubmitting}
				<Loader2 class="w-4 h-4 mr-2 animate-spin" />
				Publishing...
			{:else}
				Publish Listing
			{/if}
		</Button>
	</div>
	
	{#if !hasPaymentAccount}
		<div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
			<p class="text-sm text-amber-800 flex items-center gap-2">
				<AlertCircle class="w-4 h-4" />
				Set up your payment account to start selling.
				<a href="/profile/settings" class="font-medium underline">
					Set up now
				</a>
			</p>
		</div>
	{/if}
</form>