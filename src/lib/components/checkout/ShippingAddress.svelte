<script lang="ts">
	import { Truck } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		shippingAddress: {
			name: string;
			address_line1: string;
			address_line2: string;
			city: string;
			state: string;
			postal_code: string;
			country: string;
		};
	}

	let { shippingAddress = $bindable() }: Props = $props();
</script>

<div class="mb-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
		<Truck class="w-5 h-5" />
		{m.checkout_shipping_address()}
	</h3>
	<div class="space-y-4">
		<input
			bind:value={shippingAddress.name}
			placeholder="{m.checkout_full_name()}"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
			required
		/>
		<input
			bind:value={shippingAddress.address_line1}
			placeholder="{m.checkout_address_line1()}"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
			required
		/>
		<input
			bind:value={shippingAddress.address_line2}
			placeholder="{m.checkout_address_line2()}"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
		/>
		<div class="grid grid-cols-2 gap-4">
			<input
				bind:value={shippingAddress.city}
				placeholder="{m.checkout_city()}"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				required
			/>
			<input
				bind:value={shippingAddress.state}
				placeholder="{m.checkout_state()}"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				required
			/>
		</div>
		<input
			bind:value={shippingAddress.postal_code}
			placeholder="{m.checkout_zip_code()}"
			class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
			required
		/>
	</div>
</div>