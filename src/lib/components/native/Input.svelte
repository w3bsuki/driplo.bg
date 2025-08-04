<script lang="ts">
	import { cn } from '$lib/utils';
	
	interface Props {
		type?: string;
		value?: string | number;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		size?: 'sm' | 'md' | 'lg';
		// All the native input events (like HeroSearch)
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onclick?: (e: MouseEvent) => void;
		id?: string;
		name?: string;
		autocomplete?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
	}
	
	let {
		type = 'text',
		value = $bindable(),
		placeholder,
		disabled = false,
		required = false,
		class: className = '',
		size = 'md',
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown,
		onclick,
		id,
		name,
		autocomplete,
		...restProps
	}: Props = $props();
	
	// Clean size classes (like HeroSearch input)
	const sizeClasses = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-9 px-3 text-sm',
		lg: 'h-10 px-4 text-base md:text-sm'
	};
</script>

<input
	{type}
	{value}
	{placeholder}
	{disabled}
	{required}
	{id}
	{name}
	{autocomplete}
	{oninput}
	{onchange}
	{onfocus}
	{onblur}
	{onkeydown}
	{onclick}
	class={cn(
		// Base styles (like HeroSearch input)
		'w-full border border-gray-300 rounded-sm bg-white transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed placeholder:text-gray-400',
		sizeClasses[size],
		className
	)}
	{...restProps}
/>