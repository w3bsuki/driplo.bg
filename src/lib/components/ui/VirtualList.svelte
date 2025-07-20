<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { browser } from '$app/environment'

	// Props
	interface Props {
		items?: any[]
		itemHeight?: number
		containerHeight?: number
		overscan?: number
		gap?: number
	}

	let {
		items = [],
		itemHeight = 100,
		containerHeight = 400,
		overscan = 5,
		gap = 0
	}: Props = $props()

	// Container and scroll state
	let containerRef: HTMLDivElement
	let scrollTop = $state(0)
	let isScrolling = $state(false)
	let scrollTimer: number

	// Calculate derived values
	const totalHeight = $derived(items.length * itemHeight + (items.length - 1) * gap)
	const startIndex = $derived(Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan))
	const endIndex = $derived(Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan))
	const visibleItems = $derived(items.slice(startIndex, endIndex + 1).map((item, index) => ({
		item,
		index: startIndex + index,
		top: (startIndex + index) * (itemHeight + gap)
	})))

	// Handle scroll
	function handleScroll() {
		if (!containerRef) return
		
		scrollTop = containerRef.scrollTop
		
		// Set scrolling state
		isScrolling = true
		clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			isScrolling = false
		}, 150)
	}

	// Initialize
	onMount(() => {
		if (browser && containerRef) {
			return () => {
				clearTimeout(scrollTimer)
			}
		}
	})

	// Smooth scrolling method
	export function scrollToIndex(index: number) {
		if (!containerRef) return
		
		const targetScrollTop = index * (itemHeight + gap)
		
		containerRef.scrollTo({
			top: targetScrollTop,
			behavior: 'smooth'
		})
	}

	// Scroll to bottom (useful for chat)
	export function scrollToBottom() {
		if (!containerRef) return
		
		containerRef.scrollTo({
			top: totalHeight,
			behavior: 'smooth'
		})
	}

	// Get item at position
	export function getItemAt(index: number) {
		return items[index]
	}
</script>

<div
	bind:this={containerRef}
	class="virtual-list-container"
	style="height: {containerHeight}px; overflow-y: auto;"
	on:scroll={handleScroll}
>
	<!-- Total height spacer -->
	<div class="virtual-list-spacer" style="height: {totalHeight}px; position: relative;">
		<!-- Visible items -->
		{#each visibleItems as { item, index, top } (index)}
			<div
				class="virtual-list-item"
				style="
					position: absolute;
					top: {top}px;
					left: 0;
					right: 0;
					height: {itemHeight}px;
					transform: {isScrolling ? 'translateZ(0)' : 'none'};
				"
			>
				<slot {item} {index} />
			</div>
		{/each}
	</div>
</div>

<!-- Loading indicator for scrolling -->
{#if isScrolling}
	<div class="virtual-list-loading">
		<div class="loading-spinner"></div>
	</div>
{/if}

<style>
	.virtual-list-container {
		position: relative;
		will-change: scroll-position;
	}

	.virtual-list-spacer {
		position: relative;
		pointer-events: none;
	}

	.virtual-list-item {
		pointer-events: auto;
		will-change: transform;
	}

	.virtual-list-loading {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 14px;
		z-index: 1000;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #ffffff40;
		border-top: 2px solid #ffffff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Optimize for mobile */
	@media (max-width: 768px) {
		.virtual-list-container {
			-webkit-overflow-scrolling: touch;
		}
	}
</style>