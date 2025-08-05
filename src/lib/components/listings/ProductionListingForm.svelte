<script lang="ts">
	import { Upload, X, Plus, ChevronDown, Loader2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';
	import type { createListingSchema } from '$lib/schemas/listing';
	
	interface Props {
		form: SuperValidated<z.infer<typeof createListingSchema>>;
		categories: any[];
		hasPaymentAccount: boolean;
	}
	
	let { form, categories, hasPaymentAccount }: Props = $props();
	
	// State
	let images = $state<File[]>([]);
	let imagePreviews = $state<string[]>([]);
	let isDragging = $state(false);
	let isSubmitting = $state(false);
	let uploadError = $state('');
	let uploadProgress = $state(0);
	let fileInputRef: HTMLInputElement;
	
	// Image handling
	function handleFiles(files: FileList) {
		const newImages = Array.from(files).slice(0, 10 - images.length);
		images = [...images, ...newImages];
		
		// Create previews
		newImages.forEach(file => {
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreviews = [...imagePreviews, e.target?.result as string];
			};
			reader.readAsDataURL(file);
		});
	}
	
	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			handleFiles(e.dataTransfer.files);
		}
	}
	
	// Prepare form data with images
	function prepareFormData(formData: FormData) {
		// Add image files to form data
		images.forEach((file, index) => {
			formData.append(`imageFiles`, file);
		});
		
		// Add the number of images for server validation
		formData.append('imageCount', images.length.toString());
	}
	
	const conditions = [
		{ value: 'new_with_tags', label: 'New with tags' },
		{ value: 'new_without_tags', label: 'New without tags' },
		{ value: 'very_good', label: 'Very good' },
		{ value: 'good', label: 'Good' },
		{ value: 'satisfactory', label: 'Satisfactory' }
	];
</script>

<form 
	method="POST" 
	action="?/create" 
	use:enhance={({ formData }) => {
		if (!hasPaymentAccount) {
			uploadError = 'Please add a payment method in your profile before creating listings.';
			return async () => {};
		}
		
		if (images.length === 0) {
			uploadError = 'Please add at least one image.';
			return async () => {};
		}
		
		isSubmitting = true;
		uploadError = '';
		uploadProgress = 0;
		
		// Prepare form data with images
		prepareFormData(formData);
		
		return async ({ result, update }) => {
			isSubmitting = false;
			uploadProgress = 0;
			
			if (result.type === 'redirect') {
				// Success - will redirect automatically
			} else if (result.type === 'failure') {
				uploadError = result.data?.error || 'Failed to create listing';
			}
			
			await update();
		};
	}}
