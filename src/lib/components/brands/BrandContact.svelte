<script lang="ts">
	import { Link2, Globe, Instagram, Facebook, Twitter, Youtube } from 'lucide-svelte';

	interface Props {
		brandWebsite: string;
		brandInstagram: string;
		brandFacebook: string;
		brandTwitter: string;
		brandYoutube: string;
		brandTiktok: string;
	}

	let { 
		brandWebsite = $bindable(), 
		brandInstagram = $bindable(), 
		brandFacebook = $bindable(), 
		brandTwitter = $bindable(), 
		brandYoutube = $bindable(), 
		brandTiktok = $bindable() 
	}: Props = $props();
</script>

<div class="space-y-6">
	<div class="text-center mb-6">
		<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<Link2 class="w-8 h-8 text-purple-600" />
		</div>
		<h2 class="text-2xl font-semibold text-gray-900">Social Media</h2>
		<p class="text-gray-600 mt-2">Connect your social accounts to build trust (optional)</p>
	</div>
	
	<div class="grid gap-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<Globe class="w-4 h-4" />
				Website
			</label>
			<input
				type="url"
				bind:value={brandWebsite}
				placeholder="https://yourbrand.com"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<Instagram class="w-4 h-4" />
				Instagram
			</label>
			<input
				type="text"
				bind:value={brandInstagram}
				placeholder="https://instagram.com/yourbrand"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<Facebook class="w-4 h-4" />
				Facebook
			</label>
			<input
				type="text"
				bind:value={brandFacebook}
				placeholder="https://facebook.com/yourbrand"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<Twitter class="w-4 h-4" />
				Twitter
			</label>
			<input
				type="text"
				bind:value={brandTwitter}
				placeholder="https://twitter.com/yourbrand"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<Youtube class="w-4 h-4" />
				YouTube
			</label>
			<input
				type="text"
				bind:value={brandYoutube}
				placeholder="https://youtube.com/@yourbrand"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
		
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
				</svg>
				TikTok
			</label>
			<input
				type="text"
				bind:value={brandTiktok}
				placeholder="https://tiktok.com/@yourbrand"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			/>
		</div>
	</div>
</div>