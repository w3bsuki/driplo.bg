<script lang="ts">
	import { X } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();
</script>

<!-- Header -->
<div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
	<h2 class="text-xl font-bold text-gray-900">{m.checkout_title()}</h2>
	<button
		onclick={onClose}
		class="p-2 hover:bg-gray-100 rounded-full transition-colors"
	>
		<X class="w-5 h-5 text-gray-500" />
	</button>
</div>