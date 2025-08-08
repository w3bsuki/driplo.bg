<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { getStripe } from '$lib/stores/stripe';
	import * as m from '$lib/paraglide/messages.js';
	import { logger } from '$lib/utils/logger';
	
	// Sub-components
	import CheckoutModalHeader from './CheckoutModalHeader.svelte';
	import OrderSummary from './OrderSummary.svelte';
	import ShippingAddress from './ShippingAddress.svelte';
	import PaymentMethodSelector from './PaymentMethodSelector.svelte';
	import PaymentForm from './PaymentForm.svelte';
	import CheckoutSecurityNotice from './CheckoutSecurityNotice.svelte';
	import CheckoutSubmitButton from './CheckoutSubmitButton.svelte';
	
	// Error boundaries for checkout flow
	import { PaymentErrorBoundary, FormErrorBoundary } from '$lib/components/error-boundaries';
	import { LoadingSpinner } from '$lib/components/ui';

	import type { Database } from '$lib/database.types';
	
	type Listing = Database['public']['Tables']['listings']['Row'];
	
	interface Props {
		listing: Listing;
		isOpen: boolean;
		onClose: () => void;
	}
	
	interface ShippingAddress {
		name: string;
		address_line1: string;
		address_line2: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	}

	let { listing, isOpen, onClose }: Props = $props();

	// State variables
	let paymentProvider = $state<'stripe' | 'revolut_manual'>('stripe');
	let shippingAddress = $state<ShippingAddress>({
		name: '',
		address_line1: '',
		address_line2: '',
		city: '',
		state: '',
		postal_code: '',
		country: 'BG'
	});

	// Payment processing state
	let elements: any;
	let cardElement: any;
	let isProcessing = $state(false);
	let clientSecret = $state('');
	let isInitializing = $state(false);
	let cardElementMounted = $state(false);
	let revolutOrderId = $state('');
	let manualPaymentData = $state(null);
	let showPaymentInstructions = $state(false);

	let totalAmount = $derived(listing ? listing.price + (listing.shipping_price || 0) : 0);

	// Initialize Stripe when modal opens and Stripe is selected  
	$effect(() => {
		if (isOpen && paymentProvider === 'stripe' && !clientSecret && !isInitializing) {
			logger.debug('🔄 Triggering Stripe initialization...', { isOpen, paymentProvider, clientSecret: !!clientSecret, isInitializing });
			initializeStripePayment();
		}
	});

	async function handleProviderChange(provider: 'stripe' | 'revolut_manual') {
		if (paymentProvider === provider) return;
		paymentProvider = provider;
		
		// Clean up Stripe elements when switching away
		if (provider !== 'stripe' && cardElement) {
			try {
				cardElement.destroy();
				cardElement = null;
				cardElementMounted = false;
			} catch (error) {
				logger.error('Error destroying card element:', error);
			}
		}
		
		// Reset state
		if (provider !== 'stripe') clientSecret = '';
		revolutOrderId = '';
		manualPaymentData = null;
		showPaymentInstructions = false;
	}

	async function initializeStripePayment() {
		if (isInitializing) return;
		
		try {
			isInitializing = true;
			
			const response = await fetch('/api/payment/create-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				toast.error(data.error || m.checkout_failed_initialize());
				return;
			}

			clientSecret = data.data?.client_secret || data.client_secret;
			const stripeInstance = await getStripe();
			if (!stripeInstance) {
				toast.error(m.checkout_failed_load_payment());
				return;
			}

			elements = stripeInstance.elements({
				clientSecret: clientSecret,
				appearance: {
					theme: 'stripe',
					variables: {
						colorPrimary: '#4f9fc5',
						colorBackground: '#ffffff',
						colorText: '#1e293b',
						borderRadius: '6px',
					},
				},
			});

			cardElement = elements.create('card', {
				hidePostalCode: false,
				style: {
					base: {
						fontSize: '16px',
						color: '#1e293b',
						fontFamily: 'system-ui, sans-serif',
						'::placeholder': { color: '#94a3b8' },
					},
				},
			});

			setTimeout(() => {
				const container = document.getElementById('card-element');
				if (container && cardElement) {
					while (container.firstChild) {
						container.removeChild(container.firstChild);
					}
					cardElement.mount('#card-element');
					cardElementMounted = true;
				}
			}, 100);

		} catch (error) {
			logger.error('Payment initialization error:', error);
			toast.error(m.checkout_failed_initialize());
		} finally {
			isInitializing = false;
		}
	}

	async function handleSubmit() {
		if (isProcessing) return;

		if (paymentProvider === 'stripe') {
			await handleStripePayment();
		} else if (paymentProvider === 'revolut_manual') {
			await handleManualRevolutPayment();
		}
	}

	async function handleStripePayment() {
		if (!cardElement || !clientSecret) {
			toast.error('Payment system not ready. Please try again.');
			return;
		}

		isProcessing = true;
		try {
			const stripeInstance = await getStripe();
			if (!stripeInstance) {
				toast.error(m.checkout_payment_processor_unavailable());
				return;
			}

			const { error } = await stripeInstance.confirmCardPayment(clientSecret, {
				payment_method: {
					card: cardElement,
					billing_details: {
						name: shippingAddress.name,
						address: {
							line1: shippingAddress.address_line1,
							line2: shippingAddress.address_line2,
							city: shippingAddress.city,
							state: shippingAddress.state,
							postal_code: shippingAddress.postal_code,
							country: shippingAddress.country,
						},
					},
				},
			});

			if (error) {
				toast.error(error.message || m.checkout_payment_failed());
			} else {
				toast.success(m.checkout_payment_successful());
				onClose();
				window.location.href = '/orders';
			}
		} catch (error) {
			logger.error('Payment error:', error);
			toast.error(m.checkout_payment_failed());
		} finally {
			isProcessing = false;
		}
	}

	async function handleManualRevolutPayment() {
		isProcessing = true;
		try {
			const response = await fetch('/api/payment/revolut/manual-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				toast.error(data.error || m.checkout_failed_create_order());
				return;
			}

			manualPaymentData = data;
			showPaymentInstructions = true;
		} catch (error) {
			logger.error('Manual payment error:', error);
			toast.error(m.checkout_failed_create_order());
		} finally {
			isProcessing = false;
		}
	}

	function handleOpenRevolutPaymentLink() {
		if (!manualPaymentData) return;
		const amount = manualPaymentData.total_amount;
		const reference = manualPaymentData.order_reference;
		const revolutUrl = `https://revolut.me/tin1017?amount=${amount}&reference=${encodeURIComponent(reference)}&currency=USD`;
		window.open(revolutUrl, '_blank');
	}

	async function confirmManualPayment() {
		if (!manualPaymentData) return;
		isProcessing = true;
		try {
			const response = await fetch('/api/payment/revolut/manual-payment', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					transaction_id: manualPaymentData.transaction_id,
					proof_of_payment: 'manual_confirmation',
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				toast.error(data.error || m.checkout_failed_confirm_payment());
				return;
			}

			toast.success(m.checkout_payment_submitted());
			onClose();
			window.location.href = '/orders';
		} catch (error) {
			logger.error('Payment confirmation error:', error);
			toast.error(m.checkout_failed_confirm_payment());
		} finally {
			isProcessing = false;
		}
	}

	function handleClose() {
		if (cardElement) {
			try {
				cardElement.destroy();
				cardElement = null;
				cardElementMounted = false;
			} catch (error) {
				logger.error('Error destroying card element:', error);
			}
		}
		onClose();
	}

