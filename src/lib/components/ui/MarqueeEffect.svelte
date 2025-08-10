<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		children?: any;
		gap?: number;
		speed?: number;
		speedOnHover?: number;
		direction?: 'horizontal' | 'vertical';
		reverse?: boolean;
		class?: string;
	}

	let {
		children,
		gap = 16,
		speed = 100,
		speedOnHover,
		direction = 'horizontal',
		reverse = false,
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;
	let animationRef: HTMLDivElement;
	let currentSpeed = $state(speed);
	let isTransitioning = $state(false);
	let animationId: number;
	let startTime: number;
	let containerSize = $state(0);
	let contentSize = $state(0);

	// Calculate animation properties
	const from = $derived(reverse ? -contentSize / 2 : 0);
	const to = $derived(reverse ? 0 : -contentSize / 2);
	const distanceToTravel = $derived(Math.abs(to - from));
	const duration = $derived(distanceToTravel / currentSpeed * 1000); // Convert to milliseconds

	let currentTranslation = $state(from);

	function updateSizes() {
		if (containerRef && animationRef) {
			const rect = containerRef.getBoundingClientRect();
			containerSize = direction === 'horizontal' ? rect.width : rect.height;
			contentSize = containerSize + gap;
		}
	}

	function animate() {
		if (!startTime) startTime = performance.now();
		const elapsed = performance.now() - startTime;
		const progress = (elapsed % duration) / duration;
		
		if (reverse) {
			currentTranslation = from + (to - from) * progress;
		} else {
			currentTranslation = from + (to - from) * progress;
		}

		animationId = requestAnimationFrame(animate);
	}

	function startAnimation() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		startTime = performance.now();
		animate();
	}

	function handleHoverStart() {
		if (speedOnHover) {
			isTransitioning = true;
			currentSpeed = speedOnHover;
			startAnimation();
		}
	}

	function handleHoverEnd() {
		if (speedOnHover) {
			isTransitioning = true;
			currentSpeed = speed;
			startAnimation();
		}
	}

	onMount(() => {
		updateSizes();
		startAnimation();

		const resizeObserver = new ResizeObserver(updateSizes);
		if (containerRef) {
			resizeObserver.observe(containerRef);
		}

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			resizeObserver.disconnect();
		};
	});

	// Restart animation when dependencies change
	$effect(() => {
		if (containerRef) {
			startAnimation();
		}
	});
</script>

<div bind:this={containerRef} class={cn('overflow-hidden', className)}>
	<div
		bind:this={animationRef}
		class="flex w-max"
		style:transform={direction === 'horizontal' 
			? `translateX(${currentTranslation}px)` 
			: `translateY(${currentTranslation}px)`}
		style:gap="{gap}px"
		style:flex-direction={direction === 'horizontal' ? 'row' : 'column'}
		onmouseenter={speedOnHover ? handleHoverStart : undefined}
		onmouseleave={speedOnHover ? handleHoverEnd : undefined}
	>
		{@render children?.()}
		{@render children?.()}
	</div>
</div>