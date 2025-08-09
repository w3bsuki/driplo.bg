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
		onCloseDropdown?: () => void;
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
		onSearch,
		onCloseDropdown
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
		{#if showCategories && onCloseDropdown}
			<button
				onclick={onCloseDropdown}
				class="p-1 hover:bg-gray-50 rounded-lg transition-colors mr-2"
				aria-label="Close search dropdown"
			>
				<X class="h-4 w-4 text-gray-600" />
			</button>
		{:else}
			<div class="mr-3 flex-shrink-0">
				<Search class="h-4 w-4 text-gray-400" />
			</div>
		{/if}
		
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
				"p-2 rounded-lg transition-all",
				"bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800",
				"disabled:opacity-40 disabled:cursor-not-allowed",
				"focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
			)}
			aria-label="Search"
		>
			<Search class="h-4 w-4" />
		</button>
	</div>
</div>