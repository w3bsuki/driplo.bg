<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		brandName: string;
		brandDescription: string;
		brandStory: string;
		brandCategory: string;
		brandWebsite: string;
		brandEstablishedDate: string;
		loading: boolean;
		onUpdate: (data: {
			brandName: string;
			brandDescription: string;
			brandStory: string;
			brandCategory: string;
			brandWebsite: string;
			brandEstablishedDate: string;
		}) => Promise<void>;
	}

	let {
		brandName = $bindable(),
		brandDescription = $bindable(),
		brandStory = $bindable(),
		brandCategory = $bindable(),
		brandWebsite = $bindable(),
		brandEstablishedDate = $bindable(),
		loading,
		onUpdate
	}: Props = $props();

	async function handleSubmit() {
		await onUpdate({
			brandName,
			brandDescription,
			brandStory,
			brandCategory,
			brandWebsite,
			brandEstablishedDate
		});
	}
</script>

<div class="space-y-6">
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Name
		</label>
		<input
			type="text"
			bind:value={brandName}
			class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
		/>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Description
		</label>
		<textarea
			bind:value={brandDescription}
			rows="3"
			class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
		/>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Story
		</label>
		<textarea
			bind:value={brandStory}
			rows="5"
			placeholder="Tell your brand's story..."
			class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
		/>
	</div>
	
	<div class="grid md:grid-cols-2 gap-6">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Category
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
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Established Date
			</label>
			<input
				type="date"
				bind:value={brandEstablishedDate}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
			/>
		</div>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Website
		</label>
		<input
			type="url"
			bind:value={brandWebsite}
			placeholder="https://yourbrand.com"
			class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
		/>
	</div>
	
	<button
		onclick={handleSubmit}
		disabled={loading}
		class="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
	>
		{#if loading}
			<Spinner size="sm" color="white" />
		{:else}
			Save Changes
		{/if}
	</button>
</div>