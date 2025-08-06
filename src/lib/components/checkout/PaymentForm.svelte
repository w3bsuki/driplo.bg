<script lang="ts">
	import { Lock, Check, ExternalLink } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		paymentProvider: 'stripe' | 'revolut_manual';
		clientSecret: string;
		showPaymentInstructions: boolean;
		manualPaymentData: any;
		isProcessing: boolean;
		onOpenRevolutPaymentLink: () => void;
		onConfirmManualPayment: () => void;
	}

	let { 
		paymentProvider, 
		clientSecret, 
		showPaymentInstructions, 
		manualPaymentData, 
		isProcessing,
		onOpenRevolutPaymentLink,
		onConfirmManualPayment
	}: Props = $props();
</script>

<!-- Payment Provider Content -->
{#if paymentProvider === 'stripe'}
	<!-- Stripe Card Payment Form -->
	<div class="border border-gray-200 rounded-lg p-4">
		<div id="card-element" class="p-3 border border-gray-300 rounded-md min-h-[50px]"></div>
		{#if clientSecret}
			<p class="text-sm text-green-600 mt-2 flex items-center gap-2">
				<Lock class="w-4 h-4" />
				{m.checkout_secure_payment()}
			</p>
		{/if}
	</div>
{:else if paymentProvider === 'revolut_manual'}
	{#if !showPaymentInstructions}
		<div class="border border-gray-300 rounded-lg p-4">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-lg">R</span>
				</div>
				<div>
					<h4 class="font-semibold text-gray-900">{m.checkout_revolut_transfer()}</h4>
					<p class="text-sm text-gray-600">{m.checkout_revolut_direct_transfer()}</p>
				</div>
			</div>
			<div class="bg-green-50 border border-green-200 rounded-lg p-3">
				<p class="text-sm text-green-700">
					{m.checkout_revolut_benefits()}
				</p>
			</div>
		</div>
	{:else}
		<!-- Payment Instructions -->
		<div class="border border-green-300 rounded-lg p-4 bg-green-50">
			<h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
				<div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-sm">R</span>
				</div>
				{m.checkout_revolut_instructions()}
			</h4>
			
			<div class="space-y-3 mb-4">
				<div class="bg-white rounded-lg p-3 border border-green-200">
					<p class="text-sm font-medium text-gray-700 mb-2">{m.checkout_send_exact_amount()}</p>
					<p class="text-2xl font-bold text-green-600">${manualPaymentData?.total_amount}</p>
				</div>
				
				<div class="bg-white rounded-lg p-3 border border-green-200">
					<p class="text-sm font-medium text-gray-700 mb-2">{m.checkout_to_driplo_account()}</p>
					<div class="space-y-1">
						<p class="font-mono text-sm"><strong>{m.checkout_revtag()}</strong> {manualPaymentData?.payment_instructions?.recipient_revtag}</p>
						<p class="font-mono text-sm"><strong>{m.checkout_phone()}</strong> {manualPaymentData?.payment_instructions?.recipient_phone}</p>
						<p class="font-mono text-sm"><strong>{m.checkout_name()}</strong> {manualPaymentData?.payment_instructions?.recipient_name}</p>
						<div class="flex items-center gap-1 text-blue-600 mt-2">
							<Check class="w-4 h-4" />
							<span class="text-sm font-medium">{m.checkout_driplo_platform()}</span>
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg p-3 border border-green-200">
					<p class="text-sm font-medium text-gray-700 mb-2">{m.checkout_include_reference()}</p>
					<p class="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
						{manualPaymentData?.order_reference}
					</p>
				</div>
			</div>
			
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
				<p class="text-sm text-blue-800">
					{m.checkout_buyer_protection()}
				</p>
			</div>
			
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
				<p class="text-sm text-yellow-800">
					{m.checkout_important_reference()}
				</p>
			</div>
			
			<!-- Quick Pay Button -->
			<div class="mb-4">
				<button
					onclick={onOpenRevolutPaymentLink}
					class="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
				>
					<div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
						<span class="text-black font-bold text-sm">R</span>
					</div>
					{m.checkout_pay_with_revolut({ amount: `$${manualPaymentData?.total_amount}` })}
					<ExternalLink class="w-4 h-4" />
				</button>
				<p class="text-xs text-gray-500 text-center mt-2">
					{m.checkout_revolut_prefilled()}
				</p>
			</div>
			
			<div class="relative mb-4">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">{m.checkout_or_pay_manually()}</span>
				</div>
			</div>
			
			<button
				onclick={onConfirmManualPayment}
				disabled={isProcessing}
				class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
			>
				{isProcessing ? m.checkout_confirming() : m.checkout_payment_sent()}
			</button>
		</div>
	{/if}
{/if}