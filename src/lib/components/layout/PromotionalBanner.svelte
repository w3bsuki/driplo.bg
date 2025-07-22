<script lang="ts">
	import { X, ArrowRight, Sparkles } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	
	// Constants
	const STORAGE_KEY = 'driplo-banner-dismissed-v1';
	const DISMISS_DURATION_DAYS = 7;
	const SELLER_COUNT_MIN = 950;
	const SELLER_COUNT_MAX = 1000;
	const COUNT_INCREMENT_INTERVAL = 3000;
	const ANIMATION_DURATION = '300ms';
	
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
	let sellerCount = $state(Math.floor(Math.random() * (SELLER_COUNT_MAX - SELLER_COUNT_MIN)) + SELLER_COUNT_MIN);
	let prefersReducedMotion = $state(false);
	
	// Storage helpers with error handling
	function getStorageItem(key: string): string | null {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			console.warn('Failed to read from localStorage:', e);
			return null;
		}
	}
	
	function setStorageItem(key: string, value: string): void {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.warn('Failed to write to localStorage:', e);
		}
	}
	
	// Check localStorage and accessibility preferences on mount
	onMount(() => {
		// Check for reduced motion preference
		if (browser) {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;
			
			// Listen for changes to motion preference
			const handleMotionChange = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};
			mediaQuery.addEventListener('change', handleMotionChange);
			
			// Check if banner was previously dismissed
			if (dismissible) {
				const dismissedAt = getStorageItem(STORAGE_KEY);
				if (dismissedAt) {
					const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
					if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
						isDismissed = true;
					}
				}
			}
			
			// Animate seller count only if reduced motion is not preferred
			if (countdown && !prefersReducedMotion) {
				const interval = setInterval(() => {
					if (sellerCount < SELLER_COUNT_MAX) {
						sellerCount += 1;
					}
				}, COUNT_INCREMENT_INTERVAL);
				
				return () => {
					clearInterval(interval);
					mediaQuery.removeEventListener('change', handleMotionChange);
				};
			}
			
			return () => {
				mediaQuery.removeEventListener('change', handleMotionChange);
			};
		}
	});
	
	function handleDismiss() {
		isDismissed = true;
		if (browser && dismissible) {
			setStorageItem(STORAGE_KEY, Date.now().toString());
		}
		onDismiss?.();
	}
	
	// Variant styles using design tokens where possible
	const variantStyles = {
		default: {
			container: "bg-blue-50 text-blue-900 border-b border-blue-100",
			button: "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200",
			dismiss: "hover:bg-blue-100 text-blue-600 hover:text-blue-700"
		},
		gradient: {
			container: "bg-gray-900 text-white",
			button: "bg-white text-gray-900 hover:bg-gray-100",
			dismiss: "hover:bg-white/10 text-white/70 hover:text-white"
		},
		launch: {
			container: "bg-gradient-to-r from-[#87CEEB] via-[#6BB6D8] to-[#4F9FC5] text-white shadow-lg",
			button: "bg-white text-[#4F9FC5] hover:bg-gray-50 shadow-md hover:shadow-lg",
			dismiss: "hover:bg-white/10 text-white/70 hover:text-white"
		}
	};
	
	const currentVariant = $derived(variantStyles[variant]);
	const shouldAnimate = $derived(!prefersReducedMotion);
</script>

{#if !isDismissed}
	<div 
		class={cn(
			"promotional-banner relative text-center py-2 px-3 text-xs md:text-sm font-medium",
			shouldAnimate && `transition-all duration-[${ANIMATION_DURATION}]`,
			currentVariant.container,
			variant === 'launch' && shouldAnimate && "animate-gradient-x"
		)}
		role="banner"
		aria-live="polite"
	>
		<div class="container mx-auto flex items-center justify-center gap-2 md:gap-4">
			<div class="flex items-center gap-1.5">
				{#if variant === 'launch'}
					<Sparkles 
						class={cn(
							"h-3 w-3 md:h-4 md:w-4 hidden md:inline",
							shouldAnimate && "animate-pulse"
						)} 
						aria-hidden="true"
					/>
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
						"inline-flex items-center gap-1 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold group",
						shouldAnimate && `transition-all duration-[${ANIMATION_DURATION}]`,
						currentVariant.button,
						variant === 'launch' && shouldAnimate && "transform hover:scale-105"
					)}
				>
					{ctaText}
					{#if variant === 'launch'}
						<ArrowRight 
							class={cn(
								"h-3 w-3",
								shouldAnimate && "transition-transform group-hover:translate-x-0.5"
							)} 
							aria-hidden="true"
						/>
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
					shouldAnimate && `transition-colors duration-[${ANIMATION_DURATION}]`,
					currentVariant.dismiss
				)}
				aria-label={m.banner_dismiss()}
			>
				<X class="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
			</button>
		{/if}
	</div>
{/if}

<style>
	/* Only animate if user hasn't requested reduced motion */
	@media (prefers-reduced-motion: no-preference) {
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
	}
	
	/* Simplified animation for reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.animate-gradient-x {
			background-size: 100% 100%;
			animation: none;
		}
		
		.animate-pulse {
			animation: none;
		}
	}
</style>