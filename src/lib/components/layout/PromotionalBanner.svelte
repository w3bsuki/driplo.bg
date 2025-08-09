<script lang="ts">
	import { X } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		message: string;
		secondaryMessage?: string;
		ctaText?: string;
		ctaHref?: string;
		dismissible?: boolean;
		variant?: 'default' | 'gradient' | 'launch';
		onDismiss?: () => void;
		countdown?: boolean;
	}
	
	let { 
		message,
		secondaryMessage, 
		ctaText, 
		ctaHref, 
		dismissible = true,
		variant = 'gradient',
		onDismiss,
		countdown = false
	}: Props = $props();
	
	let isDismissed = $state(false);
	
	onMount(() => {
		if (browser && dismissible) {
			const dismissedAt = localStorage.getItem('banner-dismissed');
			if (dismissedAt) {
				const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
				if (daysSince < 7) {
					isDismissed = true;
				}
			}
		}
	});
	
	function handleDismiss() {
		isDismissed = true;
		if (browser && dismissible) {
			localStorage.setItem('banner-dismissed', Date.now().toString());
		}
		onDismiss?.();
	}
</script>

{#if !isDismissed}
	<div 
		class="relative text-center py-3 md:py-4 px-3 md:px-4 text-sm md:text-base font-medium {variant === 'gradient' ? 'bg-gray-900 text-white' : variant === 'launch' ? 'bg-black text-white border-b border-gray-800' : 'bg-blue-50 text-blue-900'}"
		role="banner"
		aria-live="polite"
	>
		<div class="container mx-auto flex items-center justify-center gap-1.5 md:gap-3">
			<!-- Mobile: Single line | Desktop: Full message -->
			<span class="truncate md:whitespace-normal">
				<span class="inline md:hidden">{message.split('.')[0]}</span>
				<span class="hidden md:inline">{message}</span>
				{#if secondaryMessage}
					<span class="hidden md:inline ml-1">{secondaryMessage}</span>
				{/if}
			</span>
			{#if ctaText && ctaHref}
				<a 
					href={ctaHref}
					class="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all flex-shrink-0 {variant === 'gradient' ? 'bg-white text-gray-900 hover:bg-gray-100' : variant === 'launch' ? 'bg-white text-black hover:bg-gray-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}"
				>
					{ctaText}
					<span class="hidden md:inline">→</span>
				</a>
			{/if}
		</div>
		{#if dismissible}
			<button
				onclick={handleDismiss}
				class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors {variant === 'gradient' ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-blue-100 text-blue-600'}"
				aria-label={m.banner_dismiss()}
			>
				<X class="h-3 w-3" />
			</button>
		{/if}
	</div>
{/if}