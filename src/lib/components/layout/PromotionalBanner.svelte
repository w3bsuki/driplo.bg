<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	interface Props {
		message: string;
		ctaText?: string;
		ctaHref?: string;
		dismissible?: boolean;
		variant?: 'default' | 'gradient';
		onDismiss?: () => void;
	}
	
	let { 
		message, 
		ctaText, 
		ctaHref, 
		dismissible = true,
		variant = 'gradient',
		onDismiss
	}: Props = $props();
	
	let isDismissed = $state(false);
	
	function handleDismiss() {
		isDismissed = true;
		onDismiss?.();
	}
</script>

{#if !isDismissed}
	<div class={cn(
		"relative text-center py-2 px-4 text-sm font-medium",
		variant === 'gradient' 
			? "bg-gradient-to-r from-blue-400 to-blue-500 text-white" 
			: "bg-blue-50 text-blue-900 border-b border-blue-100"
	)}>
		<div class="container mx-auto flex items-center justify-center gap-2">
			<span class="flex-shrink-0">{message}</span>
			{#if ctaText && ctaHref}
				<a 
					href={ctaHref}
					class={cn(
						"inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
						variant === 'gradient'
							? "bg-white/20 hover:bg-white/30 text-white border border-white/30"
							: "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200"
					)}
				>
					{ctaText}
				</a>
			{/if}
		</div>
		{#if dismissible}
			<button
				onclick={handleDismiss}
				class={cn(
					"absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full",
					variant === 'gradient'
						? "hover:bg-white/20 text-white/80 hover:text-white"
						: "hover:bg-blue-100 text-blue-600 hover:text-blue-700"
				)}
				aria-label="Dismiss banner"
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>
{/if}