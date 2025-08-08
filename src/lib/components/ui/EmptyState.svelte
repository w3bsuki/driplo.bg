<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Package, Search, Heart, MessageCircle, ShoppingCart } from 'lucide-svelte';

	interface Props {
		/**
		 * The main title for the empty state
		 */
		title: string;
		
		/**
		 * Description text
		 */
		description?: string;
		
		/**
		 * Icon to display
		 */
		icon?: 'package' | 'search' | 'heart' | 'message' | 'cart' | 'custom';
		
		/**
		 * Custom icon component (when icon is 'custom')
		 */
		customIcon?: any;
		
		/**
		 * Size variant
		 */
		size?: 'sm' | 'md' | 'lg';
		
		/**
		 * Primary action button text
		 */
		actionText?: string;
		
		/**
		 * Secondary action button text
		 */
		secondaryActionText?: string;
		
		/**
		 * Additional CSS classes
		 */
		class?: string;
		
		/**
		 * Callback for primary action
		 */
		onAction?: () => void;
		
		/**
		 * Callback for secondary action
		 */
		onSecondaryAction?: () => void;
	}

	let {
		title,
		description,
		icon = 'package',
		customIcon,
		size = 'md',
		actionText,
		secondaryActionText,
		class: className,
		onAction,
		onSecondaryAction
	}: Props = $props();

	const icons = {
		package: Package,
		search: Search,
		heart: Heart,
		message: MessageCircle,
		cart: ShoppingCart,
		custom: customIcon
	};

	const IconComponent = icons[icon];

	const sizeClasses = {
		sm: {
			container: 'p-4',
			icon: 'h-8 w-8',
			title: 'text-lg',
			description: 'text-sm',
			spacing: 'space-y-2'
		},
		md: {
			container: 'p-8',
			icon: 'h-12 w-12',
			title: 'text-xl',
			description: 'text-sm',
			spacing: 'space-y-4'
		},
		lg: {
			container: 'p-12',
			icon: 'h-16 w-16',
			title: 'text-2xl',
			description: 'text-base',
			spacing: 'space-y-6'
		}
	};

	function handleAction() {
		if (onAction) {
			onAction();
		}
	}

	function handleSecondaryAction() {
		if (onSecondaryAction) {
			onSecondaryAction();
		}
	}
</script>

<div 
	class={cn(
		'text-center',
		sizeClasses[size].container,
		sizeClasses[size].spacing,
		className
	)}
>
	{#if IconComponent}
		<div class="flex justify-center mb-4">
			<svelte:component 
				this={IconComponent} 
				class={cn(sizeClasses[size].icon, 'text-gray-400')} 
			/>
		</div>
	{/if}

	<h3 class={cn(sizeClasses[size].title, 'font-semibold text-gray-900')}>
		{title}
	</h3>

	{#if description}
		<p class={cn(sizeClasses[size].description, 'text-gray-600 max-w-sm mx-auto')}>
			{description}
		</p>
	{/if}

	{#if actionText || secondaryActionText}
		<div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
			{#if actionText}
				<button
					type="button"
					onclick={handleAction}
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
				>
					{actionText}
				</button>
			{/if}

			{#if secondaryActionText}
				<button
					type="button"
					onclick={handleSecondaryAction}
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
				>
					{secondaryActionText}
				</button>
			{/if}
		</div>
	{/if}
</div>