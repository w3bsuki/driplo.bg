<script lang="ts">
	import { Search, X } from 'lucide-svelte'
	import { cn } from '$lib/utils'

	interface Props {
		value: string
		placeholder?: string
		onSearch: (query: string) => void
		onInput?: (query: string) => void
		class?: string
	}

	let { 
		value = '', 
		placeholder = 'Search for items...', 
		onSearch,
		onInput,
		class: className = ''
	}: Props = $props()

	let suggestions = $state<string[]>([])
	let showSuggestions = $state(false)
	let selectedIndex = $state(-1)
	let searchInput = $state(value)
	let debounceTimer: number

	// Watch for external value changes
	$effect(() => {
		searchInput = value
	})

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement
		searchInput = target.value
		onInput?.(searchInput)

		// Debounce suggestions
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(async () => {
			if (searchInput.length >= 2) {
				await fetchSuggestions(searchInput)
			} else {
				suggestions = []
				showSuggestions = false
			}
		}, 300)
	}

	async function fetchSuggestions(query: string) {
		try {
			const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
			if (response.ok) {
				suggestions = await response.json()
				showSuggestions = suggestions.length > 0
				selectedIndex = -1
			}
		} catch (error) {
			console.error('Error fetching suggestions:', error)
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions) {
			if (event.key === 'Enter') {
				event.preventDefault()
				onSearch(searchInput)
			}
			return
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				selectedIndex = Math.max(selectedIndex - 1, -1)
				break
			case 'Enter':
				event.preventDefault()
				if (selectedIndex >= 0) {
					selectSuggestion(suggestions[selectedIndex])
				} else {
					onSearch(searchInput)
				}
				break
			case 'Escape':
				showSuggestions = false
				selectedIndex = -1
				break
		}
	}

	function selectSuggestion(suggestion: string) {
		searchInput = suggestion
		onSearch(suggestion)
		showSuggestions = false
		selectedIndex = -1
	}

	function clearSearch() {
		searchInput = ''
		onSearch('')
		showSuggestions = false
		suggestions = []
	}

	// Close suggestions when clicking outside
	function handleClickOutside() {
		showSuggestions = false
		selectedIndex = -1
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative">
	<div class="relative">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<input
			type="search"
			{placeholder}
			bind:value={searchInput}
			oninput={handleInput}
			onkeydown={handleKeydown}
			class={cn(
				"w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm",
				"focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
				className
			)}
		/>
		{#if searchInput}
			<button
				onclick={clearSearch}
				class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
			>
				<X class="h-3 w-3 text-muted-foreground" />
			</button>
		{/if}
	</div>

	{#if showSuggestions && suggestions.length > 0}
		<div class="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-lg shadow-lg max-h-64 overflow-y-auto">
			{#each suggestions as suggestion, index}
				<button
					onclick={() => selectSuggestion(suggestion)}
					class={cn(
						"w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
						"flex items-center gap-2",
						selectedIndex === index && "bg-muted"
					)}
				>
					<Search class="h-3 w-3 text-muted-foreground flex-shrink-0" />
					<span class="truncate">{suggestion}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>