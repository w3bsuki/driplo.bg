<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import type { Metric } from 'web-vitals';
	
	interface VitalData {
		value: number;
		rating: 'good' | 'needs-improvement' | 'poor';
		timestamp: number;
	}
	
	let vitals = $state<Record<string, VitalData>>({});
	let isMinimized = $state(true);
	let isVisible = $state(dev);
	
	const thresholds = {
		LCP: { good: 2500, poor: 4000 },
		FID: { good: 100, poor: 300 },
		INP: { good: 200, poor: 500 },
		CLS: { good: 0.1, poor: 0.25 },
		FCP: { good: 1800, poor: 3000 },
		TTFB: { good: 800, poor: 1800 }
	};
	
	onMount(async () => {
		if (!dev) return;
		
		const { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } = await import('web-vitals');
		
		const handleMetric = (metric: Metric) => {
			vitals[metric.name] = {
				value: metric.value,
				rating: metric.rating || getRating(metric.name, metric.value),
				timestamp: Date.now()
			};
		};
		
		onCLS(handleMetric);
		onFID(handleMetric);
		onLCP(handleMetric);
		onFCP(handleMetric);
		onTTFB(handleMetric);
		onINP(handleMetric);
	});
	
	function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
		const threshold = thresholds[name as keyof typeof thresholds];
		if (!threshold) return 'needs-improvement';
		
		if (value <= threshold.good) return 'good';
		if (value > threshold.poor) return 'poor';
		return 'needs-improvement';
	}
	
	function formatValue(name: string, value: number): string {
		if (name === 'CLS') return value.toFixed(3);
		return Math.round(value) + 'ms';
	}
	
	function getColor(rating: string): string {
		switch (rating) {
			case 'good': return '#10b981';
			case 'poor': return '#ef4444';
			default: return '#f59e0b';
		}
	}
	
	function getEmoji(rating: string): string {
		switch (rating) {
			case 'good': return '✅';
			case 'poor': return '❌';
			default: return '⚠️';
		}
	}
</script>

{#if isVisible}
	<div 
		class="fixed bottom-4 right-4 z-50 font-mono text-xs"
		style="font-family: 'Courier New', monospace;"
	>
		{#if isMinimized}
			<button
				onclick={() => isMinimized = false}
				class="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
			>
				<span class="text-lg">📊</span>
				Web Vitals
			</button>
		{:else}
			<div class="bg-gray-900 text-white rounded-lg shadow-xl p-4 min-w-[280px]">
				<div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
					<h3 class="font-semibold text-sm">Core Web Vitals</h3>
					<button
						onclick={() => isMinimized = true}
						class="text-gray-400 hover:text-white"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 12H5M12 19l-7-7 7-7"/>
						</svg>
					</button>
				</div>
				
				<div class="space-y-2">
					{#each Object.entries(vitals) as [name, data]}
						<div class="flex justify-between items-center py-1">
							<span class="text-gray-300">
								{name}
								<span class="text-xs text-gray-500 ml-1">
									{name === 'LCP' ? '(Largest Paint)' :
									 name === 'FID' ? '(Input Delay)' :
									 name === 'INP' ? '(Interaction)' :
									 name === 'CLS' ? '(Layout Shift)' :
									 name === 'FCP' ? '(First Paint)' :
									 name === 'TTFB' ? '(First Byte)' : ''}
								</span>
							</span>
							<div class="flex items-center gap-2">
								<span 
									class="font-bold"
									style="color: {getColor(data.rating)}"
								>
									{formatValue(name, data.value)}
								</span>
								<span>{getEmoji(data.rating)}</span>
							</div>
						</div>
					{/each}
					
					{#if Object.keys(vitals).length === 0}
						<p class="text-gray-500 text-center py-2">
							Collecting metrics...
						</p>
					{/if}
				</div>
				
				<div class="mt-3 pt-2 border-t border-gray-700">
					<div class="text-xs text-gray-400">
						<div class="flex justify-between">
							<span>Good</span>
							<span style="color: #10b981">✅ Fast</span>
						</div>
						<div class="flex justify-between">
							<span>Needs Work</span>
							<span style="color: #f59e0b">⚠️ Moderate</span>
						</div>
						<div class="flex justify-between">
							<span>Poor</span>
							<span style="color: #ef4444">❌ Slow</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	button, div {
		user-select: none;
	}
</style>