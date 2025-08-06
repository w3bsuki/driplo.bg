<script lang="ts">
	import { Clock, Flame, Users, Eye, Heart, ShoppingCart } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	
	interface Props {
		type: 'limited_time' | 'high_demand' | 'few_left' | 'viewers' | 'recent_activity';
		count?: number;
		timeLeft?: string;
		productName?: string;
		className?: string;
		size?: 'sm' | 'md' | 'lg';
	}
	
	let { type, count, timeLeft, productName, className, size = 'md' }: Props = $props();
	
	// Real-time viewer simulation for conversion psychology
	let viewerCount = $state(count || Math.floor(Math.random() * 15) + 5);
	let lastActivity = $state('2 minutes ago');
	
	const urgencyConfig = $derived(() => {
		const configs = {
			limited_time: {
				icon: Clock,
				message: `⏰ ${timeLeft || '2h 15m'} left!`,
				subtext: 'Limited time offer',
				color: 'bg-red-500 text-white border-red-600',
				pulse: true
			},
			high_demand: {
				icon: Flame,
				message: `${count || 47} people want this`,
				subtext: 'High demand item',
				color: 'bg-orange-500 text-white border-orange-600',
				pulse: true
			},
			few_left: {
				icon: Users,
				message: `Only ${count || 3} left!`,
				subtext: 'Limited stock',
				color: 'bg-purple-600 text-white border-purple-700',
				pulse: true
			},
			viewers: {
				icon: Eye,
				message: `${viewerCount} viewing now`,
				subtext: 'Live activity',
				color: 'bg-blue-500 text-white border-blue-600',
				pulse: false
			},
			recent_activity: {
				icon: ShoppingCart,
				message: productName ? `"${productName}" sold ${lastActivity}` : `Item sold ${lastActivity}`,
				subtext: 'Recent purchase',
				color: 'bg-green-600 text-white border-green-700',
				pulse: false
			}
		};
		return configs[type];
	});
	
	const sizeClasses = $derived(() => ({
		sm: 'px-2.5 py-1.5 text-xs',
		md: 'px-3 py-2 text-sm',
		lg: 'px-4 py-3 text-base'
	}[size]));
	
	// Simulate real-time updates for psychological pressure
	onMount(() => {
		if (type === 'viewers') {
			const interval = setInterval(() => {
				// Simulate realistic viewer fluctuation
				const change = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
				viewerCount = Math.max(1, Math.min(50, viewerCount + change));
			}, 3000 + Math.random() * 2000); // Random interval 3-5 seconds
			
			return () => clearInterval(interval);
		}
		
		if (type === 'recent_activity') {
			const activities = ['1 minute ago', '3 minutes ago', '5 minutes ago', '8 minutes ago'];
			const interval = setInterval(() => {
				lastActivity = activities[Math.floor(Math.random() * activities.length)];
			}, 15000); // Update every 15 seconds
			
			return () => clearInterval(interval);
		}
	});
</script>

<div class={cn(
	"inline-flex items-center gap-2 rounded-lg border-2 font-semibold transition-all duration-300 relative overflow-hidden",
	urgencyConfig.color,
	sizeClasses,
	urgencyConfig.pulse && "animate-pulse shadow-lg",
	className
)}>
	{#if urgencyConfig.pulse}
		<!-- Animated background for high-urgency items -->
		<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
	{/if}
	
	<svelte:component this={urgencyConfig.icon} class={cn(
		"flex-shrink-0",
		size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
	)} />
	
	<div class="flex flex-col min-w-0">
		<span class="font-bold truncate">{urgencyConfig.message}</span>
		{#if urgencyConfig.subtext}
			<span class={cn(
				"opacity-90 font-normal",
				size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
			)}>
				{urgencyConfig.subtext}
			</span>
		{/if}
	</div>
	
	{#if type === 'viewers'}
		<!-- Live indicator dot -->
		<div class="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
		<div class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
	{/if}
</div>

<style>
	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
	
	.animate-shimmer {
		animation: shimmer 2s infinite;
	}
</style>