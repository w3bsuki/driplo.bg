<script lang="ts">
	import { Upload, X, Camera, AlertCircle, Move, Star } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import * as m from '$lib/paraglide/messages.js'
	import type { SuperForm } from 'sveltekit-superforms'
	import { uploadListingImage, deleteListingImage } from '$lib/utils/upload'
	import { cn } from '$lib/utils'
	
	interface Props {
		form: SuperForm<any>
		supabase: any
		userId: string
	}
	
	let { form, supabase, userId }: Props = $props()
	const { form: formData, errors } = form
	
	let fileInput = $state<HTMLInputElement>()
	let isUploading = $state(false)
	let uploadProgress = $state(0)
	let draggedIndex = $state<number | null>(null)
	let dropZone = $state<HTMLDivElement>()
	let isDragging = $state(false)
	
	// Initialize images array
	onMount(() => {
		if (!$formData.images || !Array.isArray($formData.images)) {
			$formData.images = []
		}
	})
	
	// Handle file selection
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement
		if (input.files) {
			await handleFiles(Array.from(input.files))
		}
	}
	
	// Handle multiple files
	async function handleFiles(files: File[]) {
		const remainingSlots = 10 - ($formData.images?.length || 0)
		const filesToUpload = files.slice(0, remainingSlots)
		
		if (files.length > remainingSlots) {
			toast.error(`Only ${remainingSlots} more images can be added`)
		}
		
		for (const file of filesToUpload) {
			await uploadFile(file)
		}
	}
	
	// Upload single file
	async function uploadFile(file: File) {
		// Validate file
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload only image files')
			return
		}
		
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image size must be less than 5MB')
			return
		}
		
		isUploading = true
		uploadProgress = 0
		
		try {
			// Show preview immediately
			const preview = URL.createObjectURL(file)
			const tempId = `temp-${Date.now()}`
			
			$formData.images = [
				...($formData.images || []),
				{ id: tempId, url: preview, isUploading: true }
			]
			
			// Upload to Supabase
			const result = await uploadListingImage(supabase, file, userId)
			
			if (result.error) {
				throw result.error
			}
			
			// Replace temp image with real URL
			$formData.images = $formData.images.map(img => 
				img.id === tempId 
					? { id: result.publicUrl, url: result.publicUrl, isUploading: false }
					: img
			)
			
			// Clean up preview
			URL.revokeObjectURL(preview)
			
			toast.success('Image uploaded successfully')
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to upload image')
			// Remove failed upload
			$formData.images = $formData.images.filter(img => !img.isUploading)
		} finally {
			isUploading = false
			uploadProgress = 0
		}
	}
	
	// Remove image
	async function removeImage(index: number) {
		const image = $formData.images[index]
		if (!image) return
		
		try {
			// If it's a Supabase URL, delete from storage
			if (image.url.includes('supabase')) {
				await deleteListingImage(supabase, image.url)
			}
			
			// Remove from array
			$formData.images = $formData.images.filter((_, i) => i !== index)
			toast.success('Image removed')
		} catch (error) {
			console.error('Delete error:', error)
			toast.error('Failed to remove image')
		}
	}
	
	// Drag and drop handlers
	function handleDragOver(e: DragEvent) {
		e.preventDefault()
		isDragging = true
	}
	
	function handleDragLeave(e: DragEvent) {
		if (e.target === dropZone) {
			isDragging = false
		}
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault()
		isDragging = false
		
		const files = Array.from(e.dataTransfer?.files || [])
		if (files.length > 0) {
			handleFiles(files)
		}
	}
	
	// Reorder images
	function moveImage(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return
		
		const images = [...$formData.images]
		const [movedImage] = images.splice(fromIndex, 1)
		images.splice(toIndex, 0, movedImage)
		$formData.images = images
	}
</script>

