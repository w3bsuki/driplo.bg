<script lang="ts">
	import { onMount } from 'svelte';
	import { Search } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		searchQuery: string;
		isVisible: boolean;
		onSuggestionClick: (suggestion: string) => void;
		onClose?: () => void;
	}

	let {
		searchQuery,
		isVisible,
		onSuggestionClick,
		onClose
	}: Props = $props();

	let suggestions = $state<string[]>([]);
	let loading = $state(false);

	// Fetch suggestions when search query changes
	$effect(async () => {
		if (searchQuery.trim().length >= 2) {
			loading = true;
			try {
				const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
				if (response.ok) {
					const data = await response.json();
					suggestions = data.suggestions || [];
				}
			} catch (error) {
				console.error('Failed to load search suggestions:', error);
				suggestions = [];
			} finally {
				loading = false;
			}
		} else {
			suggestions = [];
		}
	});

	// Filter suggestions based on current query
	const filteredSuggestions = $derived(
		suggestions.filter(s => 
			s.toLowerCase().includes(searchQuery.toLowerCase()) && 
			s.toLowerCase() !== searchQuery.toLowerCase()
		).slice(0, 6)
	);
</script>

{#if isVisible && searchQuery.trim().length >= 2 && filteredSuggestions.length > 0}
	<div 
		class="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-lg z-50"
		role="listbox"
		aria-label="Search suggestions"
	>
		<ul class="py-2 max-h-64 overflow-y-auto">
			{#each filteredSuggestions as suggestion, index}
				<li role="option">
					<button
						onclick={() => onSuggestionClick(suggestion)}
						class={cn(
							"w-full px-4 py-2.5 text-left",
							"hover:bg-gray-50 transition-colors",
							"focus:outline-none focus:bg-gray-50"
						)}
						aria-label={`Search for ${suggestion}`}
					>
						<span class="text-sm text-gray-700 truncate">{suggestion}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}