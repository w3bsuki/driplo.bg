<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	const buttonVariants = cva(
		'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87CEEB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		{
			variants: {
				variant: {
					default: 'bg-[#87CEEB] text-white shadow-sm hover:bg-[#6BB6D8] active:bg-[#4F9FC5]',
					destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700',
					outline: 'border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100',
					secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
					ghost: 'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
					link: 'text-[#87CEEB] underline-offset-4 hover:underline p-0 h-auto'
				},
				size: {
					xs: 'button-size-xs rounded-[var(--radius-sm)]',
					sm: 'button-size-sm rounded-[var(--radius-md)]',
					default: 'button-size-md rounded-[var(--radius-md)]',
					lg: 'button-size-lg rounded-[var(--radius-md)]',
					xl: 'button-size-xl rounded-[var(--radius-lg)]',
					icon: 'w-8 h-8 p-0 rounded-[var(--radius-md)]'
				}
			},
			defaultVariants: {
				variant: 'default',
				size: 'default'
			}
		}
	);

	type ButtonVariantProps = VariantProps<typeof buttonVariants>;
	type ButtonElement = HTMLButtonElement;

	interface ButtonProps extends ButtonVariantProps, HTMLButtonAttributes {
		class?: string;
		children: Snippet;
	}

	let {
		class: className = '',
		variant = 'default',
		size = 'default',
		type = 'button',
		disabled = false,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<button 
	{type} 
	{disabled} 
	class={cn(buttonVariants({ variant, size, className }))}
	{...restProps}
	on:click
	on:focus
	on:blur
	on:mouseenter
	on:mouseleave
	on:keydown
	on:keyup
>
	{@render children()}
</button>

