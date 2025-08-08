<script lang="ts">
	import { ImageIcon } from 'lucide-svelte';
	import ImageUpload from '$lib/components/upload/ImageUpload.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		coverUrl: string | null;
		uploading: boolean;
		onUpload: (event: CustomEvent<{ file: File; preview: string }>) => void;
	}

	let { coverUrl, uploading, onUpload }: Props = $props();
</script>

<!-- Cover Image -->
<div class="relative">
	<div class="h-32 sm:h-48 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
		{#if coverUrl}
			<img src={coverUrl} alt="Cover" class="w-full h-full object-cover" />
		{/if}
	</div>
	<div class="absolute inset-0 flex items-center justify-center">
		<div class="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
			<ImageIcon class="w-6 h-6 text-gray-700 mb-2" />
			<p class="text-sm font-medium text-gray-700 mb-3">{m.settings_cover_image()}</p>
			<ImageUpload
				currentImage={coverUrl}
				placeholder={m.settings_cover_image()}
				aspectRatio="cover"
				disabled={uploading}
				onupload={onUpload}
				class="!w-32 !h-20"
			/>
		</div>
	</div>
</div>