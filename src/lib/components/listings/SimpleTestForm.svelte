<script>
	import { enhance } from '$app/forms';
	
	let isSubmitting = $state(false);
	let message = $state('');
</script>

<form 
	method="POST" 
	action="?/create"
	use:enhance={() => {
		isSubmitting = true;
		message = 'Submitting...';
		
		return async ({ result }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				message = 'Success!';
			} else if (result.type === 'redirect') {
				message = 'Redirecting...';
			} else {
				message = 'Error: ' + JSON.stringify(result);
			}
		};
	}}
>
	<div class="p-8 max-w-md mx-auto space-y-4">
		<h1 class="text-2xl font-bold">Test Listing Form</h1>
		
		{#if message}
			<div class="p-4 bg-blue-100 rounded">
				{message}
			</div>
		{/if}
		
		<!-- Minimal required fields -->
		<input type="hidden" name="title" value="Test Product" />
		<input type="hidden" name="description" value="Test description" />
		<input type="hidden" name="price" value="10" />
		<input type="hidden" name="category_id" value="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />
		<input type="hidden" name="condition" value="new" />
		<input type="hidden" name="shipping_type" value="standard" />
		<input type="hidden" name="location_city" value="Sofia" />
		<input type="hidden" name="imageCount" value="0" />
		
		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
		>
			{isSubmitting ? 'Testing...' : 'Test Submit'}
		</button>
	</div>
</form>