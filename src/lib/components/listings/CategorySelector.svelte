<script lang="ts">
	import { ChevronDown, Search } from 'lucide-svelte'
	import { cn } from '$lib/utils'
	import Input from '$lib/components/ui/input.svelte'
	import type { Database } from '$lib/types/database.types'
	
	type Category = Database['public']['Tables']['categories']['Row']
	
	interface Props {
		value?: string
		categories: Category[]
		placeholder?: string
		onchange?: (value: string) => void
		class?: string
	}
	
	let { 
		value = $bindable(),
		categories = [],
		placeholder = 'Select category',
		onchange,
		class: className = ''
	}: Props = $props()
	
	let showDropdown = $state(false)
	let search = $state('')
	
	const selectedCategory = $derived(
		categories.find(c => c.id === value)
	)
	
	const filteredCategories = $derived(
		search 
			? categories.filter(c => 
				c.name.toLowerCase().includes(search.toLowerCase())
			)
			: categories
	)
	
	function selectCategory(categoryId: string) {
		value = categoryId
		showDropdown = false
		search = ''
		onchange?.(categoryId)
	}
</script>

<div class={cn("relative", className)}>
	<button
		type="button"
		onclick={() => showDropdown = !showDropdown}
		class={cn(
			"w-full flex items-center justify-between",
			"px-3 py-2 text-sm rounded-md border border-gray-300",
			"bg-white hover:bg-gray-50",
			"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
			"disabled:cursor-not-allowed disabled:opacity-50",
			!selectedCategory && "text-gray-500"
		)}
	>
		<span>{selectedCategory?.name || placeholder}</span>
		<ChevronDown class="w-4 h-4 opacity-50" />
	</button>
	
	{#if showDropdown}
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 z-40"
			onclick={() => showDropdown = false}
			aria-label="Close dropdown"
		/>
		
		<!-- Dropdown -->
		<div class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
			<div class="p-2 border-b border-gray-200">
				<div class="relative">
					<Search class="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
					<Input
						bind:value={search}
						placeholder="Search..."
						class="pl-8 h-9"
						onclick={(e) => e.stopPropagation()}
					/>
				</div>
			</div>
			
			<div class="max-h-60 overflow-auto p-1">
				{#each filteredCategories as category}
					<button
						type="button"
						onclick={() => selectCategory(category.id)}
						class={cn(
							"w-full px-2 py-1.5 text-sm text-left rounded-sm",
							"hover:bg-gray-100",
							"focus:bg-gray-100",
							value === category.id && "bg-blue-50 text-blue-600"
						)}
					>
						{category.name}
					</button>
				{/each}
				
				{#if filteredCategories.length === 0}
					<p class="px-2 py-1.5 text-sm text-gray-500">
						No categories found
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>