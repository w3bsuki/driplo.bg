<script lang="ts">
	import { X, Plus } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { uploadImage, uploadMultipleImages, validateImageFile } from '$lib/utils/storage-client'
	import { compressImages } from '$lib/utils/image-compression'
	import type { SuperForm } from 'sveltekit-superforms'
	import * as m from '$lib/paraglide/messages.js'
	import { formTokens, designTokens } from '$lib/design-tokens'
	import { cn } from '$lib/utils'
	
	interface Props {
		form: SuperForm<any>
		supabase: any
		userId: string
		isMobile?: boolean
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	let isUploading = $state(false)
	let uploadProgress = $state(0)
	let localPreviews = $state<string[]>([])
	let uploadStatuses = $state<Map<number, { status: 'uploading' | 'success' | 'error', message?: string }>>(new Map())
	let failedFiles = $state<Map<number, File>>(new Map())
	
	async function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) return
		
		const files = Array.from(input.files)
		const currentImageCount = $formData.images?.length || 0
		
		if (currentImageCount + files.length > 10) {
			toast.error(m.listing_error_image_max())
			return
		}
		
		isUploading = true
		uploadProgress = 0
		
		try {
			// Validate files
			const validFiles = files.filter(file => {
				const error = validateImageFile(file)
				if (error) {
					toast.error(error)
					return false
				}
				return true
			})
			
			if (validFiles.length === 0) return
			
			// Clear previous failed files
			failedFiles.clear()
			uploadStatuses.clear()
			
			// Compress images
			const compressedFiles = await compressImages(validFiles, {
				maxWidth: 1920,
				maxHeight: 1920,
				quality: 0.85,
				maxSizeMB: 4.5
			})
			
			// Generate local previews first for immediate feedback
			const startIndex = $formData.images?.length || 0
			for (let i = 0; i < compressedFiles.length; i++) {
				const file = compressedFiles[i]
				const reader = new FileReader()
				reader.onload = (e) => {
					localPreviews = [...localPreviews, e.target!.result as string]
				}
				reader.readAsDataURL(file)
				uploadStatuses.set(startIndex + i, { status: 'uploading' })
			}
			
			// Upload images individually to track status
			const newUrls: string[] = []
			for (let i = 0; i < compressedFiles.length; i++) {
				const fileIndex = startIndex + i
				try {
					const result = await uploadImage(compressedFiles[i], 'listings', supabase, userId)
					
					if (result.error) {
						uploadStatuses.set(fileIndex, { status: 'error', message: result.error })
						failedFiles.set(fileIndex, validFiles[i])
					} else if (result.url) {
						uploadStatuses.set(fileIndex, { status: 'success' })
						newUrls.push(result.url)
					}
					
					// Update progress
					uploadProgress = ((i + 1) / compressedFiles.length) * 100
				} catch (error) {
					uploadStatuses.set(fileIndex, { 
						status: 'error', 
						message: error instanceof Error ? error.message : 'Upload failed' 
					})
					failedFiles.set(fileIndex, validFiles[i])
				}
			}
			
			// Update form data with successful uploads
			if (newUrls.length > 0) {
				$formData.images = [...($formData.images || []), ...newUrls]
			}
			
			// Show results
			const failedCount = compressedFiles.length - newUrls.length
			if (failedCount === 0) {
				toast.success(`All ${compressedFiles.length} images uploaded successfully`)
			} else if (newUrls.length > 0) {
				toast.warning(`${newUrls.length} images uploaded, ${failedCount} failed`)
			} else {
				toast.error('All uploads failed. Please try again.')
			}
			
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to process images')
		} finally {
			isUploading = false
			uploadProgress = 0
			input.value = ''
		}
	}
	
	function removeImage(index: number) {
		$formData.images = $formData.images.filter((_: string, i: number) => i !== index)
		localPreviews = localPreviews.filter((_, i) => i !== index)
		uploadStatuses.delete(index)
		failedFiles.delete(index)
	}
	
	async function retryFailedUpload(index: number) {
		const file = failedFiles.get(index)
		if (!file) return
		
		uploadStatuses.set(index, { status: 'uploading' })
		
		try {
			// Compress the file again
			const compressed = await compressImages([file], {
				maxWidth: 1920,
				maxHeight: 1920,
				quality: 0.85,
				maxSizeMB: 4.5
			})
			
			// Retry upload
			const result = await uploadImage(compressed[0], 'listings', supabase, userId)
			
			if (result.error) {
				uploadStatuses.set(index, { status: 'error', message: result.error })
				toast.error(`Retry failed: ${result.error}`)
			} else if (result.url) {
				uploadStatuses.set(index, { status: 'success' })
				failedFiles.delete(index)
				
				// Add to form data at the correct position
				const newImages = [...($formData.images || [])]
				newImages.splice(index, 0, result.url)
				$formData.images = newImages
				
				toast.success('Image uploaded successfully')
			}
		} catch (error) {
			uploadStatuses.set(index, { 
				status: 'error', 
				message: error instanceof Error ? error.message : 'Retry failed' 
			})
			toast.error('Retry failed. Please try again.')
		}
	}
	
	function moveImage(from: number, to: number) {
		if (to < 0 || to >= $formData.images.length) return
		
		const images = [...$formData.images]
		const previews = [...localPreviews]
		
		const [movedImage] = images.splice(from, 1)
		const [movedPreview] = previews.splice(from, 1)
		
		images.splice(to, 0, movedImage)
		previews.splice(to, 0, movedPreview)
		
		$formData.images = images
		localPreviews = previews
	}
