<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { fade, scale } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { getStripe } from '$lib/stores/stripe';
	import * as m from '$lib/paraglide/messages.js';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { logger } from '$lib/utils/logger';

	// Import our new focused components
	import CheckoutHeader from './CheckoutHeader.svelte';
	import OrderSummaryStep from './OrderSummaryStep.svelte';
	import PaymentStep from './PaymentStep.svelte';
	import CompletionStep from './CompletionStep.svelte';
	import CheckoutFooter from './CheckoutFooter.svelte';

	import type { Database } from '$lib/database.types';
	
	type Listing = Database['public']['Tables']['listings']['Row'];
	type Order = Database['public']['Tables']['orders']['Row'];
	
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

	// Multi-step state
	let currentStep = $state(1); // 1: Order Summary, 2: Payment, 3: Completion
	let isProcessing = $state(false);
	
	// TODO: Add proper Stripe types once Stripe SDK is properly typed
	let elements: any;
	let cardElement: any;
	let clientSecret = $state('');
	
	// Form data
	let shippingAddress = $state<ShippingAddress>({
		name: '',
		address_line1: '',
		address_line2: '',
		city: '',
		state: '',
		postal_code: '',
		country: 'BG'
	});
	
	let paymentProvider = $state<'stripe' | 'revolut_manual'>('stripe');
	let orderData = $state<Order | null>(null);
	
	// Calculated values
	let itemPrice = $derived(listing?.price || 0);
	let shippingCost = $derived(listing?.shipping_price || 0);
	let buyerFee = $derived(itemPrice * 0.05 + 1); // 5% + $1
	let totalAmount = $derived(itemPrice + shippingCost + buyerFee);

	// Handler functions for child components
	function handleShippingAddressChange(field: keyof typeof shippingAddress, value: string) {
		shippingAddress[field] = value;
	}

	function handlePaymentProviderChange(provider: 'stripe' | 'revolut_manual') {
		paymentProvider = provider;
	}
	
	// Navigation functions
	function goToStep(step: number) {
		currentStep = step;
	}
	
	function handleNextStep() {
		if (currentStep === 1 && validateShipping()) {
			goToStep(2);
			initializePayment();
		} else if (currentStep === 2) {
			processPayment();
		}
	}
	
	function handlePreviousStep() {
		if (currentStep > 1) {
			goToStep(currentStep - 1);
		}
	}
	
	function validateShipping() {
		if (!shippingAddress.name.trim()) {
			toast.error('Please enter your full name');
			return false;
		}
		if (!shippingAddress.address_line1.trim()) {
			toast.error('Please enter your address');
			return false;
		}
		if (!shippingAddress.city.trim()) {
			toast.error('Please enter your city');
			return false;
		}
		if (!shippingAddress.postal_code.trim()) {
			toast.error('Please enter your postal code');
			return false;
		}
		return true;
	}
	
	async function initializePayment() {
		if (paymentProvider === 'stripe') {
			await initializeStripePayment();
		}
	}
	
	async function initializeStripePayment() {
		try {
			isProcessing = true;
			
			const response = await fetch('/api/payment/create-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress
				})
			});
			
			let result;
			try {
				result = await response.json();
			} catch (e) {
				logger.error('Failed to parse checkout response', { error: e });
				throw new Error('Server error - invalid response');
			}
			
			if (!response.ok) {
				logger.error('Payment initialization failed', { result });
				throw new Error(result.error || result.message || 'Failed to initialize payment');
			}
			
			clientSecret = result.data.client_secret;
			
			// Initialize Stripe Elements
			const stripe = await getStripe();
			if (!stripe) throw new Error('Stripe not loaded');
			
			elements = stripe.elements({ clientSecret });
			
			// Wait for next tick
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Create and mount card element
			const cardElementContainer = document.getElementById('card-element-new');
			if (cardElementContainer) {
				cardElement = elements.create('card', {
					style: {
						base: {
							fontSize: '16px',
							color: '#475569', // gray-600
							'::placeholder': { color: '#94a3b8' } // gray-400
						}
					}
				});
				cardElement.mount(cardElementContainer);
			}
		} catch (error) {
			logger.error('Payment initialization error', { error });
			toast.error('Failed to initialize payment');
			goToStep(1);
		} finally {
			isProcessing = false;
		}
	}
	
	async function processPayment() {
		if (paymentProvider === 'stripe') {
			await processStripePayment();
		} else {
			await processManualPayment();
		}
	}
	
	async function processStripePayment() {
		if (!cardElement || !clientSecret) return;
		
		try {
			isProcessing = true;
			const stripe = await getStripe();
			if (!stripe) throw new Error('Stripe not loaded');
			
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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
							country: shippingAddress.country
						}
					}
				}
			});
			
			if (error) {
				throw error;
			}
			
			// Payment successful
			orderData = {
				orderId: paymentIntent.id,
				amount: totalAmount,
				paymentMethod: 'card'
			};
			
			goToStep(3);
			toast.success('Payment successful!');
			
			// Redirect after delay
			setTimeout(() => {
				window.location.href = '/orders';
			}, 3000);
			
		} catch (error: any) {
			logger.error('Payment processing failed', { error });
			toast.error(error.message || 'Payment failed');
		} finally {
			isProcessing = false;
		}
	}
	
	async function processManualPayment() {
		try {
			isProcessing = true;
			
			const response = await fetch('/api/payment/revolut/manual-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					listing_id: listing.id,
					shipping_address: shippingAddress
				})
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to create order');
			}
			
			orderData = {
				orderId: data.order_id,
				amount: data.total_amount,
				paymentMethod: 'revolut_manual',
				paymentInstructions: data.payment_instructions
			};
			
			goToStep(3);
			
		} catch (error: any) {
			logger.error('Manual payment processing failed', { error });
			toast.error(error.message || 'Failed to create order');
		} finally {
			isProcessing = false;
		}
	}
	
	function handleClose() {
		// Cleanup
		if (cardElement) {
			cardElement.destroy();
			cardElement = null;
		}
		if (elements) {
			elements = null;
		}
		clientSecret = '';
		currentStep = 1;
		onClose();
	}
	
	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (cardElement) {
				cardElement.destroy();
			}
		};
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" transition:scale={{ duration: 200 }}>
			<CheckoutHeader {currentStep} onClose={handleClose} />

			<!-- Content -->
			<div class="overflow-y-auto relative" style="max-height: calc(90vh - 200px);">
				{#if isProcessing}
					<Spinner overlay text="Processing payment..." />
				{/if}
				
				{#if currentStep === 1}
					<OrderSummaryStep 
						{listing}
						{shippingAddress}
						{itemPrice}
						{shippingCost}
						{buyerFee}
						{totalAmount}
						onShippingAddressChange={handleShippingAddressChange}
					/>
				{:else if currentStep === 2}
					<PaymentStep 
						{listing}
						{totalAmount}
						{paymentProvider}
						onPaymentProviderChange={handlePaymentProviderChange}
					/>
				{:else}
					<CompletionStep {orderData} />
				{/if}
			</div>

			<CheckoutFooter 
				{currentStep}
				{isProcessing}
				{totalAmount}
				onPreviousStep={handlePreviousStep}
				onNextStep={handleNextStep}
			/>
		</div>
	</div>
{/if}