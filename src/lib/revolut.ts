// Revolut client for future API integration
// Currently using manual payment system

export class RevolutClient {
	// Placeholder for future Revolut Business API integration
	// For now, we're using manual Revolut transfers
	
	constructor() {
		// Manual payment system - no API key needed
	}

	// These methods are placeholders for future API integration
	async createOrder(orderData: any) {
		throw new Error('Revolut API not implemented - using manual payments');
	}

	async getOrder(orderId: string) {
		throw new Error('Revolut API not implemented - using manual payments');
	}

	async createPayment(orderId: string, paymentData: any) {
		throw new Error('Revolut API not implemented - using manual payments');
	}

	async getPayment(paymentId: string) {
		throw new Error('Revolut API not implemented - using manual payments');
	}

	async capturePayment(paymentId: string, amount?: number) {
		throw new Error('Revolut API not implemented - using manual payments');
	}

	async refundPayment(paymentId: string, amount?: number, reason?: string) {
		throw new Error('Revolut API not implemented - using manual payments');
	}
}

export const revolut = new RevolutClient();