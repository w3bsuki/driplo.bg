<script lang="ts">
	import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { cn } from '$lib/utils'
	import { Button } from '$lib/components/native'
	import { createClient } from '@supabase/supabase-js'
	import type { Database } from '$lib/types/database.types'
	
	interface Props {
		images?: string[]
		maxImages?: number
		onImagesChange?: (images: string[]) => void
		supabase: ReturnType<typeof createClient<Database>>
		userId?: string
	}
	
	let { 
		images = $bindable([]), 
		maxImages = 10,
		onImagesChange,
		supabase,
		userId
	}: Props = $props()
	
	let isUploading = $state(false)
	let uploadProgress = $state(0)
	let dragOver = $state(false)
	let fileInput: HTMLInputElement
	
	// Generate unique filename with user ID path
	function generateFilename(file: File): string {
		if (!userId) {
			throw new Error('User ID is required for image upload')
		}
		const timestamp = Date.now()
		const randomString = Math.random().toString(36).substring(2, 8)
		const extension = file.name.split('.').pop()
		// Storage expects: userId/filename format based on RLS policy
		return `${userId}/${timestamp}-${randomString}.${extension}`
	}
	
	// Upload single image to Supabase storage
	async function uploadImage(file: File): Promise<string | null> {
		try {
			const filename = generateFilename(file)
			
			// Upload to Supabase storage
			const { data, error } = await supabase.storage
				.from('listings')
				.upload(filename, file, {
					cacheControl: '3600',
					upsert: false
				})
			
			if (error) {
				console.error('Upload error:', error)
				toast.error(`Failed to upload ${file.name}`)
				return null
			}
			
			// Get public URL
			const { data: { publicUrl } } = supabase.storage
				.from('listings')
				.getPublicUrl(filename)
			
			return publicUrl
		} catch (error) {
			console.error('Upload error:', error)
			return null
		}
	}
	
	// Handle file selection
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files || [])
		await processFiles(files)
		input.value = '' // Reset for reselection
	}
	
	// Handle drag and drop
	function handleDrop(event: DragEvent) {
		event.preventDefault()
		dragOver = false
		const files = Array.from(event.dataTransfer?.files || [])
		processFiles(files)
	}
	
	// Process selected files
	async function processFiles(files: File[]) {
		// Validate file types
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
		
		// Check max images limit
		if (images.length + validFiles.length > maxImages) {
			toast.error(`Maximum ${maxImages} images allowed`)
			return
		}
		
		if (validFiles.length === 0) return
		
		isUploading = true
		uploadProgress = 0
		
		try {
			// Upload each file
			const uploadPromises = validFiles.map(async (file, index) => {
				const url = await uploadImage(file)
				uploadProgress = Math.round(((index + 1) / validFiles.length) * 100)
				return url
			})
			
			const uploadedUrls = await Promise.all(uploadPromises)
			const successfulUploads = uploadedUrls.filter(url => url !== null) as string[]
			
			if (successfulUploads.length > 0) {
				images = [...images, ...successfulUploads]
				onImagesChange?.(images)
				toast.success(`${successfulUploads.length} image(s) uploaded`)
			}
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to upload images')
		} finally {
			isUploading = false
			uploadProgress = 0
		}
	}
	
	// Remove image
	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index)
		onImagesChange?.(images)
	}
	
	// Move image (for reordering)
	function moveImage(from: number, to: number) {
		const newImages = [...images]
		const [removed] = newImages.splice(from, 1)
		newImages.splice(to, 0, removed)
		images = newImages
		onImagesChange?.(images)
	}
</script>

<div class="space-y-4">
	<!-- Image Grid -->
	{#if images.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
			{#each images as image, index}
				<div class="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
					<img 
						src={image} 
						alt="Product {index + 1}"
						class="w-full h-full object-cover"
					/>
					
					<!-- Overlay with actions -->
					<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
						{#if index > 0}
							<Button
								type="button"
								size="sm"
								variant="outline"
								onclick={() => moveImage(index, index - 1)}
								class="bg-white/90 hover:bg-white"
							>
								←
							</Button>
						{/if}
						
						<Button
							type="button"
							size="sm"
							variant="outline"
							onclick={() => removeImage(index)}
							class="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
						>
							<X class="w-4 h-4" />
						</Button>
						
						{#if index < images.length - 1}
							<Button
								type="button"
								size="sm"
								variant="outline"
								onclick={() => moveImage(index, index + 1)}
								class="bg-white/90 hover:bg-white"
							>
								→
							</Button>
						{/if}
					</div>
					
					{#if index === 0}
						<div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
							Main
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	
	<!-- Upload Area -->
	{#if images.length < maxImages}
		<div
			class={cn(
				"border-2 border-dashed rounded-lg p-8 text-center transition-colors",
				dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
				isUploading && "pointer-events-none opacity-60"
			)}
			ondragover={(e) => { e.preventDefault(); dragOver = true }}
			ondragleave={() => dragOver = false}
			ondrop={handleDrop}
		>
			{#if isUploading}
				<Loader2 class="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
				<p class="text-lg font-medium text-gray-700 mb-2">Uploading images...</p>
				<div class="max-w-xs mx-auto">
					<div class="bg-gray-200 rounded-full h-2 overflow-hidden">
						<div 
							class="bg-blue-500 h-full transition-all duration-300"
							style="width: {uploadProgress}%"
						></div>
					</div>
					<p class="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
				</div>
			{:else}
				<ImageIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
				<p class="text-lg font-medium text-gray-700 mb-2">
					{images.length === 0 ? 'Add product photos' : `Add more photos (${maxImages - images.length} remaining)`}
				</p>
				<p class="text-gray-500 mb-4">Drag & drop or click to browse</p>
				<Button 
					type="button" 
					variant="outline"
					onclick={() => fileInput?.click()}
				>
					<Upload class="w-4 h-4 mr-2" />
					Choose Photos
				</Button>
				<p class="text-xs text-gray-400 mt-2">
					JPG, PNG, WebP • Max 5MB each • Up to {maxImages} photos
				</p>
			{/if}
			
			<input
				bind:this={fileInput}
				type="file"
				multiple
				accept="image/*"
				onchange={handleFileSelect}
				class="hidden"
			/>
		</div>
	{/if}
	
	{#if images.length === 0}
		<p class="text-sm text-amber-600 flex items-center gap-2">
			<ImageIcon class="w-4 h-4" />
			At least one photo is required
		</p>
	{/if}
</div>