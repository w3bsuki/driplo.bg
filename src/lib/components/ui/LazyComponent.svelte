<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import { logger } from '$lib/utils/logger';
	
	interface Props {
		/**
		 * Component loader function that returns a promise
		 */
		loader: () => Promise<any>;
		/**
		 * Props to pass to the loaded component
		 */
		componentProps?: Record<string, any>;
		/**
		 * Loading message to display
		 */
		loadingText?: string;
		/**
		 * Whether to show a loading spinner
		 */
		showLoading?: boolean;
		/**
		 * Custom loading component
		 */
		children?: any;
		/**
		 * Whether to use intersection observer for lazy loading
		 */
		useIntersectionObserver?: boolean;
		/**
		 * Root margin for intersection observer
		 */
		rootMargin?: string;
		/**
		 * Threshold for intersection observer
		 */
		threshold?: number;
		/**
		 * Priority loading (skip intersection observer)
		 */
		priority?: boolean;
		/**
		 * Minimum height placeholder
		 */
		minHeight?: string;
		/**
		 * Enable preload on hover
		 */
		preloadOnHover?: boolean;
		/**
		 * Cache loaded component for reuse
		 */
		cacheComponent?: boolean;
		/**
		 * Error fallback component
		 */
		errorFallback?: any;
	}

	let { 
		loader, 
		componentProps = {}, 
		loadingText = 'Loading...',
		showLoading = true,
		children,
		useIntersectionObserver = true,
		rootMargin = '50px',
		threshold = 0.1,
		priority = false,
		minHeight = 'auto',
		preloadOnHover = false,
		cacheComponent = true,
		errorFallback
	}: Props = $props();

	let Component = $state<any>(null);
	let loading = $state(false);
	let error = $state<Error | null>(null);
	let isVisible = $state(false);
	let hasStartedLoading = $state(false);
	let containerElement: HTMLElement;
	
	// Component cache for reuse
	const componentCache = new Map<string, any>();
	const cacheKey = loader.toString(); // Simple cache key based on loader function

	// Load component function
	async function loadComponent() {
		if (hasStartedLoading || Component) return;
		
		hasStartedLoading = true;
		
		try {
			// Check cache first
			if (cacheComponent && componentCache.has(cacheKey)) {
				Component = componentCache.get(cacheKey);
				return;
			}
			
			loading = true;
			const module = await loader();
			Component = module.default;
			
			// Cache the component
			if (cacheComponent) {
				componentCache.set(cacheKey, Component);
			}
			
		} catch (err) {
			error = err instanceof Error ? err : new Error('Failed to load component');
			logger.error('LazyComponent loading error:', err);
		} finally {
			loading = false;
		}
	}
	
	// Handle preload on hover
	function handleMouseEnter() {
		if (preloadOnHover && !hasStartedLoading && !Component) {
			loadComponent();
		}
	}
	
	// Set up intersection observer or immediate loading
	$effect(() => {
		if (!browser) return;
		
		// Load immediately if priority or intersection observer is disabled
		if (priority || !useIntersectionObserver) {
			loadComponent();
			return;
		}
		
		// Set up intersection observer
		if (!containerElement) return;
		
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isVisible) {
						isVisible = true;
						loadComponent();
					}
				});
			},
			{
				rootMargin,
				threshold
			}
		);
		
		observer.observe(containerElement);
		
		return () => {
			observer.unobserve(containerElement);
			observer.disconnect();
		};
	});
</script>

<div 
	bind:this={containerElement}
	class="lazy-component-wrapper"
	style="min-height: {minHeight};"
	onmouseenter={handleMouseEnter}
>
	{#if loading}
		{#if children}
			{@render children()}
		{:else if showLoading}
			<div class="flex items-center justify-center py-8" style="min-height: {minHeight};">
				<LoadingSpinner size="sm" text={loadingText} textPosition="right" />
			</div>
		{/if}
	{:else if error}
		{#if errorFallback}
			{@render errorFallback({ error, retry: loadComponent })}
		{:else}
			<div class="flex items-center justify-center py-8 px-4 text-center" style="min-height: {minHeight};">
				<div class="text-red-600">
					<p class="text-sm font-medium">Failed to load component</p>
					<p class="text-xs text-gray-500 mt-1">Please refresh the page to try again</p>
					<button 
						class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
						onclick={() => { error = null; hasStartedLoading = false; loadComponent(); }}
					>
						Try again
					</button>
				</div>
			</div>
		{/if}
	{:else if Component}
		<svelte:component this={Component} {...componentProps} />
	{:else if !useIntersectionObserver || priority || isVisible}
		<!-- Show placeholder when component should be loading -->
		{#if showLoading && !hasStartedLoading}
			<div class="flex items-center justify-center py-4" style="min-height: {minHeight};">
				<div class="text-gray-400 text-sm">Loading component...</div>
			</div>
		{/if}
	{:else}
		<!-- Invisible placeholder for intersection observer -->
		<div class="w-full h-4" style="min-height: {minHeight};"></div>
	{/if}
</div>

<style>
	.lazy-component-wrapper {
		display: block;
		width: 100%;
	}
	
	/* Smooth transitions */
	.lazy-component-wrapper {
		transition: opacity 0.2s ease-in-out;
	}
	
	/* Ensure proper layout during loading */
	.lazy-component-wrapper:empty {
		min-height: 2rem;
	}
</style>