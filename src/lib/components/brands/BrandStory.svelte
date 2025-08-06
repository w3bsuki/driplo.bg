<script lang="ts">
	import { FileText } from 'lucide-svelte';

	interface Props {
		brandStory: string;
		brandValues: string;
		brandMission: string;
	}

	let { brandStory = $bindable(), brandValues = $bindable(), brandMission = $bindable() }: Props = $props();
</script>

<div class="space-y-6">
	<div class="text-center mb-6">
		<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
			<FileText class="w-8 h-8 text-purple-600" />
		</div>
		<h2 class="text-2xl font-semibold text-gray-900">Brand Story</h2>
		<p class="text-gray-600 mt-2">Share your brand's journey and what drives you</p>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Your Story <span class="text-red-500">*</span>
		</label>
		<textarea
			bind:value={brandStory}
			placeholder="Tell customers about your brand's journey, inspiration, and what makes you unique..."
			rows="6"
			maxlength="1000"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
		></textarea>
		<p class="mt-1 text-xs text-gray-500">{brandStory.length}/1000 characters</p>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Values (optional)
		</label>
		<textarea
			bind:value={brandValues}
			placeholder="What values does your brand stand for? (e.g., sustainability, quality, innovation)"
			rows="3"
			maxlength="500"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
		></textarea>
	</div>
	
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Brand Mission (optional)
		</label>
		<textarea
			bind:value={brandMission}
			placeholder="What is your brand's mission statement?"
			rows="2"
			maxlength="300"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
		></textarea>
	</div>
</div>