<script lang="ts">
	import { Building2 } from 'lucide-svelte';

	interface Props {
		brandName: string;
		brandCategory: string;
		brandDescription: string;
	}

	let { brandName = $bindable(), brandCategory = $bindable(), brandDescription = $bindable() }: Props = $props();

	const brandCategories = [
		'Fashion & Apparel',
		'Accessories', 
		'Footwear',
		'Jewelry',
		'Bags & Luggage',
		'Beauty & Cosmetics',
		'Vintage & Thrift',
		'Handmade & Artisan',
		'Sustainable Fashion',
		'Streetwear',
		'Luxury Fashion',
		'Other'
	];
</script>

<div class="space-y-6">
	<div class="text-center mb-6">
		<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<Building2 class="w-8 h-8 text-purple-600" />
		</div>
		<h2 class="text-2xl font-semibold text-gray-900">Brand Basics</h2>
		<p class="text-gray-600 mt-2">Let's start with your brand's essential information</p>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Name <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			bind:value={brandName}
			placeholder="Enter your brand name"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			maxlength="100"
		/>
		<p class="mt-1 text-xs text-gray-500">This will be your official brand name on Driplo</p>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Category <span class="text-red-500">*</span>
		</label>
		<select
			bind:value={brandCategory}
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
		>
			<option value="">Select a category</option>
			{#each brandCategories as category}
				<option value={category}>{category}</option>
			{/each}
		</select>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Description <span class="text-red-500">*</span>
		</label>
		<textarea
			bind:value={brandDescription}
			placeholder="Describe what your brand is about..."
			rows="4"
			maxlength="500"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
		></textarea>
		<p class="mt-1 text-xs text-gray-500">{brandDescription.length}/500 characters</p>
	</div>
</div>