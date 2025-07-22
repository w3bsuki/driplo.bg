<script lang="ts">
	import { 
		Camera, 
		X, 
		Upload, 
		Move, 
		Star, 
		Image as ImageIcon,
		Sparkles,
		AlertCircle,
		Check,
		Plus
	} from 'lucide-svelte'
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
	let isDragging = $state(false)
	
	// Initialize images array
	onMount(() => {
		if (!$formData.images || !Array.isArray($formData.images)) {
			$formData.images = []
		}
	})
	
	// Mobile-optimized file selection
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
			toast.error(`Only ${remainingSlots} more photos can be added`)
		}
		
		for (const file of filesToUpload) {
			await uploadFile(file)
		}
	}
	
	// Upload single file with visual feedback
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
			
			// Simulate upload progress
			const progressInterval = setInterval(() => {
				uploadProgress = Math.min(uploadProgress + 10, 90)
			}, 100)
			
			// Upload to Supabase
			const result = await uploadListingImage(supabase, file, userId)
			
			clearInterval(progressInterval)
			uploadProgress = 100
			
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
			
			// Haptic feedback on mobile
			if (navigator.vibrate) {
				navigator.vibrate(50)
			}
			
			toast.success('Photo added! 📸')
		} catch (error) {
			console.error('Upload error:', error)
			toast.error('Failed to upload photo')
			// Remove failed upload
			$formData.images = $formData.images.filter(img => !img.isUploading)
		} finally {
			isUploading = false
			uploadProgress = 0
		}
	}
	
	// Remove image with confirmation
	async function removeImage(index: number) {
		const image = $formData.images[index]
		if (!image) return
		
		try {
			// If it's a Supabase URL, delete from storage
			if (image.url.includes('supabase')) {
				await deleteListingImage(supabase, image.url)
			}
			
			// Remove from array with animation
			$formData.images = $formData.images.filter((_, i) => i !== index)
			
			// Haptic feedback
			if (navigator.vibrate) {
				navigator.vibrate(30)
			}
			
			toast.success('Photo removed')
		} catch (error) {
			console.error('Delete error:', error)
			toast.error('Failed to remove photo')
		}
	}
	
	// Reorder images with touch
	function moveImage(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return
		
		const images = [...$formData.images]
		const [movedImage] = images.splice(fromIndex, 1)
		images.splice(toIndex, 0, movedImage)
		$formData.images = images
		
		// Haptic feedback
		if (navigator.vibrate) {
			navigator.vibrate(20)
		}
	}
	
	// Touch drag handlers
	let touchStartX = 0
	let touchStartY = 0
	
	function handleTouchStart(e: TouchEvent, index: number) {
		draggedIndex = index
		touchStartX = e.touches[0].clientX
		touchStartY = e.touches[0].clientY
	}
	
	function handleTouchEnd() {
		draggedIndex = null
	}
	
	// Photo tips based on category
	let photoTips = $derived((() => {
		const tips = ['Use natural lighting', 'Show all angles', 'Include close-ups of details']
		
		if ($formData.category_id) {
			// Add category-specific tips
			tips.push('Show the item being worn (if clothing)')
		}
		
		return tips
	})())
</script>

