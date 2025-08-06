<script lang="ts">
	import { Check, Building2, Globe, Instagram, Facebook, Twitter, Youtube, Sparkles } from 'lucide-svelte';

	interface Props {
		brandName: string;
		brandCategory: string;
		brandDescription: string;
		brandStory: string;
		brandLogoPreview: string;
		brandWebsite: string;
		brandInstagram: string;
		brandFacebook: string;
		brandTwitter: string;
		brandYoutube: string;
		brandTiktok: string;
	}

	let {
		brandName,
		brandCategory,
		brandDescription,
		brandStory,
		brandLogoPreview,
		brandWebsite,
		brandInstagram,
		brandFacebook,
		brandTwitter,
		brandYoutube,
		brandTiktok
	}: Props = $props();

	const hasSocialMedia = $derived(
		brandWebsite || brandInstagram || brandFacebook || brandTwitter || brandYoutube || brandTiktok
	);
</script>

<div class="space-y-6">
	<div class="text-center mb-6">
		<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<Check class="w-8 h-8 text-purple-600" />
		</div>
		<h2 class="text-2xl font-semibold text-gray-900">Review & Confirm</h2>
		<p class="text-gray-600 mt-2">Review your brand information before creating your profile</p>
	</div>
	
	<div class="space-y-4">
		<!-- Logo & Name -->
		<div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
			{#if brandLogoPreview}
				<img src={brandLogoPreview} alt="Logo" class="w-16 h-16 rounded-lg object-cover" />
			{:else}
				<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
					<Building2 class="w-8 h-8 text-gray-400" />
				</div>
			{/if}
			<div>
				<h3 class="font-semibold text-gray-900">{brandName}</h3>
				<p class="text-sm text-gray-600">{brandCategory}</p>
			</div>
		</div>
		
		<!-- Description -->
		<div class="p-4 bg-gray-50 rounded-lg">
			<h4 class="font-medium text-gray-900 mb-2">Description</h4>
			<p class="text-sm text-gray-600">{brandDescription}</p>
		</div>
		
		<!-- Story -->
		{#if brandStory}
			<div class="p-4 bg-gray-50 rounded-lg">
				<h4 class="font-medium text-gray-900 mb-2">Brand Story</h4>
				<p class="text-sm text-gray-600 line-clamp-3">{brandStory}</p>
			</div>
		{/if}
		
		<!-- Social Media -->
		{#if hasSocialMedia}
			<div class="p-4 bg-gray-50 rounded-lg">
				<h4 class="font-medium text-gray-900 mb-2">Social Media</h4>
				<div class="flex flex-wrap gap-3">
					{#if brandWebsite}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<Globe class="w-4 h-4" />
							Website
						</div>
					{/if}
					{#if brandInstagram}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<Instagram class="w-4 h-4" />
							Instagram
						</div>
					{/if}
					{#if brandFacebook}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<Facebook class="w-4 h-4" />
							Facebook
						</div>
					{/if}
					{#if brandTwitter}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<Twitter class="w-4 h-4" />
							Twitter
						</div>
					{/if}
					{#if brandYoutube}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<Youtube class="w-4 h-4" />
							YouTube
						</div>
					{/if}
					{#if brandTiktok}
						<div class="flex items-center gap-1 text-sm text-gray-600">
							<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
							</svg>
							TikTok
						</div>
					{/if}
				</div>
			</div>
		{/if}
		
		<div class="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
			<div class="flex gap-3">
				<Sparkles class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
				<div class="text-sm">
					<p class="font-medium text-purple-900 mb-2">What happens next?</p>
					<ul class="space-y-1 text-purple-800">
						<li>• Your brand profile will be created immediately</li>
						<li>• You'll get access to brand analytics and tools</li>
						<li>• Customers will see your brand badge on listings</li>
						<li>• You can apply for verification later</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>