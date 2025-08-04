<script lang="ts">
	import { Upload, X, Image as ImageIcon } from 'lucide-svelte'
	import { cn } from '$lib/utils'
	import { toast } from 'svelte-sonner'
	import Badge from './badge.svelte'
	
	interface Props {
		images?: string[]
		maxImages?: number
		maxSize?: number // in MB
		accept?: string
		onImagesChange?: (images: string[]) => void
		class?: string
	}
	
	let { 
		images = $bindable([]),
		maxImages = 10,
		maxSize = 5,
		accept = 'image/*',
		onImagesChange,
		class: className = ''
	}: Props = $props()
	
	let dragOver = $state(false)
	let fileInput: HTMLInputElement
	
	function handleFiles(files: File[]) {
		const validFiles = files.filter(file => {
			if (!file.type.startsWith('image/')) {
				toast.error(`${file.name} is not an image`)
				return false
			}
			if (file.size > maxSize * 1024 * 1024) {
				toast.error(`${file.name} exceeds ${maxSize}MB limit`)
				return false
			}
			return true
		})
		
		if (images.length + validFiles.length > maxImages) {
			toast.error(`Maximum ${maxImages} images allowed`)
			return
		}
		
		// Convert to base64 or upload to storage
		validFiles.forEach(file => {
			const reader = new FileReader()
			reader.onload = (e) => {
				const url = e.target?.result as string
				images = [...images, url]
				onImagesChange?.(images)
			}
			reader.readAsDataURL(file)
		})
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault()
		dragOver = false
		const files = Array.from(e.dataTransfer?.files || [])
		handleFiles(files)
	}
	
	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement
		const files = Array.from(input.files || [])
		handleFiles(files)
		input.value = ''
	}
	
	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index)
		onImagesChange?.(images)
	}
</script>

<div class={cn("space-y-4", className)}>
	<!-- Image Grid -->
	{#if images.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
			{#each images as image, index}
				<div class="relative aspect-square group">
					<img 
						src={image} 
						alt="Upload {index + 1}"
						class="w-full h-full object-cover rounded-lg border"
					/>
					<button
						type="button"
						onclick={() => removeImage(index)}
						class="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
						aria-label="Remove image"
					>
						<X class="w-3 h-3" />
					</button>
					{#if index === 0}
						<Badge class="absolute bottom-2 left-2 text-xs">Main</Badge>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	
	<!-- Upload Area -->
	{#if images.length < maxImages}
		<div
			class={cn(
				"relative border-2 border-dashed rounded-lg p-8 transition-colors",
				"hover:border-primary/50 hover:bg-muted/50",
				dragOver ? "border-primary bg-primary/5" : "border-border",
				"cursor-pointer"
			)}
			ondragover={(e) => { e.preventDefault(); dragOver = true }}
			ondragleave={() => dragOver = false}
			ondrop={handleDrop}
			onclick={() => fileInput?.click()}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
		>
			<div class="flex flex-col items-center justify-center text-center">
				{#if images.length === 0}
					<Upload class="w-10 h-10 text-muted-foreground mb-4" />
					<p class="text-sm font-medium mb-1">Click or drag to upload</p>
					<p class="text-xs text-muted-foreground">
						{accept} • Max {maxSize}MB per file
					</p>
				{:else}
					<ImageIcon class="w-8 h-8 text-muted-foreground mb-3" />
					<p class="text-sm font-medium">Add more images</p>
					<p class="text-xs text-muted-foreground">
						{images.length}/{maxImages} uploaded
					</p>
				{/if}
			</div>
			
			<input
				bind:this={fileInput}
				type="file"
				multiple
				{accept}
				onchange={handleFileSelect}
				class="sr-only"
			/>
		</div>
	{/if}
</div>