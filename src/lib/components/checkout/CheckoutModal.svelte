<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { X, Lock } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { getStripe } from '$lib/stores/stripe';
	import * as m from '$lib/paraglide/messages.js';
	import { logger } from '$lib/utils/logger';
	import OrderSummary from './OrderSummary.svelte';
	import ShippingAddress from './ShippingAddress.svelte';
	import PaymentMethodSelector from './PaymentMethodSelector.svelte';
	import PaymentForm from './PaymentForm.svelte';
	
	// Error boundaries for checkout flow
	import { PaymentErrorBoundary, FormErrorBoundary } from '$lib/components/error-boundaries';
	import { CheckoutSkeleton } from '$lib/components/skeletons';
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

	// TODO: Add proper Stripe types once Stripe SDK is properly typed
	let elements: any;
	let cardElement: any;
	let isProcessing = $state(false);
	let clientSecret = $state('');
	let paymentProvider = $state<'stripe' | 'revolut_manual'>('stripe'); // Default to Stripe
	let isInitializing = $state(false);
	let cardElementMounted = $state(false);
	let revolutOrderId = $state('');
	let manualPaymentData = $state(null);
	let showPaymentInstructions = $state(false);
	let shippingAddress = $state<ShippingAddress>({
		name: '',
		address_line1: '',
		address_line2: '',
		city: '',
		state: '',
		postal_code: '',
		country: 'BG'
	});

	let totalAmount = $derived(listing ? listing.price + (listing.shipping_price || 0) : 0);

	// Initialize Stripe when modal opens and Stripe is selected  
	$effect(() => {
		if (isOpen && paymentProvider === 'stripe' && !clientSecret && !isInitializing) {
			logger.debug('🔄 Triggering Stripe initialization...', { isOpen, paymentProvider, clientSecret: !!clientSecret, isInitializing });
			initializeStripePayment();
		}
	});

	// Remove the complex mounting effect - it's causing issues

	async function handleProviderChange(provider: 'stripe' | 'revolut_manual') {
		// Don't reset state if switching to the same provider
		if (paymentProvider === provider) return;
		
		paymentProvider = provider;
		
		// Only reset clientSecret if switching away from Stripe
		if (provider !== 'stripe') {
			clientSecret = '';
		}
		
		revolutOrderId = '';
		manualPaymentData = null;
		showPaymentInstructions = false;
		
		// Clean up existing Stripe elements only if switching away from Stripe
		if (provider !== 'stripe' && cardElement) {
			try {
				logger.debug('🧹 Destroying existing card element...');
				cardElement.destroy();
				logger.debug('✅ Card element destroyed successfully');
			} catch (error) {
				logger.error('❌ Error destroying card element:', error);
			}
			cardElement = null;
			cardElementMounted = false;
		}
		if (provider !== 'stripe' && elements) {
			elements = null;
		}
		
		// Clear the card element container only if switching away from Stripe
		if (provider !== 'stripe') {
			const element = document.getElementById('card-element');
			if (element) {
				// Safely clear the element content
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}
		}
		
		// Don't manually initialize here - let the effect handle it
	}

	async function initializeStripePayment() {
		if (isInitializing) return;
		
		try {
			isInitializing = true;
			logger.debug('🔄 Initializing Stripe payment...');
			
			// Create payment intent
			const response = await fetch('/api/payment/create-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				logger.error('❌ Payment intent failed:', data);
				toast.error(data.error || m.checkout_failed_initialize());
				return;
			}

			clientSecret = data.data?.client_secret || data.client_secret;
			logger.debug('✅ Payment intent created successfully', { clientSecret, fullResponse: data });

			// Initialize Stripe Elements
			const stripeInstance = await getStripe();
			if (!stripeInstance) {
				logger.error('❌ Failed to load Stripe instance');
				toast.error(m.checkout_failed_load_payment());
				return;
			}

			logger.debug('✅ Stripe instance loaded successfully');

			elements = stripeInstance.elements({
				clientSecret: clientSecret,
				appearance: {
					theme: 'stripe',
					variables: {
						colorPrimary: '#4f9fc5', // brand-700
						colorBackground: '#ffffff', // white
						colorText: '#1e293b', // gray-800
						borderRadius: '6px', // radius-md
					},
				},
			});

			logger.debug('✅ Stripe Elements created successfully');

			// Create card element
			cardElement = elements.create('card', {
				hidePostalCode: false,
				style: {
					base: {
						fontSize: '16px',
						color: '#1e293b', // gray-800
						fontFamily: 'system-ui, sans-serif',
						'::placeholder': {
							color: '#94a3b8', // gray-400
						},
					},
				},
			});

			logger.debug('✅ Card element created successfully');
			
			// Add event listeners for better debugging
			cardElement.on('ready', () => {
				logger.debug('✅ Card element ready for input');
			});

			cardElement.on('change', (event) => {
				if (event.error) {
					logger.warn('⚠️ Card element error:', event.error.message);
				} else {
					logger.debug('✅ Card element input valid');
				}
			});

			// Mount immediately - simple and direct
			setTimeout(() => {
				const container = document.getElementById('card-element');
				if (container && cardElement) {
					// Safely clear the container content
					while (container.firstChild) {
						container.removeChild(container.firstChild);
					}
					cardElement.mount('#card-element');
					cardElementMounted = true;
					logger.debug('✅ Card element mounted successfully');
				}
			}, 100);

		} catch (error) {
			logger.error('❌ Payment initialization error:', error);
			toast.error(m.checkout_failed_initialize());
		} finally {
			isInitializing = false;
		}
	}

	async function handleSubmit() {
		if (isProcessing) return;

		if (paymentProvider === 'stripe') {
			await handleStripePayment();
		} else if (paymentProvider === 'revolut') {
			await handleRevolutPayment();
		} else if (paymentProvider === 'revolut_manual') {
			await handleManualRevolutPayment();
		}
	}

	async function handleStripePayment() {
		if (!cardElement || !clientSecret) {
			logger.error('❌ Missing required elements:', { cardElement: !!cardElement, clientSecret: !!clientSecret });
			toast.error('Payment system not ready. Please try again.');
			return;
		}

		// Verify card element is still mounted
		const cardContainer = document.getElementById('card-element');
		if (!cardContainer || !cardContainer.querySelector('iframe')) {
			logger.error('❌ Card element not properly mounted');
			toast.error('Payment form not ready. Please refresh and try again.');
			cardElementMounted = false;
			return;
		}

		isProcessing = true;

		try {
			const stripeInstance = await getStripe();
			if (!stripeInstance) {
				toast.error(m.checkout_payment_processor_unavailable());
				return;
			}

			logger.debug('🔄 Confirming payment with Stripe...');
			// Confirm payment
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

	async function handleRevolutPayment() {
		isProcessing = true;

		try {
			// Create Revolut order if not already created
			if (!revolutOrderId) {
				const orderResponse = await fetch('/api/payment/revolut/create-order', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'same-origin',
					body: JSON.stringify({
						listing_id: listing.id,
						shipping_address: shippingAddress,
					}),
				});

				const orderData = await orderResponse.json();

				if (!orderResponse.ok) {
					toast.error(orderData.error || m.checkout_failed_create_order());
					return;
				}

				revolutOrderId = orderData.order_id;
			}

			// Process payment with Revolut
			const paymentResponse = await fetch('/api/payment/revolut/process-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					order_id: revolutOrderId,
					payment_method: {
						type: 'revolut_pay',
						revolut_pay: {
							email: shippingAddress.name, // You might want to collect email separately
						},
					},
					billing_address: {
						country_code: shippingAddress.country,
						region: shippingAddress.state,
						city: shippingAddress.city,
						postcode: shippingAddress.postal_code,
						street_line_1: shippingAddress.address_line1,
						street_line_2: shippingAddress.address_line2,
					},
				}),
			});

			const paymentData = await paymentResponse.json();

			if (!paymentResponse.ok) {
				toast.error(paymentData.error || m.checkout_payment_failed());
				return;
			}

			// Redirect to Revolut Pay if redirect URL is provided
			if (paymentData.redirect_url) {
				window.location.href = paymentData.redirect_url;
			} else {
				toast.success(m.checkout_payment_successful());
				onClose();
				window.location.href = '/orders';
			}
		} catch (error) {
			logger.error('Revolut payment error:', error);
			toast.error(m.checkout_payment_failed());
		} finally {
			isProcessing = false;
		}
	}

	async function handleManualRevolutPayment() {
		isProcessing = true;
		logger.debug('🔥 Starting manual Revolut payment for listing:', listing.id);

		try {
			const response = await fetch('/api/payment/revolut/manual-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress,
				}),
			});

			logger.debug('📡 Response status:', response.status);
			const data = await response.json();
			logger.debug('📋 Response data:', data);

			if (!response.ok) {
				logger.error('❌ API Error:', data);
				toast.error(data.error || m.checkout_failed_create_order());
				return;
			}

			logger.debug('✅ Payment order created successfully');
			manualPaymentData = data;
			showPaymentInstructions = true;
			logger.debug('🎯 UI state updated - showPaymentInstructions:', showPaymentInstructions);
			
		} catch (error) {
			logger.error('💥 Manual Revolut payment error:', error);
			toast.error(m.checkout_failed_create_order());
		} finally {
			isProcessing = false;
		}
	}

	function handleOpenRevolutPaymentLink() {
		if (!manualPaymentData) return;
		
		// Create Revolut payment link with pre-filled amount and reference
		const amount = manualPaymentData.total_amount;
		const reference = manualPaymentData.order_reference;
		const revolutUrl = `https://revolut.me/tin1017?amount=${amount}&reference=${encodeURIComponent(reference)}&currency=USD`;
		
		logger.debug('🔗 Opening Revolut payment link:', revolutUrl);
		
		// Open in new tab so user doesn't lose checkout page
		window.open(revolutUrl, '_blank');
	}

	async function confirmManualPayment() {
		if (!manualPaymentData) return;

		isProcessing = true;

		try {
			const response = await fetch('/api/payment/revolut/manual-payment', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					transaction_id: manualPaymentData.transaction_id,
					proof_of_payment: 'manual_confirmation', // In a real app, you'd collect screenshot/receipt
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
		onClose();
		clientSecret = '';
		if (cardElement) {
			try {
				logger.debug('🧹 Cleaning up card element on close...');
				cardElement.destroy();
				logger.debug('✅ Card element destroyed successfully on close');
			} catch (error) {
				logger.error('❌ Error destroying card element on close:', error);
			}
			cardElement = null;
			cardElementMounted = false;
		}
		if (elements) {
			elements = null;
		}
		
		// Clear the card element container
		const element = document.getElementById('card-element');
		if (element) {
			// Safely clear the element content
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" transition:scale={{ duration: 200 }}>
			<!-- Header -->
			<div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-900">{m.checkout_title()}</h2>
				<button
					onclick={handleClose}
					class="p-2 hover:bg-gray-100 rounded-full transition-colors"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>

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
					<div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
						<div class="flex items-center gap-2 text-green-700">
							<Lock class="w-5 h-5" />
							<span class="text-sm font-medium">{m.checkout_payment_secure()}</span>
						</div>
					</div>

					<!-- Submit Button with payment error handling -->
					{#if !showPaymentInstructions}
						<PaymentErrorBoundary 
							showAlternatives={false}
							onRetry={handleSubmit}
						>
							<button
								onclick={handleSubmit}
								disabled={isProcessing}
								class="w-full bg-blue-400 text-white py-4 rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{#if isProcessing}
									<div class="flex items-center justify-center gap-2">
										<LoadingSpinner size="sm" variant="white" />
										{m.checkout_processing()}
									</div>
								{:else if paymentProvider === 'stripe'}
									{m.checkout_pay_now({ amount: formatCurrency(totalAmount) })}
								{:else}
									{m.checkout_get_revolut_instructions({ amount: formatCurrency(manualPaymentData?.total_amount || totalAmount) })}
								{/if}
							</button>
						</PaymentErrorBoundary>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}