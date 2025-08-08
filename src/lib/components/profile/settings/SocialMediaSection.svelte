<script lang="ts">
	import { Link, Instagram, Music2, Facebook, Twitter, Youtube } from 'lucide-svelte';

	interface SocialMediaData {
		instagram: string;
		tiktok: string;
		facebook: string;
		twitter: string;
		youtube: string;
		pinterest: string;
	}

	interface Props {
		socialMedia: SocialMediaData;
		onSocialMediaChange: (platform: keyof SocialMediaData, value: string) => void;
	}

	let { socialMedia, onSocialMediaChange }: Props = $props();
</script>

<!-- Social Media Section -->
<div class="mt-8 pt-8 border-t border-gray-100">
	<h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
		<Link class="w-5 h-5 text-primary" />
		Social Media Accounts
	</h3>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
		<!-- Instagram -->
		<div class="space-y-2">
			<label for="instagram" class="block text-sm font-medium text-gray-700">
				Instagram
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Instagram class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="instagram"
					type="text"
					value={socialMedia.instagram}
					oninput={(e) => onSocialMediaChange('instagram', e.currentTarget.value)}
					placeholder="@username"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- TikTok -->
		<div class="space-y-2">
			<label for="tiktok" class="block text-sm font-medium text-gray-700">
				TikTok
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Music2 class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="tiktok"
					type="text"
					value={socialMedia.tiktok}
					oninput={(e) => onSocialMediaChange('tiktok', e.currentTarget.value)}
					placeholder="@username"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- Facebook -->
		<div class="space-y-2">
			<label for="facebook" class="block text-sm font-medium text-gray-700">
				Facebook
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Facebook class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="facebook"
					type="text"
					value={socialMedia.facebook}
					oninput={(e) => onSocialMediaChange('facebook', e.currentTarget.value)}
					placeholder="username or page"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- Twitter/X -->
		<div class="space-y-2">
			<label for="twitter" class="block text-sm font-medium text-gray-700">
				X (Twitter)
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Twitter class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="twitter"
					type="text"
					value={socialMedia.twitter}
					oninput={(e) => onSocialMediaChange('twitter', e.currentTarget.value)}
					placeholder="@username"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- YouTube -->
		<div class="space-y-2">
			<label for="youtube" class="block text-sm font-medium text-gray-700">
				YouTube
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Youtube class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="youtube"
					type="text"
					value={socialMedia.youtube}
					oninput={(e) => onSocialMediaChange('youtube', e.currentTarget.value)}
					placeholder="@channel"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- Pinterest -->
		<div class="space-y-2">
			<label for="pinterest" class="block text-sm font-medium text-gray-700">
				Pinterest
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.199-2.405.041-3.442.217-.937 1.407-5.965 1.407-5.965s-.359-.718-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.03-.655 2.569-.994 3.994-.283 1.195.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.378-.293 1.189-.332 1.355-.053.219-.173.265-.4.159-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.966 7.398 6.931 0 4.136-2.608 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
					</svg>
				</div>
				<input
					id="pinterest"
					type="text"
					value={socialMedia.pinterest}
					oninput={(e) => onSocialMediaChange('pinterest', e.currentTarget.value)}
					placeholder="username"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>
	</div>
	
	<p class="text-xs text-gray-500 mt-4">Add your social media usernames to help customers find and follow your brand</p>
</div>