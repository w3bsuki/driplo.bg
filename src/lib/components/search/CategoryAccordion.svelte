<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		name: string;
		slug: string;
		subcategories: Array<{ name: string; slug: string; }>;
		isExpanded: boolean;
		onToggle: () => void;
		onCategorySelect: (category: string, subcategory?: string) => void;
	}
	
	let { 
		name, 
		slug, 
		subcategories, 
		isExpanded, 
		onToggle, 
		onCategorySelect 
	}: Props = $props();
</script>

<div class="border-b border-gray-100 last:border-0">
	<div class="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors rounded-lg">
		<button
			onclick={(e) => { e.stopPropagation(); onToggle(); }}
			class="flex-1 flex items-center justify-between text-left"
		>
			<span class="font-medium text-gray-900">{name}</span>
			<ChevronDown class={cn(
				"h-4 w-4 text-gray-400 transition-transform duration-200 ml-2",
				isExpanded && "rotate-180"
			)} />
		</button>
		<button
			onclick={(e) => { e.stopPropagation(); onCategorySelect(slug); }}
			class="text-xs px-2 py-1 rounded ml-2 transition-colors"
			style="color: oklch(45% 0.31 264); --hover-color: oklch(35% 0.31 264); --hover-bg: oklch(96% 0.05 264);"
			onmouseenter={(e) => { e.currentTarget.style.color = 'var(--hover-color)'; e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
			onmouseleave={(e) => { e.currentTarget.style.color = 'oklch(45% 0.31 264)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
		>
			{m.category_view_all()}
		</button>
	</div>
	
	{#if isExpanded}
		<div class="grid grid-cols-2 md:grid-cols-3 gap-1 px-3 pb-2" transition:slide={{ duration: 150 }}>
			{#each subcategories as sub}
				<button
					onclick={(e) => { e.stopPropagation(); onCategorySelect(slug, sub.slug); }}
					class="text-left px-2 py-1.5 text-sm text-gray-600 rounded transition-colors"
					style="--hover-color: oklch(45% 0.31 264); --hover-bg: oklch(96% 0.05 264);"
					onmouseenter={(e) => { e.currentTarget.style.color = 'var(--hover-color)'; e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
					onmouseleave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.backgroundColor = ''; }}
				>
					{sub.name}
				</button>
			{/each}
		</div>
	{/if}
</div>