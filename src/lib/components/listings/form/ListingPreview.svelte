<script lang="ts">
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/currency';
	import Image from '$lib/components/ui/Image.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import BrandBadge from '$lib/components/ui/BrandBadge.svelte';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui';
	import * as m from '$lib/paraglide/messages.js';
	import type { CreateListingFormData } from '$lib/schemas/listing';

	interface Props {
		formData: Partial<CreateListingFormData>;
		user?: {
			id?: string;
			username?: string;
			avatar?: string;
			account_type?: string;
			is_verified?: boolean;
			email?: string;
		} | null;
		isOpen: boolean;
		onClose: () => void;
		onEdit: () => void;
		onPublish: () => void;
		isSubmitting?: boolean;
	}

	let { 
		formData, 
		user, 
		isOpen = false, 
		onClose, 
		onEdit, 
		onPublish,
		isSubmitting = false
	}: Props = $props();

	let currentImageIndex = $state(0);
	let activeTab = $state('description');
	
	// Computed values
	let images = $derived(formData.images || []);
	let hasMultipleImages = $derived(images.length > 1);
	let hasImages = $derived(images.length > 0);
	
	// Navigation functions
	function nextImage() {
		if (hasMultipleImages) {
			currentImageIndex = (currentImageIndex + 1) % images.length;
		}
	}

	function prevImage() {
		if (hasMultipleImages) {
			currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
		}
	}

	// Get condition badge styling
	function getConditionBadge(condition: string) {
		switch (condition) {
			case 'new':
				return { label: 'New', class: '!bg-blue-500 !text-white !border-blue-500' };
			case 'like_new':
				return { label: 'Like New', class: '!bg-green-500 !text-white !border-green-500' };
			case 'good':
				return { label: 'Good', class: '!bg-amber-500 !text-white !border-amber-500' };
			case 'fair':
				return { label: 'Fair', class: '!bg-red-500 !text-white !border-red-500' };
			default:
				return { label: condition, class: '' };
		}
	}

	// Get avatar gradient
	function getAvatarGradient(username: string): string {
		const colors = [
			'from-blue-500 to-purple-500',
			'from-green-500 to-blue-500',
			'from-blue-300 to-red-500',
			'from-purple-500 to-pink-500',
			'from-yellow-500 to-blue-300',
			'from-pink-500 to-red-500'
		];
		const index = username.charCodeAt(0) % colors.length;
		return colors[index];
	}

	// Get shipping info text
	function getShippingInfo() {
		if (formData.shipping_type === 'pickup') {
			return `📍 Local pickup in ${formData.location_city}`;
		}
		
		let text = formData.shipping_type === 'express' ? '🚀 Express shipping' : '📦 Standard shipping';
		if (formData.shipping_cost && formData.shipping_cost > 0) {
			text += ` • ${formatCurrency(formData.shipping_cost)}`;
		} else {
			text += ' • Free';
		}
		if (formData.ships_worldwide) {
			text += ' • 🌍 Ships worldwide';
		}
		return text;
	}
</script>

