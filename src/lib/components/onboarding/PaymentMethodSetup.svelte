<script lang="ts">
	import { user, profile } from '$lib/stores/auth';
	import { toast } from 'svelte-sonner';
	import { CreditCard, Wallet, DollarSign, Info, CheckCircle2 } from 'lucide-svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		selectedMethods: string[];
		revolut_tag?: string;
		paypal_tag?: string;
		supabase?: SupabaseClient;
	}

	let { 
		selectedMethods = $bindable([]), 
		revolut_tag = $bindable(''),
		paypal_tag = $bindable(''),
		supabase
	}: Props = $props();

	// Auth stores are already imported above
	let loading = $state(false);

	const paymentMethods = [
		{
			id: 'revolut',
			name: 'Revolut',
			description: 'Fast transfers with low fees',
			icon: DollarSign,
			color: 'blue',
			inputType: 'text',
			inputLabel: 'Revolut @tag',
			inputPlaceholder: '@yourusername'
		},
		{
			id: 'paypal',
			name: 'PayPal',
			description: 'Secure payments worldwide',
			icon: Wallet,
			color: 'indigo',
			inputType: 'text',
			inputLabel: 'PayPal @tag',
			inputPlaceholder: '@yourusername'
		},
		{
			id: 'stripe',
			name: 'Credit/Debit Card',
			description: 'Visa, Mastercard, American Express',
			icon: CreditCard,
			color: 'green',
			inputType: 'none',
			inputLabel: 'Card will be added later via secure Stripe integration'
		}
	];

	function toggleMethod(methodId: string) {
		if (selectedMethods.includes(methodId)) {
			selectedMethods = selectedMethods.filter(id => id !== methodId);
			// Clear data when deselecting
			if (methodId === 'revolut') revolut_tag = '';
			if (methodId === 'paypal') paypal_tag = '';
		} else {
			selectedMethods = [...selectedMethods, methodId];
		}
	}

	async function savePaymentAccounts() {
		if (selectedMethods.length === 0 || !supabase || !$user) return;

		loading = true;
		try {
			// Save Revolut account
			if (selectedMethods.includes('revolut') && revolut_tag) {
				const { error } = await supabase
					.from('payment_accounts')
					.insert({
						user_id: $user.id,
						provider: 'revolut',
						account_id: revolut_tag,
						account_status: 'pending',
						account_data: { tag: revolut_tag }
					});
				
				if (error) throw error;
			}

			// Save PayPal account
			if (selectedMethods.includes('paypal') && paypal_tag) {
				const { error } = await supabase
					.from('payment_accounts')
					.insert({
						user_id: $user.id,
						provider: 'paypal',
						account_id: paypal_tag,
						account_status: 'pending',
						account_data: { tag: paypal_tag }
					});
				
				if (error) throw error;
			}

			// Note: Stripe will be set up later via their secure integration
			toast.success('Payment methods saved successfully!');
		} catch (error) {
			console.error('Error saving payment methods:', error);
			toast.error(`Failed to save payment methods: ${error.message || 'Unknown error'}`);
		} finally {
			loading = false;
		}
	}

	// Validate payment methods before proceeding
	function validatePaymentMethods() {
		if (selectedMethods.length === 0) {
			toast.error('Please select at least one payment method');
			return false;
		}
		
		if (selectedMethods.includes('revolut') && !revolut_tag) {
			toast.error('Please enter your Revolut @tag');
			return false;
		}
		
		if (selectedMethods.includes('paypal') && !paypal_tag) {
			toast.error('Please enter your PayPal @tag');
			return false;
		}
		
		return true;
	}

	// Auto-save when valid data changes
	$effect(() => {
		if (selectedMethods.length > 0 && validatePaymentMethods()) {
			savePaymentAccounts().catch(error => {
				console.error('Payment save failed:', error);
				toast.error(`Failed to save payment methods: ${error.message}`);
			});
		}
	});
</script>

<div class="space-y-6">
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-gray-900 mb-3">Set Up Payment Methods</h2>
		<p class="text-lg text-gray-600 max-w-2xl mx-auto">
			<span class="text-red-600 font-semibold">Required:</span> Add your payment methods to buy and sell fashion items securely.
		</p>
	</div>

	<!-- Info Card -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
		<div class="flex gap-3">
			<Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
			<div class="text-sm">
				<p class="font-medium text-blue-900 mb-1">Why do we need payment methods?</p>
				<p class="text-blue-700">
					Payment methods are required for buying and selling on Driplo. For sellers, we need to know how to pay you. 
					For buyers, we need secure payment options. All payment data is encrypted and secure.
				</p>
			</div>
		</div>
	</div>

	<!-- Payment Method Selection -->
	<div class="space-y-4">
		{#each paymentMethods as method}
			{@const isSelected = selectedMethods.includes(method.id)}
			<div class="border-2 rounded-xl transition-all duration-300 {isSelected 
				? `border-${method.color}-500 bg-${method.color}-50` 
				: 'border-gray-200 hover:border-gray-300 bg-white'}">
				
				<button
					onclick={() => toggleMethod(method.id)}
					class="w-full p-6 text-left flex items-start gap-4"
				>
					<div class="p-3 rounded-lg {isSelected ? `bg-${method.color}-100` : 'bg-gray-100'} 
						transition-colors duration-200">
						<svelte:component 
							this={method.icon} 
							class="w-6 h-6 {isSelected ? `text-${method.color}-600` : 'text-gray-600'}"
						/>
					</div>
					
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-1">
							<h3 class="text-xl font-semibold text-gray-900">{method.name}</h3>
							{#if isSelected}
								<CheckCircle2 class="w-5 h-5 text-{method.color}-600" />
							{/if}
						</div>
						<p class="text-gray-600">{method.description}</p>
					</div>
				</button>

				{#if isSelected && method.inputType !== 'none'}
					<div class="px-6 pb-6">
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{method.inputLabel}
						</label>
						{#if method.id === 'revolut'}
							<input
								type="text"
								bind:value={revolut_tag}
								placeholder={method.inputPlaceholder}
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-{method.color}-500 focus:border-transparent"
								required
							/>
						{:else if method.id === 'paypal'}
							<input
								type="text"
								bind:value={paypal_tag}
								placeholder={method.inputPlaceholder}
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-{method.color}-500 focus:border-transparent"
								required
							/>
						{/if}
					</div>
				{:else if isSelected && method.id === 'stripe'}
					<div class="px-6 pb-6">
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<p class="text-sm text-green-700">
								✅ Credit card setup will be completed securely via Stripe during your first purchase or sale.
							</p>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if selectedMethods.length === 0}
		<div class="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
			<p class="text-sm text-red-700 font-medium">⚠️ You must select at least one payment method to use Driplo</p>
			<p class="text-xs text-red-600 mt-1">Payment methods are required for all transactions</p>
		</div>
	{/if}
</div>