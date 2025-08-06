<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { cn } from '$lib/utils';
	
	interface Props {
		href: string;
		icon: ComponentType;
		label: string;
		active?: boolean;
		badge?: number;
		variant?: 'default' | 'primary';
		onClick?: () => void;
	}
	
	let { 
		href, 
		icon: Icon, 
		label, 
		active = false,
		badge = 0,
		variant = 'default',
		onClick
	}: Props = $props();
</script>

<a
	{href}
	onclick={onClick}
	class={cn(
		"relative flex flex-col items-center justify-center px-1.5 min-w-[44px] group",
		"transition-all duration-150 active:scale-95 tap-highlight-transparent",
		variant === 'primary' && "transform scale-110",
		label ? "py-1" : "py-1.5"
	)}
	aria-current={active ? 'page' : undefined}
>
	<div class={cn(
		"relative flex items-center justify-center transition-all duration-150",
		variant === 'primary' 
			? "w-9 h-9 rounded-full shadow-sm" 
			: "w-7 h-7",
		variant === 'primary' && "hover:shadow-md"
	)}
	style={variant === 'primary' ? "background-color: oklch(27% 0.12 256);" : ""}>
		<Icon 
			class={cn(
				"transition-all duration-150",
				variant === 'primary' 
					? "h-3.5 w-3.5 text-white" 
					: active 
						? "h-4.5 w-4.5 text-gray-900" 
						: "h-4.5 w-4.5 text-gray-500 group-hover:text-gray-700"
			)} 
			stroke-width={active ? 2.5 : 1.5}
		/>
		
		{#if badge > 0 && variant !== 'primary'}
			<span class="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
				{badge > 9 ? '9+' : badge}
			</span>
		{/if}
	</div>
	
	{#if label}
		<span class={cn(
			"text-[9px] mt-0.5 font-medium transition-colors duration-150",
			active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700",
			variant === 'primary' && "font-semibold text-[10px]"
		)}>
			{label}
		</span>
	{/if}
	
	{#if active && variant !== 'primary'}
		<div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-gray-900 rounded-full"></div>
	{/if}
</a>

<style>
	.tap-highlight-transparent {
		-webkit-tap-highlight-color: transparent;
	}
</style>