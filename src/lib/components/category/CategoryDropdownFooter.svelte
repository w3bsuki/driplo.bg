<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onNavigateTo: (path: string) => void;
	}

	let { onNavigateTo }: Props = $props();
</script>

<!-- Footer -->
<div class="border-t border-gray-200 p-4 bg-gray-50">
	<div class="flex items-center justify-between text-sm">
		<span class="text-gray-600">{m.category_need_help()}</span>
		<button
			onclick={() => onNavigateTo('/browse')}
			class="text-blue-400 hover:text-blue-500 font-medium"
		>
			{m.category_browse_all_link()}
		</button>
	</div>
</div>