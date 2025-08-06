<script lang="ts">
	import { Shield, Star, CreditCard, Package, Check } from 'lucide-svelte';

	const trustFeatures = [
		{
			icon: Shield,
			title: 'Buyer Protection',
			description: 'Every purchase is protected',
			color: 'text-blue-600'
		},
		{
			icon: CreditCard,
			title: 'Secure Payments',
			description: 'Powered by Stripe',
			color: 'text-green-600'
		},
		{
			icon: Package,
			title: 'Fast Shipping',
			description: '2-3 day delivery',
			color: 'text-purple-600'
		},
		{
			icon: Star,
			title: 'Trusted by 50K+',
			description: '4.8★ average rating',
			color: 'text-yellow-600'
		}
	];
</script>

<section class="py-8 bg-gray-50 border-y border-gray-200">
	<div class="container px-4">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
			{#each trustFeatures as feature}
				<div class="flex flex-col items-center text-center">
					<div class="p-3 rounded-full bg-white shadow-sm mb-2">
						<svelte:component 
							this={feature.icon} 
							class="h-6 w-6 {feature.color}" 
							stroke-width={2}
						/>
					</div>
					<h3 class="text-sm font-semibold text-gray-900">{feature.title}</h3>
					<p class="text-xs text-gray-600 mt-0.5">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>