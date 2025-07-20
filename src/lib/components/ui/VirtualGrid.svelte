<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { browser } from '$app/environment'

	// Props
	interface Props {
		items?: any[]
		itemHeight?: number
		columns?: number
		gap?: number
		containerHeight?: number
		overscan?: number
	}

	let {
		items = [],
		itemHeight = 200,
		columns = 4,
		gap = 16,
		containerHeight = 600,
		overscan = 5
	}: Props = $props()

	// Container and scroll state
	let containerRef: HTMLDivElement
	let scrollTop = $state(0)
	let containerWidth = $state(0)
	let isScrolling = $state(false)
	let scrollTimer: number

	// Calculate derived values
	const rowHeight = $derived(itemHeight + gap)
	const totalRows = $derived(Math.ceil(items.length / columns))
	const totalHeight = $derived(totalRows * rowHeight - gap)

	// Calculate visible range
	const startRow = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - overscan))
	const endRow = $derived(Math.min(totalRows - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan))
	const visibleRows = $derived(endRow - startRow + 1)

	// Calculate visible items
	const visibleItems = $derived(items.slice(startRow * columns, (endRow + 1) * columns).map((item, index) => ({
		item,
		index: startRow * columns + index,
		row: Math.floor((startRow * columns + index) / columns),
		column: (startRow * columns + index) % columns,
		top: Math.floor((startRow * columns + index) / columns) * rowHeight,
		left: ((startRow * columns + index) % columns) * (100 / columns)
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

	// Handle resize
	function handleResize() {
		if (!containerRef) return
		containerWidth = containerRef.offsetWidth
	}

	// Initialize
	onMount(() => {
		if (browser && containerRef) {
			handleResize()
			
			// Set up resize observer
			const resizeObserver = new ResizeObserver(handleResize)
			resizeObserver.observe(containerRef)
			
			return () => {
				resizeObserver.disconnect()
				clearTimeout(scrollTimer)
			}
		}
	})

	// Smooth scrolling method
	export function scrollToIndex(index: number) {
		if (!containerRef) return
		
		const row = Math.floor(index / columns)
		const targetScrollTop = row * rowHeight
		
		containerRef.scrollTo({
			top: targetScrollTop,
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
	class="virtual-grid-container"
	style="height: {containerHeight}px; overflow-y: auto;"
	on:scroll={handleScroll}
	on:resize={handleResize}
>
	<!-- Total height spacer -->
	<div class="virtual-grid-spacer" style="height: {totalHeight}px; position: relative;">
		<!-- Visible items -->
		{#each visibleItems as { item, index, row, column, top, left } (index)}
			<div
				class="virtual-grid-item"
				style="
					position: absolute;
					top: {top}px;
					left: {left}%;
					width: calc({100 / columns}% - {gap * (columns - 1) / columns}px);
					height: {itemHeight}px;
					transform: {isScrolling ? 'translateZ(0)' : 'none'};
				"
			>
				<slot {item} {index} {row} {column}></slot>
			</div>
		{/each}
	</div>
</div>

<!-- Loading indicator for scrolling -->
{#if isScrolling}
	<div class="virtual-grid-loading">
		<div class="loading-spinner"></div>
	</div>
{/if}

<style>
	.virtual-grid-container {
		position: relative;
		will-change: scroll-position;
	}

	.virtual-grid-spacer {
		position: relative;
		pointer-events: none;
	}

	.virtual-grid-item {
		pointer-events: auto;
		will-change: transform;
	}

	.virtual-grid-loading {
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
		.virtual-grid-container {
			-webkit-overflow-scrolling: touch;
		}
	}
</style>