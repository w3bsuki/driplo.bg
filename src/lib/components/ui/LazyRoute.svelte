<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	
	interface Props {
		/**
		 * Route component loader function
		 */
		loader: () => Promise<any>;
		/**
		 * Props to pass to the loaded route component
		 */
		routeProps?: Record<string, any>;
		/**
		 * Preload the route on hover (for navigation links)
		 */
		preloadOnHover?: boolean;
		/**
		 * Custom loading component
		 */
		loading?: any;
		/**
		 * Custom error component  
		 */
		error?: any;
		/**
		 * Route identifier for caching
		 */
		routeId?: string;
		/**
		 * Show route transition animations
		 */
		showTransitions?: boolean;
	}
	
	let {
		loader,
		routeProps = {},
		preloadOnHover = true,
		loading,
		error,
		routeId,
		showTransitions = true
	}: Props = $props();
	
	let RouteComponent = $state<any>(null);
	let isLoading = $state(false);
	let loadError = $state<Error | null>(null);
	let isVisible = $state(false);
	let preloadStarted = $state(false);
	
	// Route component cache
	const routeCache = new Map<string, any>();
	const cacheKey = routeId || loader.toString();
	
	// Load route component
	async function loadRoute() {
		if (RouteComponent || isLoading) return;
		
		try {
			// Check cache first
			if (routeCache.has(cacheKey)) {
				RouteComponent = routeCache.get(cacheKey);
				return;
			}
			
			isLoading = true;
			loadError = null;
			
			const module = await loader();
			RouteComponent = module.default;
			
			// Cache the route component
			routeCache.set(cacheKey, RouteComponent);
			
		} catch (err) {
			loadError = err instanceof Error ? err : new Error('Failed to load route');
			logger.error('LazyRoute loading error:', err);
		} finally {
			isLoading = false;
		}
	}
	
	// Handle preload on hover
	function handlePreload() {
		if (preloadOnHover && !preloadStarted && !RouteComponent) {
			preloadStarted = true;
			loadRoute();
		}
	}
	
	// Load route immediately on mount
	onMount(() => {
		loadRoute();
	});
</script>

<!-- Route container with optional transitions -->
<div 
	class="lazy-route-container"
	class:show-transitions={showTransitions}
	onmouseenter={handlePreload}
>
	{#if isLoading}
		{#if loading}
			{@render loading()}
		{:else}
			<div class="route-loading">
				<LoadingSpinner size="md" text="Loading page..." />
			</div>
		{/if}
	{:else if loadError}
		{#if error}
			{@render error({ error: loadError, retry: () => { loadError = null; loadRoute(); } })}
		{:else}
			<div class="route-error">
				<ErrorMessage 
					message="Failed to load page"
					description="Please try refreshing or check your connection"
					showRetry={true}
					onRetry={() => { loadError = null; loadRoute(); }}
				/>
			</div>
		{/if}
	{:else if RouteComponent}
		<div class="route-content" class:fade-in={showTransitions}>
			<svelte:component this={RouteComponent} {...routeProps} />
		</div>
	{/if}
</div>

<style>
	.lazy-route-container {
		width: 100%;
		min-height: 200px;
		position: relative;
	}
	
	.route-loading, .route-error {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		width: 100%;
	}
	
	.route-content {
		width: 100%;
	}
	
	/* Route transition animations */
	.show-transitions .route-content {
		animation: fadeSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.show-transitions .fade-in {
		opacity: 0;
		animation: fadeIn 0.4s ease-out forwards;
	}
	
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.show-transitions .route-content,
		.show-transitions .fade-in {
			animation: none;
		}
		
		.route-content {
			opacity: 1;
			transform: none;
		}
	}
</style>