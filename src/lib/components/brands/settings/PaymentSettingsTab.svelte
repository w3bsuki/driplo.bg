<script lang="ts">
	import { CreditCard, Banknote, Shield } from 'lucide-svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		loading: boolean;
	}

	let { loading }: Props = $props();

	// Placeholder for future implementation
	let payoutMethod = $state('bank_transfer');
	let bankName = $state('');
	let accountNumber = $state('');
	let routingNumber = $state('');
	let paypalEmail = $state('');
</script>

<div class="space-y-6">
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="flex items-start gap-3">
			<Shield class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
			<div>
				<h3 class="font-medium text-blue-900">Payment Settings Coming Soon</h3>
				<p class="text-blue-700 text-sm mt-1">
					Configure your payout methods and payment preferences. This feature is currently under development.
				</p>
			</div>
		</div>
	</div>

	<!-- Preview of future payment settings -->
	<div class="space-y-4 opacity-50 pointer-events-none">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Payout Method
			</label>
			<div class="space-y-2">
				<label class="flex items-center gap-3">
					<input
						type="radio"
						bind:group={payoutMethod}
						value="bank_transfer"
						class="w-4 h-4 text-primary"
					/>
					<div class="flex items-center gap-2">
						<Banknote class="w-4 h-4" />
						Bank Transfer
					</div>
				</label>
				<label class="flex items-center gap-3">
					<input
						type="radio"
						bind:group={payoutMethod}
						value="paypal"
						class="w-4 h-4 text-primary"
					/>
					<div class="flex items-center gap-2">
						<CreditCard class="w-4 h-4" />
						PayPal
					</div>
				</label>
			</div>
		</div>

		{#if payoutMethod === 'bank_transfer'}
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Bank Name
					</label>
					<input
						type="text"
						bind:value={bankName}
						placeholder="Enter bank name"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Account Number
					</label>
					<input
						type="text"
						bind:value={accountNumber}
						placeholder="Enter account number"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
					/>
				</div>
			</div>
		{:else if payoutMethod === 'paypal'}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					PayPal Email
				</label>
				<input
					type="email"
					bind:value={paypalEmail}
					placeholder="Enter PayPal email"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
				/>
			</div>
		{/if}

		<button
			disabled={true}
			class="w-full py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
		>
			Save Payment Settings
		</button>
	</div>
</div>