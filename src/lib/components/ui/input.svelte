<script lang="ts">
	import { cn } from '$lib/utils'
	
	interface Props {
		class?: string
		type?: string
		value?: string | number
		placeholder?: string
		disabled?: boolean
		required?: boolean
		id?: string
		size?: 'sm' | 'md' | 'lg'
		onblur?: (e: FocusEvent) => void
		onchange?: (e: Event) => void
		onclick?: (e: MouseEvent) => void
		onfocus?: (e: FocusEvent) => void
		onkeydown?: (e: KeyboardEvent) => void
		onkeypress?: (e: KeyboardEvent) => void
		onkeyup?: (e: KeyboardEvent) => void
		onmouseover?: (e: MouseEvent) => void
		onmouseenter?: (e: MouseEvent) => void
		onmouseleave?: (e: MouseEvent) => void
		onpaste?: (e: ClipboardEvent) => void
		oninput?: (e: Event) => void
		[key: string]: any
	}
	
	let {
		class: className,
		type = 'text',
		value = $bindable(),
		placeholder,
		disabled = false,
		required = false,
		id,
		size = 'md',
		onblur,
		onchange,
		onclick,
		onfocus,
		onkeydown,
		onkeypress,
		onkeyup,
		onmouseover,
		onmouseenter,
		onmouseleave,
		onpaste,
		oninput,
		...restProps
	}: Props = $props()
	
	const sizeClasses = {
		sm: 'h-input-sm px-2 text-sm',
		md: 'h-input-md px-2.5 text-sm',
		lg: 'h-input-lg px-3 text-base'
	}
</script>

<input
	{id}
	{type}
	{placeholder}
	{disabled}
	{required}
	bind:value
	class={cn(
		'flex w-full rounded-sm border border-input bg-background text-sm ring-offset-background transition-all duration-fast file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		sizeClasses[size],
		className
	)}
	{onblur}
	{onchange}
	{onclick}
	{onfocus}
	{onkeydown}
	{onkeypress}
	{onkeyup}
	{onmouseover}
	{onmouseenter}
	{onmouseleave}
	{onpaste}
	{oninput}
	{...restProps}
/>