</script>

<div class={formTokens.form.section}>
	<div>
		<h3 class={cn(designTokens.fontSize.lg, designTokens.fontWeight.semibold, "mb-2 flex items-center gap-2")}>
			<span class="text-xl">📷</span>
			{m.listing_add_photos_title()}
		</h3>
		<p class={cn(designTokens.fontSize.base, "text-gray-600 mb-4")}>{m.listing_add_photos_description()}</p>
		
		{#if !$formData.images || $formData.images.length === 0}
			<label 
				class={cn(
					"relative block w-full h-64 border-2 border-dashed",
					designTokens.radius.xl,
					designTokens.transition.normal,
					"border-gray-300 hover:border-blue-400",
					"bg-gray-50 hover:bg-gray-50/70",
					"cursor-pointer touch-manipulation"
				)}
			>
				<input
					type="file"
					accept="image/*"
					multiple
					capture="environment"
					onchange={handleImageSelect}
					class="sr-only"
					disabled={isUploading}
				/>
				<div class="flex flex-col items-center justify-center h-full text-gray-400 p-6">
					{#if isUploading}
						<div class="text-center">
							<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
							<p class="text-sm font-medium">Uploading... {uploadProgress}%</p>
						</div>
					{:else}
						<span class="text-5xl mb-3">📤</span>
						<p class={cn(designTokens.fontSize.base, designTokens.fontWeight.medium, "text-center")}>{m.listing_upload_instructions()}</p>
						<p class={cn(designTokens.fontSize.sm, "mt-1 text-center")}>{m.listing_upload_formats()}</p>
						<div class={cn(
							formTokens.button.base,
							"mt-4 px-6 py-3",
							"bg-gradient-to-r from-blue-500 to-blue-600 text-white",
							designTokens.fontSize.base
						)}>
							📷 Take Photo / Choose Files
						</div>
					{/if}
				</div>
			</label>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
				{#each $formData.images as imageUrl, index}
					{@const status = uploadStatuses.get(index)}
					<div class="relative group aspect-square">
						<img 
							src={localPreviews[index] || imageUrl} 
							alt="Preview {index + 1}"
							class="w-full h-full object-cover rounded-xl {status?.status === 'error' ? 'opacity-50' : ''}"
						/>
						{#if index === 0}
							<div class={cn(
								"absolute top-2 left-2",
								"bg-blue-500 text-white",
								designTokens.fontSize.xs,
								"px-2.5 py-1 rounded-full",
								designTokens.fontWeight.medium
							)}>
								⭐ {m.listing_cover_image()}
							</div>
						{/if}
						
						{#if status?.status === 'uploading'}
							<div class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
								<div class="text-center">
									<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
									<p class="text-white text-xs">Uploading...</p>
								</div>
							</div>
						{:else if status?.status === 'error'}
							<div class="absolute inset-0 bg-red-500/20 rounded-xl flex flex-col items-center justify-center p-2">
								<p class="text-red-600 text-xs font-semibold mb-2">Upload failed</p>
								<button
									type="button"
									onclick={() => retryFailedUpload(index)}
									class={cn(
										"flex items-center gap-1.5 px-3 py-1.5",
										"bg-white hover:bg-gray-100",
										designTokens.radius.full,
										designTokens.fontSize.sm,
										designTokens.fontWeight.medium,
										designTokens.transition.fast,
										"touch-manipulation"
									)}
									aria-label="Retry upload"
								>
									🔄 Retry
								</button>
							</div>
						{:else}
							<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 touch:opacity-100">
								{#if index > 0}
									<button
										type="button"
										onclick={() => moveImage(index, index - 1)}
										class="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 touch-manipulation text-lg"
										aria-label="Move image left"
									>
										←
									</button>
								{/if}
								<button
									type="button"
									onclick={() => removeImage(index)}
									class="w-10 h-10 flex items-center justify-center bg-white rounded-full text-red-600 hover:bg-gray-100 touch-manipulation"
									aria-label="Remove image"
								>
									<X class="w-5 h-5" />
								</button>
								{#if index < $formData.images.length - 1}
									<button
										type="button"
										onclick={() => moveImage(index, index + 1)}
										class="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 touch-manipulation text-lg"
										aria-label="Move image right"
									>
										→
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
				
				{#if $formData.images.length < 10}
					<label class={cn(
						"aspect-square border-2 border-dashed",
						designTokens.radius.xl,
						designTokens.transition.normal,
						"border-gray-300 hover:border-blue-400",
						"bg-gray-50 hover:bg-gray-50/70",
						"cursor-pointer flex items-center justify-center",
						"touch-manipulation"
					)}>
						<input
							type="file"
							accept="image/*"
							multiple
							capture="environment"
							onchange={handleImageSelect}
							class="sr-only"
							disabled={isUploading}
						/>
						<div class="text-center p-4">
							<div class="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
								<Plus class="w-6 h-6 text-[#87CEEB]" />
							</div>
							<p class={cn(designTokens.fontSize.sm, "text-gray-600", designTokens.fontWeight.medium)}>
								{m.listing_add_more()}
							</p>
						</div>
					</label>
				{/if}
			</div>
			
			<p class={cn(designTokens.fontSize.base, "text-gray-600")}>
				{m.listing_images_count({ count: $formData.images.length })}
			</p>
		{/if}
		
		{#if $errors.images}
			<p class={cn(formTokens.label.error, "mt-2")}>{$errors.images}</p>
		{/if}
	</div>
</div>