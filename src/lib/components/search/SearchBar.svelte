<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	
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
	"relative bg-white transition-all duration-200",
	showCategories ? "rounded-t-xl border border-gray-200 border-b-0 shadow-md" : "rounded-xl border border-gray-200 shadow-sm hover:shadow-md"
)}>
	<div class="flex items-center px-4 md:px-5 h-12 md:h-14">
		<Search class="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
		
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
			class="flex-1 h-full border-0 focus:ring-0 focus:outline-none text-sm md:text-base placeholder:text-gray-400"
			autocomplete="off"
			aria-label="Search products"
			aria-expanded={showCategories}
			aria-haspopup="listbox"
		/>
		
		{#if value}
			<button
				onclick={onClear}
				class="p-1.5 hover:bg-gray-50 rounded-lg transition-colors mr-2"
				aria-label="Clear search"
			>
				<X class="h-3.5 w-3.5 text-gray-400" />
			</button>
		{/if}
		
		<button
			onclick={onSearch}
			disabled={isSearching || (!value.trim())}
			class={cn(
				"px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all",
				"bg-gray-900 text-white hover:bg-gray-800",
				"disabled:opacity-40 disabled:cursor-not-allowed",
				"focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
			)}
			aria-label="Search"
		>
			{isSearching ? '...' : m.quick_filter_search_button()}
		</button>
	</div>
</div>