<div class="space-y-6">
	<!-- Step Header -->
	<div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">{m.listing_step_add_photos()}</h2>
		<p class="text-gray-600">Add up to 10 photos - the first one will be your cover image</p>
	</div>
	
	<!-- Upload Area -->
	<div
		bind:this={dropZone}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		class={cn(
			"relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
			isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
			$errors.images && "border-red-500"
		)}
	>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			multiple
			onchange={handleFileSelect}
			class="hidden"
		/>
		
		<div class="space-y-4">
			<div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
				<Camera class="w-8 h-8 text-gray-400" />
			</div>
			
			<div>
				<button
					type="button"
					onclick={() => fileInput?.click()}
					disabled={isUploading || ($formData.images?.length || 0) >= 10}
					class={cn(
						"px-4 py-2 rounded-lg font-medium transition-all duration-200",
						"bg-primary text-white hover:bg-primary/90",
						"disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
					)}
				>
					<Upload class="w-4 h-4 inline mr-2" />
					Choose Photos
				</button>
				
				<p class="mt-2 text-sm text-gray-500">
					or drag and drop images here
				</p>
			</div>
			
			<p class="text-xs text-gray-400">
				PNG, JPG, GIF up to 5MB each
			</p>
		</div>
		
		{#if isUploading}
			<div class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
					<p class="text-sm text-gray-600">Uploading...</p>
				</div>
			</div>
		{/if}
	</div>
	
	{#if $errors.images}
		<p class="text-sm text-red-600 flex items-center gap-1">
			<AlertCircle class="w-3 h-3" />
			{$errors.images}
		</p>
	{/if}
	
	<!-- Image Grid -->
	{#if $formData.images?.length > 0}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-900">
					Your photos ({$formData.images.length}/10)
				</h3>
				<p class="text-xs text-gray-500">
					Drag to reorder
				</p>
			</div>
			
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{#each $formData.images as image, index}
					<div
						draggable="true"
						ondragstart={(e) => {
							draggedIndex = index
							e.dataTransfer!.effectAllowed = 'move'
						}}
						ondragend={() => draggedIndex = null}
						ondragover={(e) => {
							e.preventDefault()
							if (draggedIndex !== null && draggedIndex !== index) {
								e.dataTransfer!.dropEffect = 'move'
							}
						}}
						ondrop={(e) => {
							e.preventDefault()
							if (draggedIndex !== null && draggedIndex !== index) {
								moveImage(draggedIndex, index)
							}
						}}
						class={cn(
							"relative aspect-square rounded-lg overflow-hidden group cursor-move",
							"ring-2 ring-transparent hover:ring-primary/50 transition-all duration-200",
							index === 0 && "ring-primary"
						)}
					>
						<img 
							src={image.url} 
							alt={`Upload ${index + 1}`}
							class="w-full h-full object-cover"
						/>
						
						{#if index === 0}
							<div class="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
								<Star class="w-3 h-3" />
								Cover
							</div>
						{/if}
						
						{#if image.isUploading}
							<div class="absolute inset-0 bg-black/50 flex items-center justify-center">
								<div class="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							</div>
						{:else}
							<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
								<button
									type="button"
									onclick={() => removeImage(index)}
									class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
								>
									<X class="w-4 h-4" />
								</button>
								<div class="p-2 bg-white/20 text-white rounded-lg">
									<Move class="w-4 h-4" />
								</div>
							</div>
						{/if}
					</div>
				{/each}
				
				{#if $formData.images.length < 10}
					<button
						type="button"
						onclick={() => fileInput?.click()}
						disabled={isUploading}
						class="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center"
					>
						<div class="text-center">
							<Upload class="w-6 h-6 text-gray-400 mx-auto mb-1" />
							<span class="text-xs text-gray-500">Add more</span>
						</div>
					</button>
				{/if}
			</div>
		</div>
	{/if}
	
	<!-- Photo Tips -->
	<div class="bg-amber-50 rounded-lg p-4">
		<h4 class="font-medium text-amber-900 mb-2 text-sm">📸 Photo tips for more sales:</h4>
		<ul class="space-y-1 text-xs text-amber-800">
			<li>• Use natural lighting near a window</li>
			<li>• Show the item from multiple angles</li>
			<li>• Include close-ups of any flaws or details</li>
			<li>• Use a clean, uncluttered background</li>
			<li>• Show the item being worn (if clothing)</li>
		</ul>
	</div>
</div>