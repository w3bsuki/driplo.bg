<script lang="ts">
	import { onMount } from 'svelte';
	import { Sparkles } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onSuggestionClick: (term: string) => void;
		class?: string;
		maxVisible?: number;
	}

	let {
		onSuggestionClick,
		class: className = '',
		maxVisible = 4
	}: Props = $props();

	let suggestions = $state<string[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/search/suggestions');
			if (response.ok) {
				const data = await response.json();
				suggestions = data.suggestions || [];
			}
		} catch (error) {
			console.error('Failed to load search suggestions:', error);
		} finally {
			loading = false;
		}
	});

	const visibleSuggestions = $derived(suggestions.slice(0, maxVisible));

	function handleKeyDown(event: KeyboardEvent, term: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSuggestionClick(term);
		}
	}
</script>

{#if !loading && visibleSuggestions.length > 0}
	<div class={cn("mt-3 pt-3 border-t border-gray-100", className)}>
		<div class="flex items-center gap-1.5 mb-2">
			<Sparkles class="h-3.5 w-3.5 text-purple-500" />
			<span class="text-xs font-medium text-gray-700">Popular right now</span>
		</div>
		<div class="grid grid-cols-2 gap-2">
			{#each visibleSuggestions as suggestion}
				<button
					onclick={() => onSuggestionClick(suggestion)}
					onkeydown={(e) => handleKeyDown(e, suggestion)}
					class={cn(
						"text-left px-2.5 py-1.5 text-xs rounded-lg",
						"bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700",
						"transition-all duration-200",
						"focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-1"
					)}
					aria-label={`Search for ${suggestion}`}
				>
					{suggestion}
				</button>
			{/each}
		</div>
	</div>
{/if}