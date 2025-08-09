<script lang="ts">
	import PaymentAccountSetup from '$lib/components/payment/PaymentAccountSetup.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	
	function handleSuccess() {
		// Redirect back to sell page after successful setup
		const redirect = page.url.searchParams.get('redirect') || '/sell';
		goto(redirect);
	}
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<PaymentAccountSetup onsuccess={handleSuccess} />
	</div>
</div>