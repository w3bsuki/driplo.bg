<script lang="ts">
	import { cn } from '$lib/utils';
	import { X } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		class?: string;
		variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
		title?: string;
		description?: string;
		duration?: number;
		onClose?: () => void;
	}

	let {
		class: className,
		variant = 'default',
		title,
		description,
		duration = 5000,
		onClose
	}: Props = $props();

	const variantClasses = {
		default: 'bg-white border-gray-200',
		success: 'bg-green-50 border-green-200',
		error: 'bg-red-50 border-red-200',
		warning: 'bg-yellow-50 border-yellow-200',
		info: 'bg-blue-50 border-blue-200'
	};

	const iconColors = {
		default: 'text-gray-600',
		success: 'text-green-600',
		error: 'text-red-600',
		warning: 'text-yellow-600',
		info: 'text-blue-600'
	};

	if (duration > 0 && onClose) {
		setTimeout(onClose, duration);
	}
</script>

<div
	transition:fly={{ y: 20, duration: 200 }}
	class={cn(
		'pointer-events-auto w-full max-w-sm overflow-hidden rounded-md border shadow-md',
		variantClasses[variant],
		className
	)}
>
	<div class="flex items-start p-4">
		<div class="flex-1">
			{#if title}
				<p class={cn('text-sm font-medium', iconColors[variant])}>
					{title}
				</p>
			{/if}
			{#if description}
				<p class="mt-1 text-sm text-gray-600">
					{description}
				</p>
			{/if}
		</div>
		{#if onClose}
			<button
				onclick={onClose}
				class={cn(
					'ml-4 inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
					iconColors[variant]
				)}
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>
</div>