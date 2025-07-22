<script lang="ts">
	import { X, ArrowRight, Sparkles } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	interface Props {
		message: string;
		ctaText?: string;
		ctaHref?: string;
		dismissible?: boolean;
		variant?: 'default' | 'gradient' | 'launch';
		onDismiss?: () => void;
		secondaryMessage?: string;
		countdown?: boolean;
	}
	
	let { 
		message, 
		ctaText, 
		ctaHref, 
		dismissible = true,
		variant = 'gradient',
		onDismiss,
		secondaryMessage,
		countdown = false
	}: Props = $props();
	
	let isDismissed = $state(false);
	let sellerCount = $state(Math.floor(Math.random() * 50) + 950); // Random between 950-1000
	
	// Check localStorage on mount
	onMount(() => {
		if (browser && dismissible) {
			const dismissedAt = localStorage.getItem('banner-dismissed');
			if (dismissedAt) {
				const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
				if (daysSinceDismissed < 7) {
					isDismissed = true;
				}
			}
		}
		
		// Animate seller count
		if (countdown) {
			const interval = setInterval(() => {
				if (sellerCount < 1000) {
					sellerCount += 1;
				}
			}, 3000);
			
			return () => clearInterval(interval);
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
	<div class={cn(
		"relative text-center py-2 px-3 text-xs md:text-sm font-medium transition-all duration-300",
		variant === 'gradient' && "bg-gray-900 text-white",
		variant === 'default' && "bg-blue-50 text-blue-900 border-b border-blue-100",
		variant === 'launch' && "bg-gradient-to-r from-[#87CEEB] via-[#6BB6D8] to-[#4F9FC5] text-white animate-gradient-x shadow-lg"
	)}>
		<div class="container mx-auto flex items-center justify-center gap-2 md:gap-4">
			<div class="flex items-center gap-1.5">
				{#if variant === 'launch'}
					<Sparkles class="h-3 w-3 md:h-4 md:w-4 animate-pulse hidden md:inline" />
				{/if}
				<span class="font-semibold">{message}</span>
				{#if secondaryMessage}
					<span class="hidden lg:inline opacity-90">{secondaryMessage}</span>
				{/if}
			</div>
			{#if ctaText && ctaHref}
				<a 
					href={ctaHref}
					class={cn(
						"inline-flex items-center gap-1 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-200 group",
						variant === 'gradient' && "bg-white text-gray-900 hover:bg-gray-100",
						variant === 'default' && "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200",
						variant === 'launch' && "bg-white text-[#4F9FC5] hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:scale-105"
					)}
				>
					{ctaText}
					{#if variant === 'launch'}
						<ArrowRight class="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
					{/if}
				</a>
				{#if countdown && variant === 'launch'}
					<span class="text-[10px] md:text-xs opacity-90 font-medium hidden md:inline">
						{m.banner_join_sellers({ count: sellerCount })}
					</span>
				{/if}
			{/if}
		</div>
		{#if dismissible}
			<button
				on:click={handleDismiss}
				class={cn(
					"absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-0.5 md:p-1 rounded-full",
					variant === 'gradient'
						? "hover:bg-white/10 text-white/70 hover:text-white"
						: "hover:bg-blue-100 text-blue-600 hover:text-blue-700"
				)}
				aria-label={m.banner_dismiss()}
			>
				<X class="h-3 w-3 md:h-4 md:w-4" />
			</button>
		{/if}
	</div>
{/if}

<style>
	@keyframes gradient-x {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
	
	.animate-gradient-x {
		background-size: 200% 200%;
		animation: gradient-x 3s ease infinite;
	}
</style>