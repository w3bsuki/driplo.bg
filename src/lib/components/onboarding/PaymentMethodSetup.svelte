<script lang="ts">
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte';
	import { Info, AlertCircle } from 'lucide-svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	
	interface Props {
		supabase?: SupabaseClient;
		onSuccess?: () => void;
	}
	
	let { supabase, onSuccess }: Props = $props();
	
	let hasSetup = $state(false);
	
	function handleSuccess() {
		hasSetup = true;
		if (onSuccess) {
			onSuccess();
		}
	}
</script>

<div class="space-y-6">
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-gray-900 mb-3">Set Up Payment Method</h2>
		<p class="text-lg text-gray-600 max-w-2xl mx-auto">
			Add your payment method to receive payments when you sell items.
		</p>
	</div>

	<!-- Info Card -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
		<div class="flex gap-3">
			<Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
			<div class="text-sm">
				<p class="font-medium text-blue-900 mb-1">Why do we need payment methods?</p>
				<p class="text-blue-700">
					When you sell items on Driplo, buyers need to know how to pay you. 
					Your payment details are kept secure and only shared with buyers during checkout.
				</p>
			</div>
		</div>
	</div>
	
	{#if hasSetup}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<div class="flex gap-3">
				<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
				<div class="text-sm">
					<p class="font-medium text-green-900">Payment method saved!</p>
					<p class="text-green-700">You can now receive payments for your sales.</p>
				</div>
			</div>
		</div>
	{:else}
		<PaymentAccountSetup onsuccess={handleSuccess} />
	{/if}
	
	<!-- Optional Skip Notice -->
	<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
		<div class="flex gap-3">
			<AlertCircle class="w-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
			<div class="text-xs">
				<p class="text-yellow-800">
					You can skip this step now and add payment methods later from your profile settings.
					However, you won't be able to sell items until you add a payment method.
				</p>
			</div>
		</div>
	</div>
</div>