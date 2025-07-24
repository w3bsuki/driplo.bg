<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	const buttonVariants = cva(
		'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-fast active-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		{
			variants: {
				variant: {
					default: 'bg-primary text-white border border-transparent hover:bg-primary/90 active:bg-primary/80',
					destructive: 'bg-destructive text-destructive-foreground border border-transparent hover:bg-destructive/90 active:bg-destructive/80',
					outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
					secondary: 'bg-secondary text-secondary-foreground border border-transparent hover:bg-secondary/80',
					ghost: 'hover:bg-accent hover:text-accent-foreground',
					link: 'text-primary underline-offset-4 hover:underline p-0 h-auto'
				},
				size: {
					xs: 'h-button-xs px-2 text-xs rounded-xs',
					sm: 'h-button-sm px-2.5 text-sm rounded-sm',
					default: 'h-button-md px-3 text-sm rounded-sm',
					lg: 'h-button-lg px-4 text-base rounded-sm',
					xl: 'h-button-xl px-5 text-lg rounded-sm',
					icon: 'w-8 h-8 p-0 rounded-sm'
				}
			},
			defaultVariants: {
				variant: 'default',
				size: 'default'
			}
		}
	);

	type ButtonVariantProps = VariantProps<typeof buttonVariants>;

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
>
	{@render children()}
</button>