<div class="space-y-6">
	<!-- Step Header with Camera Icon -->
	<div class="text-center">
		<div class="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
			<span class="text-2xl">📸</span>
		</div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">Add stunning photos</h2>
		<p class="text-gray-600">Great photos sell items 3x faster!</p>
	</div>
	
	<!-- Image Grid or Upload Area -->
	{#if $formData.images?.length > 0}
		<!-- Photo Grid -->
		<div class="space-y-4">
			<!-- Count and Reorder Hint -->
			<div class="flex items-center justify-between px-1">
				<span class="text-sm font-medium text-gray-700">
					{$formData.images.length}/10 photos
				</span>
				{#if $formData.images.length > 1}
					<span class="text-xs text-gray-500 flex items-center gap-1">
						<Move class="w-3 h-3" />
						Hold & drag to reorder
					</span>
				{/if}
			</div>
			
			<!-- Grid with 3 columns on mobile -->
			<div class="grid grid-cols-3 gap-2">
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
						ontouchstart={(e) => handleTouchStart(e, index)}
						ontouchend={handleTouchEnd}
						class={cn(
							"relative aspect-square rounded-xl overflow-hidden group",
							"ring-2 ring-transparent transition-all duration-200",
							index === 0 && "ring-pink-400 ring-offset-2",
							draggedIndex === index && "scale-105 shadow-lg z-10"
						)}
					>
						<img 
							src={image.url} 
							alt={`Photo ${index + 1}`}
							class="w-full h-full object-cover"
						/>
						
						{#if index === 0}
							<div class="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
								<Star class="w-3 h-3 fill-white" />
								Cover
							</div>
						{/if}
						
						{#if image.isUploading}
							<!-- Upload Progress -->
							<div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
								<div class="w-12 h-12 rounded-full bg-white/20 p-2">
									<svg class="w-full h-full -rotate-90">
										<circle
											cx="50%"
											cy="50%"
											r="45%"
											stroke="white"
											stroke-width="3"
											fill="none"
											opacity="0.3"
										/>
										<circle
											cx="50%"
											cy="50%"
											r="45%"
											stroke="white"
											stroke-width="3"
											fill="none"
											stroke-linecap="round"
											stroke-dasharray={`${uploadProgress * 0.9} 100`}
										/>
									</svg>
								</div>
								<span class="text-white text-xs mt-2">{uploadProgress}%</span>
							</div>
						{:else}
							<!-- Remove Button -->
							<button
								type="button"
								onclick={() => removeImage(index)}
								class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
							>
								<X class="w-3.5 h-3.5 text-white" />
							</button>
						{/if}
					</div>
				{/each}
				
				{#if $formData.images.length < 10}
					<!-- Add More Button -->
					<button
						type="button"
						onclick={() => fileInput?.click()}
						disabled={isUploading}
						class="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
					>
						<Plus class="w-6 h-6 text-gray-400" />
						<span class="text-xs text-gray-500">Add</span>
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Initial Upload Area -->
		<button
			type="button"
			onclick={() => fileInput?.click()}
			disabled={isUploading}
			class="w-full"
		>
			<div class="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-pink-200 hover:border-pink-300 transition-all duration-200">
				<div class="flex flex-col items-center gap-4">
					<div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
						<Camera class="w-10 h-10 text-pink-500" />
					</div>
					
					<div class="text-center">
						<p class="text-lg font-semibold text-gray-900 mb-1">
							Tap to add photos
						</p>
						<p class="text-sm text-gray-600">
							or drag and drop up to 10 images
						</p>
					</div>
					
					<div class="flex items-center gap-2 text-xs text-gray-500">
						<ImageIcon class="w-4 h-4" />
						<span>JPG, PNG up to 5MB each</span>
					</div>
				</div>
			</div>
		</button>
	{/if}
	
	<!-- Hidden File Input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		onchange={handleFileSelect}
		class="hidden"
	/>
	
	{#if $errors.images}
		<p class="text-sm text-red-600 flex items-center gap-1">
			<AlertCircle class="w-3 h-3" />
			{$errors.images}
		</p>
	{/if}
	
	<!-- Photo Quality Checklist -->
	<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
		<h4 class="font-medium text-amber-900 mb-3 text-sm flex items-center gap-2">
			<Sparkles class="w-4 h-4" />
			Photo checklist for best results
		</h4>
		<div class="space-y-2">
			{#each photoTips as tip, i}
				<div class="flex items-start gap-2">
					<div class={cn(
						"w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
						i < ($formData.images?.length || 0) 
							? "bg-green-500 text-white" 
							: "bg-amber-200 text-amber-700"
					)}>
						{#if i < ($formData.images?.length || 0)}
							<Check class="w-3 h-3" />
						{:else}
							<span class="text-xs font-bold">{i + 1}</span>
						{/if}
					</div>
					<span class="text-xs text-amber-800">{tip}</span>
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Quick Camera Tips -->
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-blue-50 rounded-lg p-3 text-center">
			<div class="text-2xl mb-1">☀️</div>
			<p class="text-xs font-medium text-blue-900">Natural light</p>
			<p class="text-xs text-blue-700">Near a window</p>
		</div>
		<div class="bg-purple-50 rounded-lg p-3 text-center">
			<div class="text-2xl mb-1">📐</div>
			<p class="text-xs font-medium text-purple-900">Multiple angles</p>
			<p class="text-xs text-purple-700">Front, back, sides</p>
		</div>
	</div>
</div>

<style>
	/* Smooth drag animation */
	[draggable="true"] {
		cursor: move;
		-webkit-user-drag: element;
	}
	
	/* Prevent image selection on mobile */
	img {
		-webkit-user-select: none;
		user-select: none;
		-webkit-touch-callout: none;
	}
</style>