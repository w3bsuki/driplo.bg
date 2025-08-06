<script lang="ts">
	import { Shield, CheckCircle, Star, Users, Clock, Truck } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	
	interface Props {
		variant?: 'compact' | 'full';
		className?: string;
	}
	
	let { variant = 'compact', className }: Props = $props();
	
	const trustSignals = [
		{
			icon: Shield,
			title: "Secure Payments",
			description: "Protected by Stripe",
			color: "text-green-600 bg-green-50"
		},
		{
			icon: CheckCircle, 
			title: "Buyer Protection",
			description: "30-day return guarantee",
			color: "text-blue-600 bg-blue-50"
		},
		{
			icon: Star,
			title: "95% Rating",
			description: "From verified buyers",
			color: "text-yellow-600 bg-yellow-50"
		},
		{
			icon: Truck,
			title: "Fast Delivery",
			description: "Next-day available",
			color: "text-purple-600 bg-purple-50"
		}
	];
</script>

{#if variant === 'compact'}
	<div class={cn("flex items-center gap-4 py-2", className)}>
		{#each trustSignals.slice(0, 3) as signal}
			<div class="flex items-center gap-2">
				<div class={cn("flex items-center justify-center w-6 h-6 rounded-full", signal.color)}>
					<svelte:component this={signal.icon} class="h-3.5 w-3.5" />
				</div>
				<span class="text-sm font-medium text-gray-700">{signal.title}</span>
			</div>
		{/each}
	</div>
{:else}
	<div class={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
		{#each trustSignals as signal}
			<div class={cn("flex flex-col items-center p-4 rounded-lg border", signal.color)}>
				<svelte:component this={signal.icon} class="h-6 w-6 mb-2" />
				<h3 class="font-semibold text-sm text-gray-900 text-center">{signal.title}</h3>
				<p class="text-xs text-gray-600 text-center mt-1">{signal.description}</p>
			</div>
		{/each}
	</div>
{/if}