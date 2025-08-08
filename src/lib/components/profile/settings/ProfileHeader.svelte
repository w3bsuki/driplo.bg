<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onGoBack: () => void;
	}

	let { onGoBack }: Props = $props();
</script>

<div class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
		<button
			onclick={onGoBack}
			class="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
		>
			<ArrowLeft class="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
		</button>
		<h1 class="ml-3 text-lg font-semibold text-gray-900">{m.settings_header_title()}</h1>
	</div>
</div>