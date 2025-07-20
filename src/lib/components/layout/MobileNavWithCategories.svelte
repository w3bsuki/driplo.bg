<script lang="ts">
	import { Home, Search, Plus, User, Grid3X3 } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	
	let showCategoryModal = $state(false);
	
	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/browse', icon: Search, label: 'Browse' },
		{ action: 'categories', icon: Grid3X3, label: 'Categories', special: true },
		{ href: '/sell', icon: Plus, label: 'Sell', accent: true },
		{ href: '/profile', icon: User, label: 'Profile' }
	];

	function handleNavAction(item: any) {
		console.log('Nav action:', item);
		if (item.action === 'categories') {
			showCategoryModal = true;
			console.log('Categories modal should be open:', showCategoryModal);
		} else if (item.href) {
			goto(item.href);
		}
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg md:hidden">
	<!-- Safe area padding for iOS devices -->
	<div class="pb-safe">
		<div class="flex items-center justify-around px-2 pt-2 pb-1">
			{#each navItems as item}
				{@const isActive = item.href && $page.url.pathname === item.href}
				{#if item.accent}
					<!-- Prominent Sell Button -->
					<a 
						href={item.href}
						class="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl px-4 py-2 shadow-md transform transition-all duration-200 active:scale-95 hover:shadow-lg"
						aria-label={item.label}
					>
						<div class="bg-white/20 rounded-lg p-2 mb-1">
							<svelte:component this={item.icon} class="h-5 w-5" />
						</div>
						<span class="text-xs font-medium">{item.label}</span>
					</a>
				{:else}
					<!-- Regular Navigation Items -->
					<button 
						onclick={() => handleNavAction(item)}
						class={cn(
							"flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 rounded-lg mx-1",
							isActive 
								? "text-primary" 
								: "text-muted-foreground hover:text-foreground",
							item.special && "text-blue-500"
						)}
						aria-label={item.label}
					>
						<div class={cn(
							"p-1 rounded-lg transition-all duration-200",
							isActive && "bg-primary/10",
							item.special && "bg-blue-500/10"
						)}>
							<svelte:component 
								this={item.icon} 
								class={cn(
									"h-5 w-5 transition-transform duration-200",
									isActive && "scale-110"
								)} 
							/>
						</div>
						<span class={cn(
							"text-xs mt-1 transition-all duration-200",
							isActive ? "font-medium" : "font-normal"
						)}>{item.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	</div>
</nav>

<!-- Categories Modal -->
{#if showCategoryModal}
	<div 
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
		onclick={() => showCategoryModal = false}
		role="button"
		tabindex="-1"
		aria-label="Close categories modal"
	>
		<div 
			class="fixed inset-x-0 bottom-0 bg-background rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<div class="flex flex-col h-full max-h-[80vh]">
				<!-- Header -->
				<div class="flex items-center justify-between p-4 border-b bg-background rounded-t-2xl">
					<h2 class="text-lg font-semibold">Categories</h2>
					<button 
						onclick={() => showCategoryModal = false}
						class="p-2 hover:bg-muted rounded-lg"
						aria-label="Close categories"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				
				<!-- Categories Content -->
				<div class="flex-1 overflow-y-auto p-4">
					<div class="space-y-6">
						<!-- Main Categories -->
						<div>
							<h3 class="text-sm font-semibold text-muted-foreground mb-3">
								Main Categories
							</h3>
							<div class="grid grid-cols-2 gap-2">
								{#each ['All', 'Women', 'Men', 'Kids', 'Designer', 'Shoes', 'Bags'] as cat}
									<button
										onclick={() => {
											const params = new URLSearchParams();
											if (cat !== 'All') params.set('category', cat.toLowerCase());
											showCategoryModal = false;
											goto(`/browse${params.toString() ? '?' + params.toString() : ''}`);
										}}
										class="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
									>
										<span class="font-medium">{cat}</span>
									</button>
								{/each}
							</div>
						</div>
						
						<!-- Popular Items -->
						<div>
							<h3 class="text-sm font-semibold text-muted-foreground mb-3">
								Popular Items
							</h3>
							<div class="grid grid-cols-2 gap-2">
								{#each [
									{ name: 'T-shirts', emoji: '👕', value: 'tshirts' },
									{ name: 'Jeans', emoji: '👖', value: 'jeans' },
									{ name: 'Dresses', emoji: '👗', value: 'dresses' },
									{ name: 'Trainers', emoji: '👟', value: 'trainers' },
									{ name: 'Jackets', emoji: '🧥', value: 'jackets' },
									{ name: 'Handbags', emoji: '👜', value: 'handbags' }
								] as item}
									<button
										onclick={() => {
											const params = new URLSearchParams();
											params.set('category', item.value);
											showCategoryModal = false;
											goto(`/browse?${params.toString()}`);
										}}
										class="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
									>
										<div class="flex items-center gap-2">
											<span class="text-lg">{item.emoji}</span>
											<span class="font-medium">{item.name}</span>
										</div>
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Safe area padding for devices with home indicators */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>