<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { createListingSchema, type CreateListingFormData } from '$lib/schemas/listing'
	import { toast } from 'svelte-sonner'
	import { cn } from '$lib/utils'
	import { onMount } from 'svelte'
	import {
		Upload,
		X,
		Loader2,
		AlertCircle,
		DollarSign,
		MapPin,
		Truck,
		Tag,
		ChevronDown,
		Plus,
		Check
	} from 'lucide-svelte'

	// UI Components
	import { Button } from '$lib/components/ui'
	import Input from '$lib/components/ui/input.svelte'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import { Label } from '$lib/components/ui'
	import Badge from '$lib/components/ui/badge.svelte'

	// Types
	import type { Database } from '$lib/types/database.types'
	type Category = Database['public']['Tables']['categories']['Row']

	interface Props {
		data: any
		categories: Category[]
		hasPaymentAccount?: boolean
	}

	let { data, categories = [], hasPaymentAccount = false }: Props = $props()

	// Simple reactive state - no complex class needed
	let isSubmitting = $state(false)
	let uploadedImages = $state<string[]>([])
	let dragOver = $state(false)
	let subcategories = $state<any[]>([])
	let showCategoryDropdown = $state(false)
	let categorySearch = $state('')
	let selectedConditions = ['new_with_tags', 'new_without_tags', 'very_good', 'good', 'fair']
	let tagInput = $state('')
	let currentTags = $state<string[]>([])

	// Initialize superForm with simpler setup
	const { form, enhance, errors, constraints } = superForm(data, {
		validators: zodClient(createListingSchema),
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('🎉 Your listing is live!')
			} else if (result.type === 'failure') {
				const error = result.data?.error
				if (typeof error === 'string') {
					if (error.includes('auth')) {
						toast.error('Session expired. Please log in again.')
						setTimeout(() => window.location.href = '/login?redirect=/sell', 1000)
					} else if (error.includes('payment')) {
						toast.error('Payment account issue. Please check your settings.')
					} else {
						toast.error(error || 'Failed to create listing. Please try again.')
					}
				} else {
					toast.error('Failed to create listing. Please try again.')
				}
				isSubmitting = false
			} else if (result.type === 'error') {
				toast.error('Server error. Please try again later.')
				isSubmitting = false
			}
		},
		onError: (error) => {
			console.error('Form submission error:', error)
			toast.error('An error occurred. Please try again.')
			isSubmitting = false
		}
	})

	// Sync uploaded images with form
	$effect(() => {
		$form.images = uploadedImages
	})

	// Sync tags with form
	$effect(() => {
		$form.tags = currentTags
	})

	// Filter categories based on search
	const filteredCategories = $derived(
		categorySearch
			? categories.filter(cat => 
				cat.name.toLowerCase().includes(categorySearch.toLowerCase())
			)
			: categories
	)

	// Get selected category
	const selectedCategory = $derived(
		categories.find(cat => cat.id === $form.category_id)
	)

	// Load subcategories when category changes
	async function loadSubcategories(categoryId: string) {
		try {
			const res = await fetch(`/api/categories/${categoryId}/subcategories`)
			if (res.ok) {
				subcategories = await res.json()
			}
		} catch (error) {
			console.error('Failed to load subcategories:', error)
		}
	}

	// Handle category selection
	function selectCategory(categoryId: string) {
		$form.category_id = categoryId
		showCategoryDropdown = false
		categorySearch = ''
		loadSubcategories(categoryId)
	}

	// Image upload handling
	function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files || [])
		processFiles(files)
		input.value = '' // Reset for reselection
	}

	function handleImageDrop(event: DragEvent) {
		event.preventDefault()
		dragOver = false
		const files = Array.from(event.dataTransfer?.files || [])
		processFiles(files)
	}

	async function processFiles(files: File[]) {
		const validFiles = files.filter(file => {
			if (!file.type.startsWith('image/')) {
				toast.error('Please upload only image files')
				return false
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Image size must be less than 5MB')
				return false
			}
			return true
		})

		if (uploadedImages.length + validFiles.length > 10) {
			toast.error('Maximum 10 images allowed')
			return
		}

		// Convert to base64 for preview (in real app, upload to storage)
		for (const file of validFiles) {
			const reader = new FileReader()
			reader.onload = (e) => {
				const url = e.target?.result as string
				uploadedImages = [...uploadedImages, url]
			}
			reader.readAsDataURL(file)
		}
	}

	function removeImage(index: number) {
		uploadedImages = uploadedImages.filter((_, i) => i !== index)
	}

	// Tag management
	function addTag() {
		const tag = tagInput.trim().toLowerCase()
		if (tag && !currentTags.includes(tag) && currentTags.length < 5) {
			currentTags = [...currentTags, tag]
			tagInput = ''
		}
	}

	function removeTag(index: number) {
		currentTags = currentTags.filter((_, i) => i !== index)
	}

	// Form submission
	function handleSubmit(e: SubmitEvent) {
		// Basic validation
		if (!hasPaymentAccount) {
			e.preventDefault()
			toast.error('Please set up your payment account before listing items')
			return
		}

		if (uploadedImages.length === 0) {
			e.preventDefault()
			toast.error('Please add at least one photo')
			document.querySelector('#image-upload')?.scrollIntoView({ behavior: 'smooth' })
			return
		}

		if (!$form.title.trim() || $form.title.trim().length < 3) {
			e.preventDefault()
			toast.error('Please enter a title (at least 3 characters)')
			document.querySelector('#title')?.focus()
			return
		}

		if (!$form.category_id) {
			e.preventDefault()
			toast.error('Please select a category')
			return
		}

		if (!$form.description.trim() || $form.description.trim().length < 10) {
			e.preventDefault()
			toast.error('Please enter a description (at least 10 characters)')
			document.querySelector('#description')?.focus()
			return
		}

		if (!$form.price || $form.price <= 0) {
			e.preventDefault()
			toast.error('Please enter a valid price')
			document.querySelector('#price')?.focus()
			return
		}

		if (!$form.condition) {
			e.preventDefault()
			toast.error('Please select the item condition')
			return
		}

		if (!$form.color.trim()) {
			e.preventDefault()
			toast.error('Please specify the color')
			document.querySelector('#color')?.focus()
			return
		}

		if (!$form.location_city.trim()) {
			e.preventDefault()
			toast.error('Please enter your city')
			document.querySelector('#location_city')?.focus()
			return
		}

		isSubmitting = true
	}

	// Initialize form defaults
	onMount(() => {
		$form.condition = 'new_with_tags'
		$form.shipping_type = 'standard'
		$form.shipping_cost = 0
		$form.ships_worldwide = false
	})
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">📝 Create New Listing</h1>
			<p class="text-gray-600">Fill out the form below to list your item for sale</p>
		</div>

		<form 
			method="POST" 
			action="/sell?/create" 
			use:enhance
			onsubmit={handleSubmit}
			class="bg-white rounded-lg shadow-sm border"
			novalidate
		>
			<div class="p-6 md:p-8 space-y-8">
				
				<!-- Images Section -->
				<section id="image-upload">
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						📸 Photos {uploadedImages.length > 0 ? `(${uploadedImages.length})` : ''}
					</h2>
					
					<!-- Image Grid -->
					{#if uploadedImages.length > 0}
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
							{#each uploadedImages as image, index}
								<div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
									<img 
										src={image} 
										alt="Upload {index + 1}"
										class="w-full h-full object-cover"
									>
									<button
										type="button"
										onclick={() => removeImage(index)}
										class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X class="w-4 h-4" />
									</button>
									{#if index === 0}
										<div class="absolute bottom-2 left-2">
											<Badge class="text-xs bg-blue-500">Main Photo</Badge>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					<!-- Upload Area -->
					{#if uploadedImages.length < 10}
						<div
							class={cn(
								"border-2 border-dashed rounded-lg p-8 text-center transition-colors",
								dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
								"hover:border-blue-400 hover:bg-gray-50"
							)}
							ondragover={(e) => { e.preventDefault(); dragOver = true }}
							ondragleave={() => dragOver = false}
							ondrop={handleImageDrop}
						>
							<Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p class="text-lg font-medium text-gray-700 mb-2">
								{uploadedImages.length === 0 ? 'Add your first photo' : `Add more photos (${10 - uploadedImages.length} remaining)`}
							</p>
							<p class="text-gray-500 mb-4">Drag & drop or click to browse</p>
							<Button 
								type="button" 
								onclick={() => document.getElementById('file-input')?.click()}
								class="mb-2"
							>
								<Plus class="w-4 h-4 mr-2" />
								Choose Photos
							</Button>
							<p class="text-xs text-gray-400">JPG, PNG, WebP • Max 5MB each • Up to 10 photos</p>
							<input
								id="file-input"
								type="file"
								multiple
								accept="image/*"
								onchange={handleImageUpload}
								class="hidden"
							>
						</div>
					{/if}
				</section>

				<!-- Product Details -->
				<section>
					<h2 class="text-xl font-semibold mb-6">📋 Product Details</h2>
					
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Title -->
						<div class="md:col-span-2">
							<Label for="title" class="block mb-2">
								Title <span class="text-red-500">*</span>
							</Label>
							<Input
								id="title"
								type="text"
								bind:value={$form.title}
								placeholder="e.g., Nike Air Max 90 - Black - Size 10"
								maxlength={100}
								class={cn($errors.title && "border-red-300")}
							/>
							{#if $errors.title}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.title[0]}
								</p>
							{/if}
							<p class="text-xs text-gray-500 mt-1">{$form.title.length}/100 characters</p>
						</div>

						<!-- Category -->
						<div>
							<Label class="block mb-2">
								Category <span class="text-red-500">*</span>
							</Label>
							<div class="relative">
								<button
									type="button"
									onclick={() => showCategoryDropdown = !showCategoryDropdown}
									class={cn(
										"w-full px-4 py-3 text-left border rounded-lg flex items-center justify-between",
										"hover:border-gray-400 transition-colors",
										$errors.category_id && "border-red-300",
										selectedCategory ? "text-gray-900" : "text-gray-500"
									)}
								>
									<span>{selectedCategory?.name || 'Select category'}</span>
									<ChevronDown class="w-4 h-4 text-gray-400" />
								</button>
								
								{#if showCategoryDropdown}
									<div class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
										<div class="sticky top-0 bg-white border-b p-2">
											<Input
												type="text"
												bind:value={categorySearch}
												placeholder="Search categories..."
												class="w-full text-sm"
											/>
										</div>
										<div class="p-1">
											{#each filteredCategories as category}
												<button
													type="button"
													onclick={() => selectCategory(category.id)}
													class={cn(
														"w-full px-3 py-2 text-left rounded hover:bg-gray-50",
														"transition-colors text-sm",
														$form.category_id === category.id && "bg-blue-50 text-blue-600"
													)}
												>
													{category.name}
												</button>
											{/each}
										</div>
									</div>
								{/if}
							</div>
							{#if $errors.category_id}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.category_id[0]}
								</p>
							{/if}
						</div>

						<!-- Subcategory -->
						{#if subcategories.length > 0}
							<div>
								<Label for="subcategory" class="block mb-2">
									Subcategory <span class="text-gray-400">(optional)</span>
								</Label>
								<select
									id="subcategory"
									bind:value={$form.subcategory_id}
									class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select subcategory</option>
									{#each subcategories as subcategory}
										<option value={subcategory.id}>{subcategory.name}</option>
									{/each}
								</select>
							</div>
						{/if}

						<!-- Description -->
						<div class="md:col-span-2">
							<Label for="description" class="block mb-2">
								Description <span class="text-red-500">*</span>
							</Label>
							<Textarea
								id="description"
								bind:value={$form.description}
								rows={4}
								placeholder="Describe your item - include condition details, measurements, any flaws, and why you're selling..."
								maxlength={2000}
								class={cn("resize-none", $errors.description && "border-red-300")}
							/>
							{#if $errors.description}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.description[0]}
								</p>
							{/if}
							<p class="text-xs text-gray-500 mt-1">{$form.description.length}/2000 characters</p>
						</div>
					</div>
				</section>

				<!-- Pricing & Details -->
				<section>
					<h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
						💰 Pricing & Details
					</h2>
					
					<div class="grid md:grid-cols-3 gap-6">
						<!-- Price -->
						<div>
							<Label for="price" class="block mb-2">
								Price <span class="text-red-500">*</span>
							</Label>
							<div class="relative">
								<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input
									id="price"
									type="number"
									bind:value={$form.price}
									placeholder="0.00"
									min="0"
									step="0.01"
									class={cn("pl-10", $errors.price && "border-red-300")}
								/>
							</div>
							{#if $errors.price}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.price[0]}
								</p>
							{/if}
						</div>

						<!-- Condition -->
						<div>
							<Label class="block mb-2">
								Condition <span class="text-red-500">*</span>
							</Label>
							<select
								bind:value={$form.condition}
								class={cn(
									"w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
									$errors.condition && "border-red-300"
								)}
							>
								<option value="new_with_tags">🏷️ New with tags</option>
								<option value="new_without_tags">✨ New without tags</option>
								<option value="very_good">⭐ Very good</option>
								<option value="good">👍 Good</option>
								<option value="fair">👌 Fair</option>
							</select>
							{#if $errors.condition}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.condition[0]}
								</p>
							{/if}
						</div>

						<!-- Color -->
						<div>
							<Label for="color" class="block mb-2">
								Color <span class="text-red-500">*</span>
							</Label>
							<Input
								id="color"
								type="text"
								bind:value={$form.color}
								placeholder="e.g., Black, Navy Blue"
								class={cn($errors.color && "border-red-300")}
							/>
							{#if $errors.color}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.color[0]}
								</p>
							{/if}
						</div>

						<!-- Brand -->
						<div>
							<Label for="brand" class="block mb-2">
								Brand <span class="text-gray-400">(optional)</span>
							</Label>
							<Input
								id="brand"
								type="text"
								bind:value={$form.brand}
								placeholder="e.g., Nike, Zara"
							/>
						</div>

						<!-- Size -->
						<div>
							<Label for="size" class="block mb-2">
								Size <span class="text-gray-400">(optional)</span>
							</Label>
							<Input
								id="size"
								type="text"
								bind:value={$form.size}
								placeholder="e.g., M, 10, 36"
							/>
						</div>
					</div>
				</section>

				<!-- Location & Shipping -->
				<section>
					<h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
						📦 Location & Shipping
					</h2>
					
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Location -->
						<div>
							<Label for="location_city" class="block mb-2">
								Your City <span class="text-red-500">*</span>
							</Label>
							<div class="relative">
								<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input
									id="location_city"
									type="text"
									bind:value={$form.location_city}
									placeholder="e.g., Sofia, Plovdiv"
									class={cn("pl-10", $errors.location_city && "border-red-300")}
								/>
							</div>
							{#if $errors.location_city}
								<p class="text-sm text-red-500 mt-1 flex items-center gap-1">
									<AlertCircle class="w-4 h-4" />
									{$errors.location_city[0]}
								</p>
							{/if}
						</div>

						<!-- Shipping Type -->
						<div>
							<Label class="block mb-2">
								Shipping Method
							</Label>
							<select
								bind:value={$form.shipping_type}
								class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="standard">📮 Standard delivery</option>
								<option value="express">⚡ Express delivery</option>
								<option value="pickup">🚶 Pickup only</option>
							</select>
						</div>

						<!-- Shipping Cost -->
						{#if $form.shipping_type !== 'pickup'}
							<div>
								<Label for="shipping_cost" class="block mb-2">
									Shipping Cost <span class="text-gray-400">(BGN)</span>
								</Label>
								<div class="relative">
									<Truck class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
									<Input
										id="shipping_cost"
										type="number"
										bind:value={$form.shipping_cost}
										placeholder="0.00"
										min="0"
										step="0.01"
										class="pl-10"
									/>
								</div>
								<p class="text-xs text-gray-500 mt-1">Leave 0 for free shipping</p>
							</div>

							<!-- Ships Worldwide -->
							<div class="flex items-center space-x-3">
								<input
									id="ships_worldwide"
									type="checkbox"
									bind:checked={$form.ships_worldwide}
									class="w-4 h-4"
								/>
								<Label for="ships_worldwide">
									🌍 Ships worldwide
								</Label>
							</div>
						{/if}
					</div>
				</section>

				<!-- Tags -->
				<section>
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						🏷️ Tags <span class="text-gray-400 text-sm">(optional)</span>
					</h2>
					
					<!-- Current Tags -->
					{#if currentTags.length > 0}
						<div class="flex flex-wrap gap-2 mb-4">
							{#each currentTags as tag, index}
								<Badge class="flex items-center gap-1 bg-blue-100 text-blue-800">
									{tag}
									<button
										type="button"
										onclick={() => removeTag(index)}
										class="ml-1 hover:text-blue-600"
									>
										<X class="w-3 h-3" />
									</button>
								</Badge>
							{/each}
						</div>
					{/if}

					<!-- Add Tag -->
					{#if currentTags.length < 5}
						<div class="flex gap-2">
							<Input
								bind:value={tagInput}
								placeholder="Add a tag (e.g., vintage, summer)"
								class="flex-1"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault()
										addTag()
									}
								}}
							/>
							<Button 
								type="button" 
								onclick={addTag}
								disabled={!tagInput.trim()}
								class="shrink-0"
							>
								<Plus class="w-4 h-4" />
							</Button>
						</div>
						<p class="text-xs text-gray-500 mt-1">
							Add up to 5 tags to help buyers find your item
						</p>
					{/if}
				</section>
			</div>

			<!-- Form Footer -->
			<div class="border-t px-6 py-6 md:px-8 bg-gray-50 rounded-b-lg">
				<div class="flex items-center justify-between">
					<div class="text-sm text-gray-600">
						By listing this item, you agree to our terms of service
					</div>
					
					<div class="flex items-center gap-4">
						<Button
							type="button"
							onclick={() => window.history.back()}
							class="bg-gray-100 text-gray-700 hover:bg-gray-200"
						>
							Cancel
						</Button>
						
						<Button
							type="submit"
							disabled={isSubmitting || !hasPaymentAccount}
							class="bg-green-600 hover:bg-green-700 text-white px-8"
						>
							{#if isSubmitting}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								Publishing...
							{:else}
								<Check class="w-4 h-4 mr-2" />
								Publish Listing
							{/if}
						</Button>
					</div>
				</div>

				<!-- Payment Account Warning -->
				{#if !hasPaymentAccount}
					<div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
						<p class="text-sm text-amber-800 flex items-center gap-2">
							<AlertCircle class="w-4 h-4 flex-shrink-0" />
							You need to set up your payment account before you can list items.
							<a href="/profile/settings" class="font-medium underline">
								Set up now
							</a>
						</p>
					</div>
				{/if}
			</div>
		</form>
	</div>
</div>