<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<DialogContent class="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-0">
		<DialogHeader class="p-6 pb-4 border-b sticky top-0 bg-white z-10">
			<DialogTitle class="text-xl font-semibold">Preview Your Listing</DialogTitle>
			<p class="text-sm text-muted-foreground mt-1">
				This is how your listing will appear to buyers
			</p>
		</DialogHeader>

		<div class="p-6">
			<!-- Mobile Layout (default) -->
			<div class="lg:hidden space-y-6">
				<!-- Image Gallery Mobile -->
				<div class="space-y-3">
					<div class="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
						{#if hasImages}
							<Image
								src={images[currentImageIndex]}
								alt={formData.title || 'Listing preview'}
								class="w-full h-full"
								objectFit="cover"
								preferredSize="large"
								loading="eager"
							/>
							
							{#if hasMultipleImages}
								<!-- Navigation buttons -->
								<button
									onclick={prevImage}
									class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
								>
									<span class="text-lg">⬅️</span>
								</button>
								<button
									onclick={nextImage}
									class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
								>
									<span class="text-lg">➡️</span>
								</button>

								<!-- Image indicators -->
								<div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
									{#each images as _, index}
										<button
											onclick={() => currentImageIndex = index}
											class={cn("w-1.5 h-1.5 rounded-full transition-all", 
												index === currentImageIndex ? "bg-white w-6" : "bg-white/60"
											)}
										/>
									{/each}
								</div>
							{/if}
						{:else}
							<div class="w-full h-full flex items-center justify-center">
								<div class="text-center">
									<span class="text-4xl">📷</span>
									<p class="text-sm text-gray-500 mt-2">No images uploaded</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Thumbnail strip -->
					{#if hasMultipleImages}
						<div class="flex gap-2 overflow-x-auto">
							{#each images as image, index}
								<button
									onclick={() => currentImageIndex = index}
									class={cn("flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
										index === currentImageIndex ? "border-[#87CEEB]" : "border-gray-200"
									)}
								>
									<Image 
										src={image} 
										alt="Product {index + 1}" 
										class="w-full h-full" 
										objectFit="cover"
										preferredSize="thumb"
										loading="eager"
									/>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Product Details Mobile -->
				<div class="space-y-4">
					<!-- Header -->
					<div class="space-y-2">
						<h1 class="text-xl font-semibold">{formData.title || 'Untitled Listing'}</h1>
						<div class="flex items-center gap-3">
							<span class="text-2xl font-bold text-[#87CEEB]">
								{formatCurrency(formData.price || 0)}
							</span>
						</div>
						
						<!-- Quick info -->
						<div class="flex items-center gap-2 flex-wrap text-sm">
							{#if formData.size}
								<span class="px-2 py-0.5 bg-gray-100 rounded">Size {formData.size}</span>
							{/if}
							{#if formData.condition}
								<Badge 
									variant="outline"
									class={cn("font-medium", getConditionBadge(formData.condition).class)}
								>
									{getConditionBadge(formData.condition).label}
								</Badge>
							{/if}
							{#if formData.brand}
								<span class="px-2 py-0.5 bg-gray-100 rounded">{formData.brand}</span>
							{/if}
						</div>
					</div>

					<!-- Description -->
					<div class="space-y-1">
						<h3 class="font-medium">Description</h3>
						<p class="text-sm text-gray-600">
							{formData.description || 'No description provided'}
						</p>
					</div>

					<!-- Details -->
					<div class="space-y-3 pt-2">
						{#if formData.color}
							<div class="flex items-center gap-2 text-sm">
								<span class="text-2xl">🎨</span>
								<span class="text-gray-600">Color:</span>
								<span class="font-medium">{formData.color}</span>
							</div>
						{/if}
						
						{#if formData.materials && formData.materials.length > 0}
							<div class="flex items-center gap-2 text-sm">
								<span class="text-2xl">🧵</span>
								<span class="text-gray-600">Materials:</span>
								<span class="font-medium">{formData.materials.join(', ')}</span>
							</div>
						{/if}

						<div class="flex items-center gap-2 text-sm">
							<span class="text-2xl">📍</span>
							<span class="text-gray-600">Location:</span>
							<span class="font-medium">{formData.location_city || 'Not specified'}</span>
						</div>

						<div class="text-sm">
							<p class="text-gray-600">{getShippingInfo()}</p>
						</div>
					</div>

					<!-- Seller Info -->
					<div class="border-t pt-4">
						<h3 class="font-medium mb-3">Seller</h3>
						<div class="flex items-center gap-3">
							{#if user?.avatar}
								<img
									src={user.avatar}
									alt={user.username || ''}
									class="h-10 w-10 rounded-full object-cover"
								/>
							{:else if user}
								<div class="h-10 w-10 rounded-full bg-gradient-to-br {getAvatarGradient(user.username || 'U')} flex items-center justify-center">
									<span class="text-sm font-medium text-white">
										{(user.username || 'U').charAt(0).toUpperCase()}
									</span>
								</div>
							{:else}
								<div class="h-10 w-10 rounded-full bg-gray-200"></div>
							{/if}
							<div>
								<p class="font-medium flex items-center gap-2">
									{user?.username || 'Your username'}
									{#if user?.account_type === 'brand'}
										<BrandBadge size="xs" isVerified={user.is_verified} />
									{/if}
								</p>
								<p class="text-xs text-gray-500">Member since today</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Desktop Layout -->
			<div class="hidden lg:grid lg:grid-cols-2 lg:gap-8">
				<!-- Left: Image Gallery -->
				<div class="space-y-4">
					<div class="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
						{#if hasImages}
							<Image
								src={images[currentImageIndex]}
								alt={formData.title || 'Listing preview'}
								class="w-full h-full"
								objectFit="cover"
								preferredSize="large"
								loading="eager"
							/>
							
							{#if hasMultipleImages}
								<!-- Navigation buttons -->
								<button
									onclick={prevImage}
									class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
								>
									<span class="text-xl">⬅️</span>
								</button>
								<button
									onclick={nextImage}
									class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
								>
									<span class="text-xl">➡️</span>
								</button>

								<!-- Image indicators -->
								<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
									{#each images as _, index}
										<button
											onclick={() => currentImageIndex = index}
											class={cn("w-2 h-2 rounded-full transition-all", 
												index === currentImageIndex ? "bg-white w-8" : "bg-white/60"
											)}
										/>
									{/each}
								</div>
							{/if}
						{:else}
							<div class="w-full h-full flex items-center justify-center">
								<div class="text-center">
									<span class="text-6xl">📷</span>
									<p class="text-gray-500 mt-3">No images uploaded</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Thumbnail grid -->
					{#if hasMultipleImages}
						<div class="grid grid-cols-6 gap-2">
							{#each images as image, index}
								<button
									onclick={() => currentImageIndex = index}
									class={cn("aspect-square rounded overflow-hidden border-2 transition-all",
										index === currentImageIndex ? "border-[#87CEEB] shadow-md" : "border-gray-200 hover:border-gray-300"
									)}
								>
									<Image 
										src={image} 
										alt="Product {index + 1}" 
										class="w-full h-full" 
										objectFit="cover"
										preferredSize="thumb"
										loading="eager"
									/>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Right: Product Details -->
				<div class="space-y-6">
					<!-- Header -->
					<div class="space-y-3">
						<h1 class="text-2xl font-semibold">{formData.title || 'Untitled Listing'}</h1>
						<div class="flex items-center gap-4">
							<span class="text-3xl font-bold text-[#87CEEB]">
								{formatCurrency(formData.price || 0)}
							</span>
						</div>
						
						<!-- Quick info -->
						<div class="flex items-center gap-2 flex-wrap">
							{#if formData.size}
								<span class="px-3 py-1 bg-gray-100 rounded text-sm">Size {formData.size}</span>
							{/if}
							{#if formData.condition}
								<Badge 
									variant="outline"
									class={cn("font-medium", getConditionBadge(formData.condition).class)}
								>
									{getConditionBadge(formData.condition).label}
								</Badge>
							{/if}
							{#if formData.brand}
								<span class="px-3 py-1 bg-gray-100 rounded text-sm">{formData.brand}</span>
							{/if}
						</div>
					</div>

					<!-- Description -->
					<div class="space-y-2">
						<h3 class="font-medium text-lg">Description</h3>
						<p class="text-gray-600 whitespace-pre-wrap">
							{formData.description || 'No description provided'}
						</p>
					</div>

					<!-- Details Grid -->
					<div class="grid grid-cols-2 gap-4 py-4 border-y">
						{#if formData.color}
							<div>
								<p class="text-sm text-gray-500">Color</p>
								<p class="font-medium">{formData.color}</p>
							</div>
						{/if}
						
						{#if formData.materials && formData.materials.length > 0}
							<div>
								<p class="text-sm text-gray-500">Materials</p>
								<p class="font-medium">{formData.materials.join(', ')}</p>
							</div>
						{/if}

						<div>
							<p class="text-sm text-gray-500">Location</p>
							<p class="font-medium">{formData.location_city || 'Not specified'}</p>
						</div>

						<div>
							<p class="text-sm text-gray-500">Shipping</p>
							<p class="font-medium text-sm">{getShippingInfo()}</p>
						</div>
					</div>

					<!-- Seller Info -->
					<div class="bg-gray-50 rounded-lg p-4">
						<h3 class="font-medium mb-3">Sold by</h3>
						<div class="flex items-center gap-3">
							{#if user?.avatar}
								<img
									src={user.avatar}
									alt={user.username || ''}
									class="h-12 w-12 rounded-full object-cover"
								/>
							{:else if user}
								<div class="h-12 w-12 rounded-full bg-gradient-to-br {getAvatarGradient(user.username || 'U')} flex items-center justify-center">
									<span class="text-lg font-medium text-white">
										{(user.username || 'U').charAt(0).toUpperCase()}
									</span>
								</div>
							{:else}
								<div class="h-12 w-12 rounded-full bg-gray-200"></div>
							{/if}
							<div>
								<p class="font-medium flex items-center gap-2">
									{user?.username || 'Your username'}
									{#if user?.account_type === 'brand'}
										<BrandBadge size="xs" isVerified={user.is_verified} />
									{/if}
								</p>
								<p class="text-sm text-gray-500">Member since today</p>
							</div>
						</div>
					</div>

					<!-- Tags -->
					{#if formData.tags && formData.tags.length > 0}
						<div>
							<h3 class="font-medium mb-2">Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each formData.tags as tag}
									<span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
										#{tag}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Actions Footer -->
		<div class="sticky bottom-0 bg-white border-t p-6 flex items-center justify-between gap-4">
			<Button
				variant="ghost"
				onclick={onEdit}
				disabled={isSubmitting}
			>
				⬅️ Back to Edit
			</Button>
			
			<div class="flex items-center gap-3">
				<Button
					variant="outline"
					onclick={onClose}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					onclick={onPublish}
					disabled={isSubmitting}
					class="bg-[#87CEEB] hover:bg-[#6BB8D6] text-white"
				>
					{#if isSubmitting}
						<span class="flex items-center gap-2">
							<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							Publishing...
						</span>
					{:else}
						🚀 Publish Listing
					{/if}
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>