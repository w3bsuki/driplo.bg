<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showSkipOption?: boolean;
	}

	let { children, showSkipOption = true }: Props = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		{@render children()}
		
		{#if showSkipOption}
			<!-- Skip for Now -->
			<div class="text-center mt-6">
				<a href="/" class="text-gray-500 hover:text-gray-700 text-sm">
					Skip for now
				</a>
			</div>
		{/if}
	</div>
</div>