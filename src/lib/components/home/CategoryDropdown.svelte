<script lang="ts">
	import { ChevronDown, Grid3X3 } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	let isOpen = $state(false);
	let selectedCategory = $state('');
	
	const categoryGroups = [
		{
			title: 'Main Categories',
			categories: [
				{ name: 'All', value: '', count: '5.2M' },
				{ name: 'Women', value: 'women', count: '2.3M' },
				{ name: 'Men', value: 'men', count: '1.8M' },
				{ name: 'Kids', value: 'kids', count: '982K' },
				{ name: 'Designer', value: 'designer', count: '156K' },
				{ name: 'Shoes', value: 'shoes', count: '743K' },
				{ name: 'Bags', value: 'bags', count: '421K' }
			]
		},
		{
			title: 'Popular Items',
			categories: [
				{ name: 'T-shirts', value: 'tshirts', emoji: '👕' },
				{ name: 'Jeans', value: 'jeans', emoji: '👖' },
				{ name: 'Dresses', value: 'dresses', emoji: '👗' },
				{ name: 'Trainers', value: 'trainers', emoji: '👟' },
				{ name: 'Jackets', value: 'jackets', emoji: '🧥' },
				{ name: 'Handbags', value: 'handbags', emoji: '👜' }
			]
		}
	];
	
	function selectCategory(category: string) {
		selectedCategory = category;
		isOpen = false;
		
		const params = new URLSearchParams();
		if (category) {
			params.set('category', category);
		}
		window.location.href = `/browse${params.toString() ? '?' + params.toString() : ''}`;
	}
	
	function toggleDropdown() {
		isOpen = !isOpen;
	}
	
	function closeDropdown() {
		isOpen = false;
	}
</script>

<div class="relative">
	<!-- Categories Button -->
	<button
		onclick={toggleDropdown}
		class={cn(
			"flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200",
			isOpen 
				? "border-primary bg-primary/5 text-primary" 
				: "border-input bg-background hover:bg-muted"
		)}
		aria-label="Select category"
		aria-expanded={isOpen}
	>
		<Grid3X3 class="h-4 w-4" />
		<span class="text-sm font-medium">Categories</span>
		<ChevronDown class={cn(
			"h-4 w-4 transition-transform duration-200",
			isOpen && "rotate-180"
		)} />
	</button>
	
	<!-- Dropdown Overlay -->
	{#if isOpen}
		<div 
			class="fixed inset-0 z-40 md:hidden" 
			onclick={closeDropdown}
			onkeydown={(e) => e.key === 'Escape' && closeDropdown()}
			role="button"
			tabindex="-1"
			aria-label="Close categories"
		></div>
	{/if}
	
	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute top-full left-0 mt-2 w-80 max-w-[90vw] bg-background border border-border rounded-xl shadow-xl z-50 max-h-[70vh] overflow-y-auto">
			<div class="p-4">
				{#each categoryGroups as group}
					<div class="mb-6 last:mb-0">
						<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
							{group.title}
						</h3>
						
						<div class="grid grid-cols-2 gap-1">
							{#each group.categories as category}
								<button
									onclick={() => selectCategory(category.value)}
									class={cn(
										"flex items-center justify-between p-3 rounded-lg transition-colors text-left",
										selectedCategory === category.value
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted"
									)}
								>
									<div class="flex items-center gap-2">
										{#if category.emoji}
											<span class="text-sm">{category.emoji}</span>
										{/if}
										<span class="text-sm font-medium">{category.name}</span>
									</div>
									{#if category.count}
										<span class="text-xs text-muted-foreground">
											{category.count}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Mobile Full-Screen Modal -->
{#if isOpen}
	<div class="md:hidden fixed inset-0 z-50 bg-background">
		<div class="flex flex-col h-full">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="text-lg font-semibold">Categories</h2>
				<button 
					onclick={closeDropdown}
					class="p-2 hover:bg-muted rounded-lg"
					aria-label="Close categories"
				>
					<ChevronDown class="h-5 w-5 rotate-180" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-4">
				{#each categoryGroups as group}
					<div class="mb-6 last:mb-0">
						<h3 class="text-sm font-semibold text-muted-foreground mb-3">
							{group.title}
						</h3>
						
						<div class="space-y-1">
							{#each group.categories as category}
								<button
									onclick={() => selectCategory(category.value)}
									class={cn(
										"flex items-center justify-between w-full p-4 rounded-lg transition-colors text-left",
										selectedCategory === category.value
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted"
									)}
								>
									<div class="flex items-center gap-3">
										{#if category.emoji}
											<span class="text-lg">{category.emoji}</span>
										{/if}
										<span class="font-medium">{category.name}</span>
									</div>
									{#if category.count}
										<span class="text-sm text-muted-foreground">
											{category.count}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}