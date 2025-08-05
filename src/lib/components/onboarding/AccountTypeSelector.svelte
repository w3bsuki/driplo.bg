<script lang="ts">
	import { User, Building2, Check } from 'lucide-svelte';

	interface Props {
		accountType: 'personal' | 'brand';
	}

	let { accountType = $bindable('personal') }: Props = $props();

	const accountTypes = [
		{
			value: 'personal' as const,
			title: 'Personal',
			description: 'For individual sellers',
			icon: User
		},
		{
			value: 'brand' as const,
			title: 'Brand',
			description: 'For businesses',
			icon: Building2
		}
	];
</script>

<div class="grid grid-cols-2 gap-3">
	{#each accountTypes as type}
		<button
			onclick={() => accountType = type.value}
			class="relative p-4 text-left border rounded-lg transition-colors
				{accountType === type.value 
					? 'border-blue-500 bg-blue-50' 
					: 'border-gray-300 hover:border-gray-400 bg-white'}"
		>
			{#if accountType === type.value}
				<div class="absolute top-2 right-2">
					<Check class="w-4 h-4 text-blue-600" />
				</div>
			{/if}
			
			<svelte:component 
				this={type.icon} 
				class="w-5 h-5 mb-2 {accountType === type.value ? 'text-blue-600' : 'text-gray-500'}"
			/>
			<h3 class="text-sm font-medium text-gray-900">{type.title}</h3>
			<p class="text-xs text-gray-600 mt-1">{type.description}</p>
		</button>
	{/each}
</div>