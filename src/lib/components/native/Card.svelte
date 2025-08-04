<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		class?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		shadow?: 'none' | 'sm' | 'md';
		children?: any;
	}
	
	let {
		class: className = '',
		padding = 'md',
		shadow = 'sm',
		children,
		...restProps
	}: Props = $props();
	
	// Simple padding classes
	const paddingClasses = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};
	
	// Simple shadow classes (minimal like HeroSearch)
	const shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		md: 'shadow-md'
	};
</script>

<div
	class={cn(
		// Base card styles (clean like HeroSearch container)
		'bg-white border border-gray-200 rounded-sm',
		paddingClasses[padding],
		shadowClasses[shadow],
		className
	)}
	{...restProps}
>
	<slot></slot>
</div>