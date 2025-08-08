<script lang="ts">
	import { Lock } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<!-- Security Notice -->
<div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
	<div class="flex items-center gap-2 text-green-700">
		<Lock class="w-5 h-5" />
		<span class="text-sm font-medium">{m.checkout_payment_secure()}</span>
	</div>
</div>