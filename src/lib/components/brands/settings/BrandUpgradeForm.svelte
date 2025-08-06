<script lang="ts">
	import { Store, Shield, Globe, FileText } from 'lucide-svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		brandName: string;
		brandDescription: string;
		brandCategory: string;
		loading: boolean;
		onUpgrade: () => Promise<void>;
	}

	let {
		brandName = $bindable(),
		brandDescription = $bindable(),
		brandCategory = $bindable(),
		loading,
		onUpgrade
	}: Props = $props();
</script>

<!-- Upgrade to Brand Section -->
<div class="bg-white rounded-xl shadow-sm p-8">
	<h2 class="text-2xl font-semibold mb-6">Why upgrade to a Brand Account?</h2>
	
	<div class="grid md:grid-cols-2 gap-6 mb-8">
		<div class="space-y-4">
			<div class="flex gap-3">
				<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<Shield class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h3 class="font-medium">Verified Badge</h3>
					<p class="text-sm text-gray-600">Get a verified checkmark to build trust</p>
				</div>
			</div>
			<div class="flex gap-3">
				<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<Store class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h3 class="font-medium">Brand Storefront</h3>
					<p class="text-sm text-gray-600">Dedicated brand page with custom branding</p>
				</div>
			</div>
		</div>
		<div class="space-y-4">
			<div class="flex gap-3">
				<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<Globe class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h3 class="font-medium">Priority Listing</h3>
					<p class="text-sm text-gray-600">Featured placement in search results</p>
				</div>
			</div>
			<div class="flex gap-3">
				<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<FileText class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h3 class="font-medium">Analytics & Insights</h3>
					<p class="text-sm text-gray-600">Detailed sales and performance data</p>
				</div>
			</div>
		</div>
	</div>
	
	<div class="border-t pt-6 space-y-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Brand Name *
			</label>
			<input
				type="text"
				bind:value={brandName}
				placeholder="Enter your brand name"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Brand Description
			</label>
			<textarea
				bind:value={brandDescription}
				placeholder="Tell us about your brand..."
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Brand Category
			</label>
			<select
				bind:value={brandCategory}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
			>
				<option value="">Select category</option>
				<option value="fashion">Fashion & Apparel</option>
				<option value="accessories">Accessories</option>
				<option value="footwear">Footwear</option>
				<option value="jewelry">Jewelry</option>
				<option value="bags">Bags & Luggage</option>
				<option value="beauty">Beauty & Cosmetics</option>
				<option value="vintage">Vintage & Thrift</option>
				<option value="handmade">Handmade & Artisan</option>
				<option value="sustainable">Sustainable Fashion</option>
				<option value="other">Other</option>
			</select>
		</div>
		
		<button
			onclick={onUpgrade}
			disabled={loading || !brandName.trim()}
			class="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
		>
			{#if loading}
				<Spinner size="sm" color="white" />
			{:else}
				<Store class="w-5 h-5" />
				Upgrade to Brand Account
			{/if}
		</button>
	</div>
</div>