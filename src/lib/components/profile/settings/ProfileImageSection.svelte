<script lang="ts">
	import { Camera } from 'lucide-svelte';
	import ImageUpload from '$lib/components/upload/ImageUpload.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		avatarUrl: string | null;
		fullName: string;
		username: string;
		uploading: boolean;
		onUpload: (event: CustomEvent<{ file: File; preview: string }>) => void;
	}

	let { avatarUrl, fullName, username, uploading, onUpload }: Props = $props();
</script>

<!-- Profile Photo -->
<div class="px-6 pb-6">
	<div class="flex items-end gap-6 -mt-16 sm:-mt-20">
		<div class="relative">
			<div class="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
				{#if avatarUrl}
					<img src={avatarUrl} alt="Profile" class="w-full h-full object-cover" />
				{/if}
			</div>
			<div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-2xl">
				<div class="text-center">
					<Camera class="w-8 h-8 text-white mx-auto mb-2" />
					<p class="text-xs text-white font-medium">{m.settings_profile_picture()}</p>
				</div>
			</div>
			<div class="absolute bottom-2 right-2">
				<ImageUpload
					currentImage={avatarUrl}
					placeholder=""
					aspectRatio="square"
					disabled={uploading}
					onupload={onUpload}
					class="!w-10 !h-10 !rounded-full bg-primary hover:bg-primary/90 shadow-lg"
					buttonClass="!p-2"
					iconClass="!w-5 !h-5 text-white"
				/>
			</div>
		</div>
		<div class="flex-1 pb-2">
			<h2 class="text-xl font-semibold text-gray-900 mb-1">{fullName || username || 'Your Name'}</h2>
			<p class="text-sm text-gray-500">@{username || 'username'}</p>
		</div>
	</div>
</div>