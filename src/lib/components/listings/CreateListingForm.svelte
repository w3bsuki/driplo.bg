<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { getAuthContext } from '$lib/stores/auth-context.svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { Button } from '$lib/components/ui'
	import { Badge } from '$lib/components/ui/badge'
	import { toast } from 'svelte-sonner'
	import { AlertCircle, X, MapPin } from 'lucide-svelte'
	import { uploadMultipleImages, validateImageFile, fileToBase64 } from '$lib/utils/storage-client'
	import { compressImages } from '$lib/utils/image-compression'
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte'
	import type { Database } from '$lib/types/database'
	import * as m from '$lib/paraglide/messages.js'
	
	type ListingInsert = Database['public']['Tables']['listings']['Insert']
	type Category = Database['public']['Tables']['categories']['Row']
	
	// Props
	interface Props {
		supabase: SupabaseClient<Database>
		onSuccess?: (listingId: string) => void
	}
	
	let { supabase, onSuccess }: Props = $props()
	
	// Get auth context
	const authContext = getAuthContext()
	
	// iOS detection
	let isIOS = $state(false)
	let isSafari = $state(false)
	let supportsHEIC = $state(false)
	
	// Form state
	let currentStep = $state(1)
	let isSubmitting = $state(false)
	let categories = $state<Category[]>([])
	let uploadProgress = $state(0)
	let paymentAccount = $state<any>(null)
	let isCheckingPayment = $state(true)
	let showPaymentSetup = $state(false)
	let showValidationErrors = $state(false)
	let isProcessingImages = $state(false)
	
	// Form data
	let formData = $state<{
		// Step 1: Basic Info
		title: string
		description: string
		category_id: string
		subcategory: string
		
		// Step 2: Images
		images: File[]
		imageUrls: string[]
		imagePreviews: string[]
		
		// Step 3: Pricing & Details
		price: number
		condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
		size: string
		brand: string
		color: string
		
		// Step 4: Shipping & Location
		shipping_type: 'standard' | 'express' | 'pickup_only'
		shipping_cost: number
		location: string
		tags: string[]
	}>({
		title: '',
		description: '',
		category_id: '',
		subcategory: '',
		images: [],
		imageUrls: [],
		imagePreviews: [],
		price: 0,
		condition: '' as any,
		size: '',
		brand: '',
		color: '',
		shipping_type: 'standard',
		shipping_cost: 0,
		location: '',
		tags: []
	})
	
	// Helper to check if category requires size
	function isSizeRequired() {
		if (!formData.category_id) return false
		const category = categories.find(c => c.id === formData.category_id)
		if (!category) return false
		// Size is required for clothing and shoes categories
		return ['women', 'men', 'kids', 'shoes'].includes(category.slug || '')
	}

	// Simple validation functions
	function validateStep1() {
		return formData.title.length >= 3 && 
			   formData.description.length >= 10 && 
			   formData.category_id.length > 0
	}
	
	function validateStep2() {
		return formData.images.length > 0
	}
	
	function validateStep3() {
		return formData.price > 0 && 
			   formData.condition !== '' &&
			   formData.color.length > 0 && 
			   (!isSizeRequired() || formData.size.length > 0)
	}
	
	function validateStep4() {
		return formData.location.length > 0
	}
	const totalSteps = 4
	const stepProgress = $derived((currentStep / totalSteps) * 100)
	
	// Computed properties
	const suggestedTags = $derived.by(() => {
		const tags: string[] = []
		if (formData.brand) tags.push(formData.brand.toLowerCase())
		if (formData.color) tags.push(formData.color.toLowerCase())
		if (formData.condition === 'new') tags.push('new')
		if (formData.shipping_type === 'express') tags.push('fast-shipping')
		return tags.filter(tag => !formData.tags.includes(tag))
	})
	
	onMount(async () => {
		// Detect iOS and Safari
		const userAgent = navigator.userAgent.toLowerCase()
		isIOS = /iphone|ipad|ipod/.test(userAgent) || 
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
		isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
		
		// Check HEIC support (iOS 11+)
		if (isIOS) {
			// iOS devices typically support HEIC natively
			supportsHEIC = true
		}
		
		
		await loadCategories()
		await checkPaymentAccount()
	})
	
	async function loadCategories() {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.is('parent_id', null)  // Only get main categories
			.eq('is_active', true)
			.order('display_order')
		
		if (error) {
			toast.error(m.listing_error_categories())
			categories = []
		} else {
			categories = data || []
		}
	}

	async function checkPaymentAccount() {
		if (!authContext?.user) return
		
		try {
			const response = await fetch('/api/payment/account/setup')
			const data = await response.json()
			
			if (response.ok) {
				paymentAccount = data.payment_account
				if (!data.has_payment_account) {
					showPaymentSetup = true
				}
			} else {
				toast.error('Failed to check payment account')
			}
		} catch (error) {
			toast.error('Failed to check payment account')
		} finally {
			isCheckingPayment = false
		}
	}

	function handlePaymentAccountSetup(event: CustomEvent) {
		paymentAccount = event.detail
		showPaymentSetup = false
		toast.success('Payment account set up successfully!')
		// Continue with the listing creation form
	}
	
	async function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files) return
		
		const newFiles = Array.from(input.files)
		const validFiles: File[] = []
		
		// Show loading state for mobile users
		const isAndroid = /android/i.test(navigator.userAgent)
		if ((isAndroid || isIOS) && newFiles.length > 0) {
			toast.info(`Processing images... ${isIOS ? 'Converting from HEIC if needed.' : 'This may take a moment.'}`)
		}
		
		isProcessingImages = true
		
		try {
			for (const file of newFiles) {
				// Handle HEIC files on iOS
				let processedFile = file
				if (isIOS && file.type === 'image/heic') {
					// iOS Safari should handle HEIC natively, but we'll ensure proper type
					processedFile = new File([file], file.name.replace('.heic', '.jpeg'), {
						type: 'image/jpeg',
						lastModified: Date.now()
					})
				}
				
				const error = validateImageFile(processedFile)
				if (error) {
					// iOS-specific error messages
					if (isIOS && file.type === 'image/heic' && !supportsHEIC) {
						toast.error('HEIC images are not supported. Please use JPEG or PNG.')
					} else {
						toast.error(error)
					}
				} else if (formData.images.length + validFiles.length < 10) {
					validFiles.push(processedFile)
				}
			}
			
			if (validFiles.length + formData.images.length > 10) {
				toast.error(m.listing_error_image_max())
				return
			}
			
			// Compress images if needed
			const processedFiles = await compressImages(validFiles, {
				maxWidth: 1920,
				maxHeight: 1920,
				quality: isIOS ? 0.9 : 0.85, // Higher quality on iOS to compensate for any conversion
				maxSizeMB: 4.5
			})
			
			// Add files and generate previews
			for (const file of processedFiles) {
				try {
					const preview = await fileToBase64(file)
					formData.images = [...formData.images, file]
					formData.imagePreviews = [...formData.imagePreviews, preview]
				} catch (previewError) {
					// Still add the file even if preview fails
					formData.images = [...formData.images, file]
					formData.imagePreviews = [...formData.imagePreviews, '/placeholder-image.png']
				}
			}
			
			if (isAndroid || isIOS) {
				toast.success('Images processed successfully!')
			}
		} catch (error) {
			if (isIOS) {
				toast.error('Failed to process images. Try using Photos app to convert to JPEG first.')
			} else {
				toast.error('Failed to process images. Please try again with smaller images.')
			}
		} finally {
			isProcessingImages = false
		}
		
		// Reset input - important for iOS
		input.value = ''
	}
	
	function removeImage(index: number) {
		formData.images = formData.images.filter((_, i) => i !== index)
		formData.imagePreviews = formData.imagePreviews.filter((_, i) => i !== index)
	}
	
	function moveImage(from: number, to: number) {
		if (to < 0 || to >= formData.images.length) return
		
		const images = [...formData.images]
		const previews = [...formData.imagePreviews]
		
		const [movedImage] = images.splice(from, 1)
		const [movedPreview] = previews.splice(from, 1)
		
		images.splice(to, 0, movedImage)
		previews.splice(to, 0, movedPreview)
		
		formData.images = images
		formData.imagePreviews = previews
	}
	
	function addTag(tag: string) {
		if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
			formData.tags = [...formData.tags, tag.toLowerCase()]
		}
	}
	
	function removeTag(tag: string) {
		formData.tags = formData.tags.filter(t => t !== tag)
	}
	
	async function handleSubmit() {
		if (!authContext?.user) {
			toast.error(m.listing_error_login())
			return
		}
		
		isSubmitting = true
		uploadProgress = 0
		
		try {
			
			// For now, use placeholder images until storage buckets are set up
			let imageUrls: string[] = []
			
			if (formData.images.length > 0) {
				// Try to upload images
				try {
					toast.info(isIOS ? 'Uploading images from iOS device...' : 'Uploading images...')
					const uploadResults = await uploadMultipleImages(
						formData.images,
						'listings',
						supabase,
						authContext.user.id,
						(progress) => { 
							uploadProgress = progress
							if (progress % 25 === 0 && progress > 0) {
								toast.info(`Upload progress: ${progress}%`)
							}
						}
					)
					
					// Check for upload errors
					const failedUploads = uploadResults.filter(r => r.error)
					if (failedUploads.length > 0) {
						// Show specific errors
						failedUploads.forEach((failed, index) => {
							toast.error(`Failed to upload image ${index + 1}: ${failed.error}`)
						})
						
						// If some succeeded, use those
						const successfulUploads = uploadResults.filter(r => !r.error && r.url)
						if (successfulUploads.length > 0) {
							imageUrls = successfulUploads.map(r => r.url)
							toast.warning(`Only ${successfulUploads.length} of ${formData.images.length} images uploaded successfully`)
						} else {
							throw new Error('All image uploads failed')
						}
					} else {
						// Success! Get URLs
						imageUrls = uploadResults
							.filter(r => !r.error && r.url)
							.map(r => r.url)
						toast.success('Images uploaded successfully!')
					}
				} catch (uploadError: any) {
					// iOS-specific error handling
					if (isIOS) {
						
						if (uploadError.message?.includes('network') || uploadError.message?.includes('fetch')) {
							toast.error('Network error on iOS. Please check your connection and try again.')
						} else if (uploadError.message?.includes('timeout')) {
							toast.error('Upload timed out. Try uploading fewer or smaller images.')
						} else {
							toast.error('iOS upload failed. Try using the Photos app to convert images to JPEG first.')
						}
					} else {
						toast.error(uploadError.message || 'Image upload failed - please try again')
					}
					
					// Use placeholder images for now
					imageUrls = formData.images.map((_, index) => 
						`https://picsum.photos/400/600?random=${Date.now()}-${index}`
					)
				}
			} else {
				// Use a default placeholder
				imageUrls = [`https://picsum.photos/400/600?random=${Date.now()}`]
			}
			
			// Generate slug from title
			const generateSlug = (title: string) => {
				return title
					.toLowerCase()
					.trim()
					.replace(/[^\w\s-]/g, '') // Remove special chars
					.replace(/\s+/g, '-') // Replace spaces with -
					.replace(/-+/g, '-') // Replace multiple - with single -
					.substring(0, 50) // Limit length
					+ '-' + Date.now().toString(36) // Add unique suffix
			}

			// Validate UUID format
			const isValidUUID = (str: string) => {
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
				return uuidRegex.test(str)
			}


			// Create listing with all fields
			const listingData: any = {
				title: formData.title.trim(),
				description: formData.description.trim(),
				price: formData.price,
				condition: formData.condition,
				images: imageUrls,
				location_city: formData.location.trim(),
				seller_id: authContext.user.id,
				status: 'active',
				slug: generateSlug(formData.title),
				category_id: (formData.category_id && isValidUUID(formData.category_id)) ? formData.category_id : null,
				subcategory_id: (formData.subcategory && isValidUUID(formData.subcategory)) ? formData.subcategory : null,
				size: formData.size || null,
				brand: formData.brand || null,
				color: formData.color || null,
				tags: formData.tags || [],
				shipping_type: formData.shipping_type || 'standard',
				shipping_cost: formData.shipping_cost || 0,
				ships_worldwide: formData.shipping_type === 'worldwide'
			}
			
			const { data, error } = await supabase
				.from('listings')
				.insert(listingData)
				.select()
				.single()
			
			if (error) {
				
				// Show more specific error message to user
				if (error.code === '23505') {
					toast.error('A listing with this title already exists. Please use a different title.')
				} else if (error.code === '23503') {
					toast.error('Invalid category selected. Please refresh and try again.')
				} else if (error.code === '42501') {
					toast.error('Permission denied. Please ensure you are logged in.')
				} else {
					toast.error(`Database error: ${error.message}`)
				}
				
				throw error
			}
			
			if (!data || !data.id) {
				throw new Error('Failed to create listing - no data returned')
			}
			
			toast.success(m.listing_success())
			
			// Track activity - commented out until user_activities table exists
			// await supabase.from('user_activities').insert({
			// 	user_id: authContext.user.id,
			// 	activity_type: 'listed_item',
			// 	activity_data: {
			// 		listing_id: data.id,
			// 		title: data.title,
			// 		price: data.price,
			// 		image: imageUrls[0]
			// 	}
			// })
			
			// Always redirect to success page
			if (onSuccess) {
				onSuccess(data.id)
			} else {
				// Small delay to ensure toast is visible
				setTimeout(async () => {
					// Redirect to success page
					await goto(`/sell/success?id=${data.id}`)
				}, 500)
			}
			
		} catch (error: any) {
			
			// Show appropriate error message
			if (error?.message?.includes('Failed to fetch')) {
				toast.error('Network error. Please check your connection and try again.')
			} else if (error?.message?.includes('payment account')) {
				toast.error('Payment account setup required. Please complete setup first.')
			} else if (error?.code) {
				// Supabase error
				toast.error(error.message || m.listing_error_creation())
			} else {
				toast.error(error instanceof Error ? error.message : m.listing_error_creation())
			}
			
			// Reset form state on error
			isSubmitting = false
			uploadProgress = 0
		}
	}
	
	function nextStep() {
		let isValid = false
		
		switch (currentStep) {
			case 1:
				isValid = validateStep1()
				break
			case 2:
				isValid = validateStep2()
				break
			case 3:
				isValid = validateStep3()
				break
			case 4:
				isValid = validateStep4()
				break
		}
		
		if (isValid && currentStep < totalSteps) {
			showValidationErrors = false
			currentStep++
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--
		}
	}
	
	// Get step title
	const stepTitle = $derived.by(() => {
		switch (currentStep) {
			case 1: return m.listing_step_basic_info()
			case 2: return m.listing_step_add_photos()
			case 3: return m.listing_step_pricing_details()
			case 4: return m.listing_step_shipping_location()
			default: return ''
		}
	})
