<script lang="ts">
	import { Camera, Upload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		type: 'logo' | 'cover';
		preview: string;
		uploading: boolean;
		onFileChange: (event: Event) => void;
	}

	let { type, preview, uploading, onFileChange }: Props = $props();

	const config = $derived({
		logo: {
			title: 'Brand Logo',
			description: 'Upload a logo that represents your brand (optional)',
			icon: Camera,
			containerClass: 'w-48 h-48',
			maxSize: '5MB',
			recommendations: 'Recommended: Square image, at least 400x400px, PNG or JPG format. Max size: 5MB'
		},
		cover: {
			title: 'Brand Cover',
			description: 'Add a cover image for your brand profile (optional)',
			icon: Upload,
			containerClass: 'w-full h-64',
			maxSize: '10MB',
			recommendations: 'Recommended: 1920x480px or similar aspect ratio, PNG or JPG format. Max size: 10MB'
		}
	}[type]);

	const IconComponent = config.icon;
</script>

<div class="space-y-6">
	<div class="text-center mb-6">
		<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<IconComponent class="w-8 h-8 text-purple-600" />
		</div>
		<h2 class="text-2xl font-semibold text-gray-900">{config.title}</h2>
		<p class="text-gray-600 mt-2">{config.description}</p>
	</div>
	
	<div class="flex flex-col items-center">
		<div class="relative {type === 'cover' ? 'w-full max-w-2xl' : ''}">
			<div class="{config.containerClass} bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
				{#if preview}
					<img 
						src={preview} 
						alt="Brand {type}"
						class="w-full h-full object-cover"
					/>
				{:else}
					<IconComponent class="w-16 h-16 text-gray-400" />
				{/if}
			</div>
			
			{#if uploading}
				<div class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
					<Spinner size="lg" color="white" />
				</div>
			{/if}
		</div>
		
		<label class="mt-6 cursor-pointer">
			<input
				type="file"
				accept="image/*"
				onchange={onFileChange}
				class="hidden"
				disabled={uploading}
			/>
			<div class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
				<Upload class="w-5 h-5 inline mr-2" />
				{preview ? `Change ${config.title}` : `Upload ${config.title}`}
			</div>
		</label>
		
		<p class="mt-4 text-xs text-gray-500 text-center max-w-sm">
			{config.recommendations}
		</p>
	</div>
</div>