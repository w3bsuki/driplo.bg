<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check, CheckCircle2 } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		value: string;
		selectedValue: string;
		title: string;
		description?: string;
		features?: string[];
		badge?: string;
		icon?: Snippet;
		children?: Snippet;
		disabled?: boolean;
		variant?: 'default' | 'primary' | 'success' | 'warning';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		onclick?: () => void;
	}

	let {
		value,
		selectedValue,
		title,
		description,
		features = [],
		badge,
		icon,
		children,
		disabled = false,
		variant = 'default',
		size = 'md',
		class: className,
		onclick
	}: Props = $props();

	const isSelected = $derived(selectedValue === value);

	// Variant color mappings
	const variantColors = {
		default: {
			selected: 'border-primary bg-primary/5 shadow-md shadow-primary/20',
			unselected: 'border-border hover:border-border/80 hover:shadow-sm',
			icon: 'bg-primary/10 text-primary',
			check: 'text-primary'
		},
		primary: {
			selected: 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20',
			unselected: 'border-border hover:border-blue-200 hover:shadow-sm',
			icon: 'bg-blue-100 text-blue-600',
			check: 'text-blue-600'
		},
		success: {
			selected: 'border-green-500 bg-green-50 shadow-md shadow-green-500/20',
			unselected: 'border-border hover:border-green-200 hover:shadow-sm',
			icon: 'bg-green-100 text-green-600',
			check: 'text-green-600'
		},
		warning: {
			selected: 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/20',
			unselected: 'border-border hover:border-amber-200 hover:shadow-sm',
			icon: 'bg-amber-100 text-amber-600',
			check: 'text-amber-600'
		}
	};

	// Size mappings
	const sizeClasses = {
		sm: {
			container: 'p-4',
			icon: 'w-8 h-8 p-1.5',
			iconContent: 'w-4 h-4',
			title: 'text-base',
			description: 'text-sm',
			features: 'text-xs',
			badge: 'px-2 py-0.5 text-xs'
		},
		md: {
			container: 'p-6',
			icon: 'w-10 h-10 p-2',
			iconContent: 'w-5 h-5',
			title: 'text-lg',
			description: 'text-sm',
			features: 'text-sm',
			badge: 'px-3 py-1 text-xs'
		},
		lg: {
			container: 'p-8',
			icon: 'w-12 h-12 p-2.5',
			iconContent: 'w-6 h-6',
			title: 'text-xl',
			description: 'text-base',
			features: 'text-sm',
			badge: 'px-3 py-1 text-sm'
		}
	};

	const currentVariant = $derived(variantColors[variant]);
	const currentSize = $derived(sizeClasses[size]);

	function handleClick() {
		if (!disabled && onclick) {
			onclick();
		}
	}
</script>

<button
	type="button"
	{disabled}
	onclick={handleClick}
	class={cn(
		'relative w-full text-left rounded-lg border-2 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
		currentSize.container,
		isSelected ? currentVariant.selected : currentVariant.unselected,
		disabled && 'opacity-50 cursor-not-allowed',
		!disabled && 'hover:scale-[1.02] active:scale-[0.98]',
		className
	)}
	transition:scale={{ duration: 200 }}
>
	<!-- Badge -->
	{#if badge}
		<div class={cn(
			'absolute top-3 right-3 rounded-full font-medium',
			currentSize.badge,
			isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
		)}>
			{badge}
		</div>
	{/if}

	<!-- Selection indicator -->
	{#if isSelected}
		<div class="absolute top-3 left-3 transition-all duration-200">
			<div class={cn(
				'w-6 h-6 rounded-full flex items-center justify-center',
				currentVariant.icon
			)}>
				<CheckCircle2 class="w-4 h-4" />
			</div>
		</div>
	{/if}

	<!-- Content -->
	<div class={cn('flex items-start gap-4', isSelected && 'ml-10')}>
		<!-- Icon -->
		{#if icon}
			<div class={cn(
				'flex-shrink-0 rounded-lg transition-all duration-200',
				currentSize.icon,
				isSelected ? currentVariant.icon : 'bg-muted text-muted-foreground',
				!disabled && 'group-hover:scale-110'
			)}>
				{@render icon()}
			</div>
		{/if}
		
		<!-- Text Content -->
		<div class="flex-1 min-w-0">
			<h3 class={cn(
				'font-semibold text-card-foreground leading-tight',
				currentSize.title
			)}>
				{title}
			</h3>
			
			{#if description}
				<p class={cn(
					'text-muted-foreground mt-1',
					currentSize.description
				)}>
					{description}
				</p>
			{/if}

			<!-- Features List -->
			{#if features.length > 0}
				<ul class="mt-3 space-y-1">
					{#each features as feature}
						<li class={cn(
							'flex items-center gap-2',
							currentSize.features
						)}>
							<Check class={cn(
								'w-3 h-3 flex-shrink-0',
								isSelected ? currentVariant.check : 'text-muted-foreground'
							)} />
							<span class={cn(
								isSelected ? 'text-card-foreground' : 'text-muted-foreground'
							)}>
								{feature}
							</span>
						</li>
					{/each}
				</ul>
			{/if}

			<!-- Custom content -->
			{#if children}
				<div class="mt-4">
					{@render children()}
				</div>
			{/if}
		</div>
	</div>
</button>