>
	<div class="max-w-3xl mx-auto bg-white">
		<!-- Header -->
		<div class="border-b px-4 py-4">
			<h1 class="text-xl font-semibold">Add a listing</h1>
		</div>
		
		<div class="p-4 space-y-6">
			<!-- Payment Warning -->
			{#if !hasPaymentAccount}
				<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p class="text-sm text-yellow-800">
						You need to add a payment method before creating listings. 
						<a href="/settings/payments" class="font-medium underline">Add payment method</a>
					</p>
				</div>
			{/if}
			
			<!-- Photos Section -->
			<div>
				<h2 class="text-base font-medium mb-3">Photos</h2>
				<div class="space-y-3">
					<!-- Image Grid -->
					{#if imagePreviews.length > 0}
						<div class="grid grid-cols-3 gap-3">
							{#each imagePreviews as preview, index}
								<div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
									<img src={preview} alt="" class="w-full h-full object-cover" />
									<button
										type="button"
										onclick={() => removeImage(index)}
										class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X class="w-4 h-4" />
									</button>
									{#if index === 0}
										<div class="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
											Cover photo
										</div>
									{/if}
								</div>
							{/each}
							
							{#if imagePreviews.length < 10}
								<button
									type="button"
									onclick={() => fileInputRef?.click()}
									class="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors"
								>
									<Plus class="w-6 h-6 text-gray-400 mb-1" />
									<span class="text-xs text-gray-500">Add photo</span>
								</button>
							{/if}
						</div>
					{/if}
					
					<!-- Upload Area -->
					{#if imagePreviews.length === 0}
						<div
							ondrop={handleDrop}
							ondragover={(e) => { e.preventDefault(); isDragging = true; }}
							ondragleave={() => isDragging = false}
							onclick={() => fileInputRef?.click()}
							class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}"
						>
							<Upload class="w-12 h-12 mx-auto text-gray-400 mb-3" />
							<p class="text-sm font-medium text-gray-700 mb-1">Add up to 10 photos</p>
							<p class="text-xs text-gray-500">or drag and drop</p>
						</div>
					{/if}
					
					<input
						bind:this={fileInputRef}
						type="file"
						multiple
						accept="image/*"
						onchange={(e) => e.currentTarget.files && handleFiles(e.currentTarget.files)}
						class="hidden"
					/>
				</div>
			</div>
			
			<!-- Title -->
			<div>
				<label for="title" class="block text-base font-medium mb-2">Title</label>
				<input
					id="title"
					name="title"
					type="text"
					value={form.data.title}
					placeholder="e.g. White COS shirt"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>
			
			<!-- Description -->
			<div>
				<label for="description" class="block text-base font-medium mb-2">Describe your item</label>
				<textarea
					id="description"
					name="description"
					value={form.data.description}
					placeholder="e.g. only worn a few times, true to size"
					rows="4"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
				/>
			</div>
			
			<!-- Category & Details Grid -->
			<div class="grid grid-cols-2 gap-4">
				<!-- Category -->
				<div>
					<label for="category_id" class="block text-base font-medium mb-2">Category</label>
					<div class="relative">
						<select
							id="category_id"
							name="category_id"
							value={form.data.category_id}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
						>
							<option value="">Select category</option>
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
						<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
					</div>
				</div>
				
				<!-- Brand -->
				<div>
					<label for="brand" class="block text-base font-medium mb-2">Brand</label>
					<input
						id="brand"
						name="brand"
						type="text"
						value={form.data.brand}
						placeholder="e.g. COS"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				
				<!-- Size -->
				<div>
					<label for="size" class="block text-base font-medium mb-2">Size</label>
					<input
						id="size"
						name="size"
						type="text"
						value={form.data.size}
						placeholder="e.g. M / 38 / 10"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				
				<!-- Condition -->
				<div>
					<label for="condition" class="block text-base font-medium mb-2">Condition</label>
					<div class="relative">
						<select
							id="condition"
							name="condition"
							value={form.data.condition}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
						>
							{#each conditions as condition}
								<option value={condition.value}>{condition.label}</option>
							{/each}
						</select>
						<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
					</div>
				</div>
			</div>
			
			<!-- Price -->
			<div>
				<label for="price" class="block text-base font-medium mb-2">Price</label>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
					<input
						id="price"
						name="price"
						type="number"
						value={form.data.price}
						placeholder="0.00"
						step="0.01"
						min="0.01"
						required
						class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>
			
			<!-- Shipping -->
			<div>
				<p class="text-base font-medium mb-3">Shipping</p>
				<div class="space-y-2">
					<label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 {form.data.shipping_type === 'standard' ? 'border-blue-500 bg-blue-50' : ''}">
						<input
							type="radio"
							name="shipping_type"
							value="standard"
							checked={form.data.shipping_type === 'standard'}
							class="mr-3"
						/>
						<div class="flex-1">
							<p class="font-medium text-sm">Standard shipping</p>
							<p class="text-xs text-gray-500">Buyer pays shipping</p>
						</div>
					</label>
					
					<label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 {form.data.shipping_type === 'pickup' ? 'border-blue-500 bg-blue-50' : ''}">
						<input
							type="radio"
							name="shipping_type"
							value="pickup"
							checked={form.data.shipping_type === 'pickup'}
							class="mr-3"
						/>
						<div class="flex-1">
							<p class="font-medium text-sm">Local pickup</p>
							<p class="text-xs text-gray-500">Buyer picks up the item</p>
						</div>
					</label>
				</div>
			</div>
			
			<!-- Hidden fields -->
			<input type="hidden" name="location_city" value="Sofia" />
			<input type="hidden" name="shipping_cost" value="0" />
			<input type="hidden" name="color" value="" />
			<input type="hidden" name="ships_worldwide" value="false" />
			
			<!-- Submit Button -->
			<div class="pt-4">
				<button
					type="submit"
					disabled={!form.data.title || !form.data.price || images.length === 0 || isSubmitting || !hasPaymentAccount}
					class="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
				>
					{#if isSubmitting}
						<Loader2 class="w-5 h-5 animate-spin mr-2" />
						Creating listing...
					{:else}
						Upload
					{/if}
				</button>
			</div>
			
			{#if uploadError}
				<div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
					{uploadError}
				</div>
			{/if}
		</div>
	</div>
</form>

<style>
	/* Hide number input spinners */
	input[type="number"]::-webkit-inner-spin-button,
	input[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	
	input[type="number"] {
		-moz-appearance: textfield;
	}
</style>