</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" transition:scale={{ duration: 200 }}>
			<!-- Header Component -->
			<CheckoutModalHeader onClose={handleClose} />

			<!-- Content -->
			<div class="p-6">
				{#if isInitializing}
					<div class="flex items-center justify-center py-8">
						<LoadingSpinner size="lg" text="Initializing checkout..." textPosition="bottom" />
					</div>
				{:else}
					<!-- Order Summary with error boundary -->
					<FormErrorBoundary>
						<OrderSummary {listing} {manualPaymentData} />
					</FormErrorBoundary>
					
					<!-- Shipping Address with form error handling -->
					<FormErrorBoundary>
						<ShippingAddress bind:shippingAddress />
					</FormErrorBoundary>
					
					<!-- Payment Method Selection with error boundary -->
					<FormErrorBoundary>
						<PaymentMethodSelector
							{paymentProvider}
							onProviderChange={handleProviderChange}
						/>
					</FormErrorBoundary>
					
					<!-- Payment Form with specialized payment error handling -->
					<PaymentErrorBoundary 
						showAlternatives={true}
						onRetry={() => paymentProvider === 'stripe' ? initializeStripePayment() : null}
						onChangePaymentMethod={() => paymentProvider = 'revolut_manual'}
					>
						<PaymentForm
							{paymentProvider}
							{clientSecret}
							{showPaymentInstructions}
							{manualPaymentData}
							{isProcessing}
							onOpenRevolutPaymentLink={handleOpenRevolutPaymentLink}
							onConfirmManualPayment={confirmManualPayment}
						/>
					</PaymentErrorBoundary>

					<!-- Security Notice -->
					<CheckoutSecurityNotice />

					<!-- Submit Button with payment error handling -->
					<PaymentErrorBoundary 
						showAlternatives={false}
						onRetry={handleSubmit}
					>
						<CheckoutSubmitButton
							{paymentProvider}
							{totalAmount}
							{manualPaymentData}
							{isProcessing}
							{showPaymentInstructions}
							onSubmit={handleSubmit}
						/>
					</PaymentErrorBoundary>
				{/if}
			</div>
		</div>
	</div>
{/if}