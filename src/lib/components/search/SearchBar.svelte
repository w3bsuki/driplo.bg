<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	interface Props {
		value: string;
		placeholder?: string;
		isFocused: boolean;
		isSearching: boolean;
		showCategories: boolean;
		onFocus: () => void;
		onClick: (e: MouseEvent) => void;
		onBlur: (e: FocusEvent) => void;
		onKeydown: (e: KeyboardEvent) => void;
		onInput: () => void;
		onClear: () => void;
		onSearch: () => void;
	}
	
	let {
		value = $bindable(),
		placeholder = "Search for brands, items, or @sellers...",
		isFocused,
		isSearching,
		showCategories,
		onFocus,
		onClick,
		onBlur,
		onKeydown,
		onInput,
		onClear,
		onSearch
	}: Props = $props();
	
	let searchInputRef: HTMLInputElement;
	
	export function focus() {
		searchInputRef?.focus();
	}
</script>

<div class={cn(
	"relative bg-white shadow-lg transition-all duration-200",
	showCategories ? "rounded-t-2xl border-t-2 border-x-2 border-b-0" : "rounded-2xl border-2",
	isFocused ? "border-gray-900 shadow-xl" : "border-gray-200"
)}>
	<div class="flex items-center px-4 md:px-6 h-14 md:h-16">
		<Search class="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
		
		<input
			bind:this={searchInputRef}
			type="search"
			{placeholder}
			bind:value
			onfocus={onFocus}
			onclick={onClick}
			onblur={onBlur}
			onkeydown={onKeydown}
			oninput={onInput}
			class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-base md:text-lg placeholder:text-gray-400"
			autocomplete="off"
			aria-label="Search products"
			aria-expanded={showCategories}
			aria-haspopup="listbox"
		/>
		
		{#if value}
			<button
				onclick={onClear}
				class="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
				aria-label="Clear search"
			>
				<X class="h-4 w-4 text-gray-400" />
			</button>
		{/if}
		
		<button
			onclick={onSearch}
			disabled={isSearching || (!value.trim())}
			class={cn(
				"px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold transition-all duration-200",
				"text-white",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				"focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
			)}
			style="background-color: oklch(27% 0.12 256); --hover-bg: oklch(23% 0.12 256);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'oklch(27% 0.12 256)'}
			aria-label="Search"
		>
			{isSearching ? 'Searching...' : 'Search'}
		</button>
	</div>
</div>