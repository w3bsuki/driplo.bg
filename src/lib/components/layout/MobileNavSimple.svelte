<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	
	let showCategories = $state(false);
	
	const navItems = [
		{ href: '/', emoji: '🏠', label: 'Home' },
		{ href: '/browse', emoji: '🔍', label: 'Browse' },
		{ action: 'categories', emoji: '📂', label: 'Categories', special: true },
		{ href: '/sell', emoji: '➕', label: 'Sell', accent: true },
		{ href: '/profile', emoji: '👤', label: 'Profile' }
	];

	function handleClick(item: any) {
		if (item.action === 'categories') {
			showCategories = !showCategories;
		} else if (item.href) {
			goto(item.href);
		}
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden shadow-lg" style="padding-bottom: env(safe-area-inset-bottom, 0)">
	<div class="grid grid-cols-5 h-14 px-2">
		{#each navItems as item}
			{@const isActive = item.href && $page.url.pathname === item.href}
			{#if item.accent}
				<!-- Floating action button for Sell -->
				<button 
					onclick={() => handleClick(item)}
					class="relative flex items-center justify-center"
				>
					<div class="absolute -top-5 h-10 w-10 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D8] rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 border-2 border-white">
						<span class="text-lg text-white">{item.emoji}</span>
					</div>
				</button>
			{:else}
				<button 
					onclick={() => handleClick(item)}
					class={cn(
						"flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 py-1",
						isActive ? "text-[#4F9FC5]" : "text-gray-500",
						item.special && showCategories ? "text-[#4F9FC5]" : ""
					)}
				>
					<span class="text-lg opacity-80 hover:opacity-100 transition-opacity">{item.emoji}</span>
					{#if !item.accent}
						<span class="text-[9px] font-medium leading-none">{item.label}</span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>
</nav>

{#if showCategories}
	<div class="fixed inset-0 z-50 md:hidden">
		<div class="fixed inset-0 bg-black bg-opacity-50" onclick={() => showCategories = false}></div>
		<div class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-4 border-t border-gray-100" style="padding-bottom: env(safe-area-inset-bottom, 0)">
			<div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
			<h3 class="text-base font-semibold mb-4 flex items-center gap-2">
				<span>📂</span>
				Categories
			</h3>
			<div class="grid grid-cols-2 gap-3 mb-4">
				{#each [['All', '🌟'], ['Women', '👗'], ['Men', '👔'], ['Kids', '🧸'], ['Designer', '💎'], ['Shoes', '👟']] as [cat, emoji]}
					<button
						onclick={() => {
							showCategories = false;
							goto(`/browse?category=${cat.toLowerCase()}`);
						}}
						class="flex items-center gap-3 h-12 px-4 bg-gradient-to-r from-gray-50 to-white rounded-xl text-sm font-medium hover:from-[#87CEEB]/10 hover:to-[#87CEEB]/5 transition-all active:scale-95 border border-gray-100 hover:border-[#87CEEB]/20"
					>
						<span class="text-lg">{emoji}</span>
						<span>{cat}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}