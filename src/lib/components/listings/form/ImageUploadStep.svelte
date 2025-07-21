<script lang="ts">
	import { X, Plus } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { uploadMultipleImages, validateImageFile } from '$lib/utils/storage-client'
	import { compressImages } from '$lib/utils/image-compression'
	import type { SuperForm } from 'sveltekit-superforms'
	import * as m from '$lib/paraglide/messages.js'
	
	interface Props {
		form: SuperForm<any>
		supabase: any
		userId: string
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	let isUploading = $state(false)
	let uploadProgress = $state(0)
	let localPreviews = $state<string[]>([])
	
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
			
			// Compress images
			const compressedFiles = await compressImages(validFiles, {
				maxWidth: 1920,
				maxHeight: 1920,
				quality: 0.85,
				maxSizeMB: 4.5
			})
			
			// Upload images
			const uploadResults = await uploadMultipleImages(
				compressedFiles,
				'listings',
				supabase,
				userId,
				(progress) => { uploadProgress = progress }
			)
			
			// Process results
			const successfulUploads = uploadResults.filter(r => !r.error && r.url)
			if (successfulUploads.length === 0) {
				throw new Error('All uploads failed')
			}
			
			// Update form data
			const newUrls = successfulUploads.map(r => r.url!)
			$formData.images = [...($formData.images || []), ...newUrls]
			
			// Generate local previews
			for (const file of compressedFiles) {
				const reader = new FileReader()
				reader.onload = (e) => {
					localPreviews = [...localPreviews, e.target!.result as string]
				}
				reader.readAsDataURL(file)
			}
			
			toast.success(`${successfulUploads.length} images uploaded successfully`)
			
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to upload images')
		} finally {
			isUploading = false
			uploadProgress = 0
			input.value = ''
		}
	}
	
	function removeImage(index: number) {
		$formData.images = $formData.images.filter((_: string, i: number) => i !== index)
		localPreviews = localPreviews.filter((_, i) => i !== index)
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

<div class="space-y-4">
	<div>
		<h3 class="text-base font-semibold mb-2">{m.listing_add_photos_title()}</h3>
		<p class="text-sm text-gray-600 mb-3">{m.listing_add_photos_description()}</p>
		
		{#if !$formData.images || $formData.images.length === 0}
			<label 
				class="relative block w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 transition-colors cursor-pointer bg-gray-50"
			>
				<input
					type="file"
					accept="image/*"
					multiple
					onchange={handleImageSelect}
					class="sr-only"
					disabled={isUploading}
				/>
				<div class="flex flex-col items-center justify-center h-full text-gray-400">
					{#if isUploading}
						<div class="text-center">
							<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#87CEEB] mx-auto mb-3"></div>
							<p class="text-sm font-medium">Uploading... {uploadProgress}%</p>
						</div>
					{:else}
						<span class="text-5xl mb-3">📤</span>
						<p class="text-sm font-medium">{m.listing_upload_instructions()}</p>
						<p class="text-xs mt-1">{m.listing_upload_formats()}</p>
					{/if}
				</div>
			</label>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
				{#each $formData.images as imageUrl, index}
					<div class="relative group aspect-square">
						<img 
							src={localPreviews[index] || imageUrl} 
							alt="Preview {index + 1}"
							class="w-full h-full object-cover rounded-xl"
						/>
						{#if index === 0}
							<div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
								{m.listing_cover_image()}
							</div>
						{/if}
						<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 touch:opacity-100">
							{#if index > 0}
								<button
									type="button"
									onclick={() => moveImage(index, index - 1)}
									class="p-2 bg-white rounded-full hover:bg-gray-100 touch-manipulation"
									aria-label="Move image left"
								>
									←
								</button>
							{/if}
							<button
								type="button"
								onclick={() => removeImage(index)}
								class="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 touch-manipulation"
								aria-label="Remove image"
							>
								<X class="w-4 h-4" />
							</button>
							{#if index < $formData.images.length - 1}
								<button
									type="button"
									onclick={() => moveImage(index, index + 1)}
									class="p-2 bg-white rounded-full hover:bg-gray-100 touch-manipulation"
									aria-label="Move image right"
								>
									→
								</button>
							{/if}
						</div>
					</div>
				{/each}
				
				{#if $formData.images.length < 10}
					<label class="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 transition-colors cursor-pointer bg-gray-50 flex items-center justify-center">
						<input
							type="file"
							accept="image/*"
							multiple
							onchange={handleImageSelect}
							class="sr-only"
							disabled={isUploading}
						/>
						<div class="text-center">
							<Plus class="w-8 h-8 mx-auto mb-1 text-gray-400" />
							<p class="text-xs text-gray-500">{m.listing_add_more()}</p>
						</div>
					</label>
				{/if}
			</div>
			
			<p class="text-sm text-gray-600">
				{m.listing_images_count({ count: $formData.images.length })}
			</p>
		{/if}
		
		{#if $errors.images}
			<p class="text-sm text-red-500 mt-2">{$errors.images}</p>
		{/if}
	</div>
	
	<!-- Hidden inputs for form submission -->
	{#each $formData.images || [] as imageUrl, i}
		<input type="hidden" name="images" value={imageUrl} />
	{/each}
</div>