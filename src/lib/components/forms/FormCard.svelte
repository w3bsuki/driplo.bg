<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		title?: string;
		subtitle?: string;
		children: Snippet;
		icon?: Snippet;
		class?: string;
		headerClass?: string;
		contentClass?: string;
		animate?: boolean;
		loading?: boolean;
	}

	let {
		title,
		subtitle,
		children,
		icon,
		class: className,
		headerClass,
		contentClass,
		animate = true,
		loading = false
	}: Props = $props();
</script>

<div 
	class={cn(
		'relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200',
		'hover:shadow-md hover:border-border/60',
		className
	)}
	transition:fly={animate ? { y: 20, duration: 300, delay: 100 } : undefined}
>
	<!-- Loading Overlay -->
	{#if loading}
		<div 
			class="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"
			transition:fade={{ duration: 200 }}
		>
			<div class="flex items-center gap-3">
				<div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm font-medium text-muted-foreground">Saving...</span>
			</div>
		</div>
	{/if}

	<!-- Header -->
	{#if title || subtitle || icon}
		<div class={cn('px-6 py-4 border-b border-border/60', headerClass)}>
			<div class="flex items-start gap-4">
				<!-- Icon -->
				{#if icon}
					<div class="flex-shrink-0 p-2 rounded-lg bg-primary/10">
						{@render icon()}
					</div>
				{/if}
				
				<!-- Text -->
				<div class="flex-1 min-w-0">
					{#if title}
						<h3 class="text-lg font-semibold text-card-foreground leading-tight">
							{title}
						</h3>
					{/if}
					{#if subtitle}
						<p class="text-sm text-muted-foreground mt-1">
							{subtitle}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Content -->
	<div class={cn('px-6 py-6', contentClass)}>
		{@render children()}
	</div>
</div>