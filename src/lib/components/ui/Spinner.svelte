<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let color: 'primary' | 'white' | 'current' = 'primary';
	export let className = '';
	export let text = '';
	export let fullScreen = false;
	export let overlay = false;

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
		xl: 'w-12 h-12'
	};

	const colorClasses = {
		primary: 'text-blue-600',
		white: 'text-white',
		current: 'text-current'
	};
</script>

{#if fullScreen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
		<div class="flex flex-col items-center gap-3">
			<Loader2 
				class={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} 
			/>
			{#if text}
				<p class="text-sm font-medium text-gray-600">{text}</p>
			{/if}
		</div>
	</div>
{:else if overlay}
	<div class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
		<div class="flex flex-col items-center gap-3">
			<Loader2 
				class={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} 
			/>
			{#if text}
				<p class="text-sm font-medium text-gray-600">{text}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex items-center gap-2">
		<Loader2 
			class={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} 
		/>
		{#if text}
			<span class="text-sm font-medium">{text}</span>
		{/if}
	</div>
{/if}
</script>