</script>

<div class="min-h-[100dvh] bg-gradient-to-b from-blue-50/30 to-white flex flex-col">
	<!-- Header -->
	<div class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-blue-100/50 flex-shrink-0 safe-area-top">
		<div class="w-full px-4">
			<div class="flex items-center justify-between py-3">
				<button 
					on:click={() => goto('/sell')}
					class="p-2 -m-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 active:bg-gray-200 tap-target flex items-center justify-center"
				>
					<span class="text-lg">←</span>
				</button>
				<h1 class="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{m.listing_create_title()}</h1>
				<div class="w-5 h-5" /> <!-- Spacer -->
			</div>
			
			<!-- Progress Bar -->
			{#if !showPaymentSetup}
				<div class="pb-3">
					<div class="flex items-center justify-between mb-2">
						<span class="text-xs text-gray-600">{m.listing_step_of({ step: currentStep, total: totalSteps })}</span>
						<span class="text-xs font-medium">{stepTitle}</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-1.5">
						<div 
							class="bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] h-1.5 rounded-full transition-all duration-300 shadow-sm"
							style="width: {stepProgress}%"
						></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Loading Payment Account Check -->
	{#if isCheckingPayment}
		<div class="flex-1 w-full px-4 py-8">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
				<p class="text-gray-600 text-sm">Checking payment account...</p>
			</div>
		</div>
	{:else if showPaymentSetup}
		<!-- Payment Account Setup -->
		<div class="flex-1 w-full px-4 py-4">
			<div class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
				<div class="flex items-center gap-2 text-yellow-800">
					<AlertCircle class="w-4 h-4" />
					<span class="font-semibold text-sm">Payment Account Required</span>
				</div>
				<p class="text-xs text-yellow-700 mt-1">
					You need to set up a payment account before creating listings. This allows buyers to pay you directly.
				</p>
			</div>
			
			<PaymentAccountSetup on:success={handlePaymentAccountSetup} />
		</div>
	{:else}
		<!-- Form Content -->
		<div class="flex-1 w-full px-4 py-6 overflow-y-auto pb-32 scroll-smooth">
		<form on:submit|preventDefault={handleSubmit}>
			<!-- Step 1: Basic Info -->
			{#if currentStep === 1}
				<div class="space-y-5">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_title_label()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<input
							id="title"
							type="text"
							bind:value={formData.title}
							placeholder={m.listing_title_placeholder()}
							maxlength="80"
							class="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] transition-all text-base mobile-input"
							required
						/>
						<p class="mt-1 text-xs text-gray-500">{m.listing_title_characters({ count: formData.title.length })}</p>
					</div>
					
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
							{m.listing_description_label()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<textarea
							id="description"
							bind:value={formData.description}
							placeholder={m.listing_description_placeholder()}
							rows={4}
							maxlength={1000}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
							required
						></textarea>
						<p class="mt-1 text-xs text-gray-500">{m.listing_description_characters({ count: formData.description.length })}</p>
					</div>
					
					<div>
						<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
							{m.listing_category_label()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<select
							id="category"
							bind:value={formData.category_id}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
							required
						>
							<option value="">{m.listing_category_placeholder()}</option>
							{#each categories as category}
								<option value={category.id}>
									{category.icon} {category.name}
								</option>
							{/each}
						</select>
					</div>
					
					{#if formData.category_id}
						<div>
							<label for="subcategory" class="block text-sm font-medium text-gray-700 mb-2">
								{m.listing_subcategory_label()}
							</label>
							<input
								id="subcategory"
								type="text"
								bind:value={formData.subcategory}
								placeholder={m.listing_subcategory_placeholder()}
								class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
							/>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Step 2: Images -->
			{#if currentStep === 2}
				<div class="space-y-4 animate-in">
					<div>
						<h3 class="text-base font-semibold mb-2">{m.listing_add_photos_title()}</h3>
						<p class="text-sm text-gray-600 mb-3">
							{m.listing_add_photos_description()}
						</p>
						{#if isIOS}
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
								<p class="text-xs text-blue-800">
									<strong>iOS Tip:</strong> HEIC photos from your camera will be automatically converted to JPEG. 
									For best results, ensure you have a stable internet connection.
								</p>
							</div>
						{/if}
						
						<!-- Image Upload Area -->
						{#if formData.images.length === 0}
							<label 
								for="image-upload"
								class="relative block w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 transition-colors cursor-pointer bg-gray-50 {isProcessingImages ? 'pointer-events-none' : ''}"
							>
								<input
									id="image-upload"
									type="file"
									accept={isIOS ? "image/*,image/heic,image/heif" : "image/*"}
									multiple
									on:change={handleImageSelect}
									class="sr-only"
									disabled={isProcessingImages}
								/>
								{#if isProcessingImages}
									<div class="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
										<div class="text-center">
											<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
											<p class="text-sm font-medium text-gray-700">Processing images...</p>
											<p class="text-xs text-gray-500 mt-1">This may take a moment</p>
										</div>
									</div>
								{/if}
								<div class="flex flex-col items-center justify-center h-full text-gray-400">
									<span class="text-5xl mb-3 opacity-60">📤</span>
									<p class="text-sm font-medium">{m.listing_upload_instructions()}</p>
									<p class="text-xs mt-1">{m.listing_upload_formats()}</p>
								</div>
							</label>
						{:else}
							<!-- Image Grid -->
							<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
								{#each formData.imagePreviews as preview, index}
									<div class="relative group aspect-square">
										<img 
											src={preview} 
											alt="Preview {index + 1}"
											class="w-full h-full object-cover rounded-xl"
										/>
										{#if index === 0}
											<div class="absolute top-2 left-2 bg-blue-300 text-white text-xs px-2 py-1 rounded-full">
												{m.listing_cover_image()}
											</div>
										{/if}
										<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
											{#if index > 0}
												<button
													type="button"
													on:click={() => moveImage(index, index - 1)}
													class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 flex items-center justify-center"
												>
													<span class="text-sm">←</span>
												</button>
											{/if}
											<button
												type="button"
												on:click={() => removeImage(index)}
												class="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100"
											>
												<X class="w-4 h-4" />
											</button>
											{#if index < formData.images.length - 1}
												<button
													type="button"
													on:click={() => moveImage(index, index + 1)}
													class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 flex items-center justify-center"
												>
													<span class="text-sm">→</span>
												</button>
											{/if}
										</div>
									</div>
								{/each}
								
								{#if formData.images.length < 10}
									<label 
										for="image-upload-more"
										class="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 transition-colors cursor-pointer bg-gray-50 flex items-center justify-center relative {isProcessingImages ? 'pointer-events-none' : ''}"
									>
										<input
											id="image-upload-more"
											type="file"
											accept={isIOS ? "image/*,image/heic,image/heif" : "image/*"}
											multiple
											on:change={handleImageSelect}
											class="sr-only"
											disabled={isProcessingImages}
										/>
										{#if isProcessingImages}
											<div class="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
												<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#87CEEB]"></div>
											</div>
										{/if}
										<div class="text-center">
											<span class="text-3xl opacity-60 block mb-1">➕</span>
											<p class="text-xs text-gray-500">{m.listing_add_more()}</p>
										</div>
									</label>
								{/if}
							</div>
							
							<p class="text-sm text-gray-600">
								{m.listing_images_count({ count: formData.images.length })}
							</p>
						{/if}
					</div>
				</div>
			{/if}
			
			<!-- Step 3: Pricing & Details -->
			{#if currentStep === 3}
				<div class="space-y-4 animate-in">
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-1">
							{m.listing_price_label()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
							<input
								id="price"
								type="number"
								bind:value={formData.price}
								min="0"
								step="0.01"
								placeholder={m.listing_price_placeholder()}
								class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
								required
							/>
						</div>
					</div>
					
					<div>
						<label for="condition" class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_condition_label()} <span class="text-red-500">*</span>
						</label>
						<select
							id="condition"
							bind:value={formData.condition}
							class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
							required
						>
							<option value="">{m.listing_condition_placeholder ? m.listing_condition_placeholder() : 'Select condition'}</option>
							<option value="new">{m.listing_condition_new()}</option>
							<option value="like_new">{m.listing_condition_like_new()}</option>
							<option value="good">{m.listing_condition_good()}</option>
							<option value="fair">{m.listing_condition_fair()}</option>
							<option value="poor">{m.listing_condition_poor()}</option>
						</select>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="brand" class="block text-sm font-medium text-gray-700 mb-2">
								{m.listing_brand_label()}
							</label>
							<input
								id="brand"
								type="text"
								bind:value={formData.brand}
								placeholder={m.listing_brand_placeholder()}
								class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
							/>
						</div>
						
						<div>
							<label for="size" class="block text-sm font-medium text-gray-700 mb-2">
								{m.listing_size_label()} {#if isSizeRequired()}<span class="text-red-500">*</span>{/if}
							</label>
							<input
								id="size"
								type="text"
								bind:value={formData.size}
								placeholder={m.listing_size_placeholder()}
								class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
								required={isSizeRequired()}
							/>
						</div>
					</div>
					
					<div>
						<label for="color" class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_color_label()} <span class="text-red-500">*</span>
						</label>
						<input
							id="color"
							type="text"
							bind:value={formData.color}
							placeholder={m.listing_color_placeholder()}
							class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
							required
						/>
					</div>
				</div>
			{/if}
			
			<!-- Step 4: Shipping & Location -->
			{#if currentStep === 4}
				<div class="space-y-4 animate-in">
					<div>
						<label for="location" class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_location_label()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<div class="relative">
							<MapPin class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								id="location"
								type="text"
								bind:value={formData.location}
								placeholder={m.listing_location_placeholder()}
								class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
								required
							/>
						</div>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_shipping_options()} <span class="text-red-500">{m.listing_required_field()}</span>
						</label>
						<div class="space-y-3">
							<label class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 {formData.shipping_type === 'standard' ? 'border-blue-300 bg-blue-50' : ''}">
								<input
									type="radio"
									bind:group={formData.shipping_type}
									value="standard"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium">{m.listing_shipping_standard()}</div>
									<div class="text-sm text-gray-600">{m.listing_shipping_standard_time()}</div>
								</div>
							</label>
							
							<label class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 {formData.shipping_type === 'express' ? 'border-blue-300 bg-blue-50' : ''}">
								<input
									type="radio"
									bind:group={formData.shipping_type}
									value="express"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium">{m.listing_shipping_express()}</div>
									<div class="text-sm text-gray-600">{m.listing_shipping_express_time()}</div>
								</div>
							</label>
							
							<label class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 {formData.shipping_type === 'pickup_only' ? 'border-blue-300 bg-blue-50' : ''}">
								<input
									type="radio"
									bind:group={formData.shipping_type}
									value="pickup_only"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium">{m.listing_shipping_pickup()}</div>
									<div class="text-sm text-gray-600">{m.listing_shipping_pickup_desc()}</div>
								</div>
							</label>
						</div>
					</div>
					
					{#if formData.shipping_type !== 'pickup_only'}
						<div>
							<label for="shipping_cost" class="block text-sm font-medium text-gray-700 mb-2">
								{m.listing_shipping_cost_label()}
							</label>
							<div class="relative">
								<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
								<input
									id="shipping_cost"
									type="number"
									bind:value={formData.shipping_cost}
									min="0"
									step="0.01"
									placeholder={m.listing_shipping_cost_placeholder()}
									class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
								/>
							</div>
							<p class="mt-1 text-xs text-gray-500">{m.listing_shipping_cost_free()}</p>
						</div>
					{/if}
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{m.listing_tags_label()}
						</label>
						<div class="flex flex-wrap gap-2 mb-3">
							{#each formData.tags as tag}
								<Badge class="bg-blue-100 text-blue-500 pl-3 pr-1 py-1">
									#{tag}
									<button
										type="button"
										on:click={() => removeTag(tag)}
										class="ml-1 p-0.5 hover:bg-blue-100 rounded"
									>
										<X class="w-3 h-3" />
									</button>
								</Badge>
							{/each}
						</div>
						
						{#if suggestedTags.length > 0}
							<div class="mb-3">
								<p class="text-xs text-gray-600 mb-2">{m.listing_suggested_tags()}</p>
								<div class="flex flex-wrap gap-2">
									{#each suggestedTags as tag}
										<button
											type="button"
											on:click={() => addTag(tag)}
											class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
										>
											+ {tag}
										</button>
									{/each}
								</div>
							</div>
						{/if}
						
						<input
							type="text"
							placeholder={m.listing_tag_placeholder()}
							on:keydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									const input = e.target as HTMLInputElement
									addTag(input.value)
									input.value = ''
								}
							}}
							class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent"
						/>
					</div>
				</div>
			{/if}
			
			<!-- Navigation Buttons -->
			<div class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-20">
			<div class="max-w-lg mx-auto flex gap-2">
				{#if currentStep > 1}
					<Button
						type="button"
						variant="outline"
						on:click={prevStep}
						class="flex-1 text-sm py-2"
					>
						<span class="mr-1">←</span>
						{m.listing_btn_previous()}
					</Button>
				{/if}
				
				{#if currentStep < totalSteps}
					<button
						type="button"
						on:click={nextStep}
						class="flex-1 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white font-medium text-sm py-2 shadow-sm rounded-md px-4 inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						{m.listing_btn_next()}
						<span class="ml-1">→</span>
					</button>
				{:else}
					<button
						type="submit"
						disabled={isSubmitting || !validateStep4()}
						class="flex-1 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] hover:from-[#6BB6D8] hover:to-[#4F9FC5] text-white font-medium text-sm py-2 shadow-sm rounded-md px-4 inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						{#if isSubmitting}
							{#if uploadProgress > 0}
								{m.listing_uploading_progress({ progress: uploadProgress.toFixed(0) })}
							{:else}
								{m.listing_creating()}
							{/if}
						{:else}
							<span class="mr-2">✨</span>
							{m.listing_btn_publish()}
						{/if}
					</button>
				{/if}
			</div>
			</div>
		</form>
	</div>
	{/if}
</div>

<style>
	@keyframes animate-in {
		from {
			opacity: 0;
			transform: translateX(10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.animate-in {
		animation: animate-in 0.2s ease-out;
	}
	
	/* iOS-specific fixes */
	@supports (-webkit-touch-callout: none) {
		/* Fix for iOS Safari file input */
		input[type="file"] {
			-webkit-appearance: none;
		}
		
		/* Prevent zoom on input focus */
		input, select, textarea {
			font-size: 16px !important;
		}
		
		/* Fix sticky positioning on iOS */
		.sticky {
			position: -webkit-sticky;
		}
		
		/* Improve tap targets */
		.tap-target {
			min-height: 44px;
			min-width: 44px;
		}
	}
	
</style>