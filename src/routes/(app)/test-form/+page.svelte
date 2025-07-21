<script>
	import { enhance } from '$app/forms'
	
	let formResult = $state('')
</script>

<div class="max-w-lg mx-auto p-6">
	<h1 class="text-2xl font-bold mb-6">Form Submission Test</h1>
	
	<p class="mb-4 text-gray-600">
		This is a simple test to verify that form submission and enhance are working correctly.
	</p>
	
	{#if formResult}
		<div class="mb-4 p-4 bg-green-100 text-green-800 rounded">
			<strong>Success!</strong> Form submitted successfully.
			<pre class="mt-2 text-sm">{formResult}</pre>
		</div>
	{/if}
	
	<form 
		method="POST" 
		action="?/testSubmit"
		use:enhance={() => {
			console.log('Form enhance triggered')
			return async ({ result }) => {
				console.log('Form result:', result)
				if (result.type === 'success' && result.data) {
					formResult = JSON.stringify(result.data, null, 2)
				}
			}
		}}
		class="space-y-4"
	>
		<div>
			<label for="test-field" class="block text-sm font-medium mb-2">Test Field</label>
			<input 
				id="test-field"
				name="testField" 
				type="text" 
				value="Test Value"
				class="w-full px-3 py-2 border rounded"
			/>
		</div>
		
		<button 
			type="submit"
			class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			onclick={() => console.log('Submit button clicked')}
		>
			Submit Test Form
		</button>
	</form>
	
	<div class="mt-8 p-4 bg-gray-100 rounded">
		<h2 class="font-semibold mb-2">Debug Instructions:</h2>
		<ol class="list-decimal list-inside space-y-1 text-sm">
			<li>Open browser console (F12)</li>
			<li>Click the submit button</li>
			<li>Check for "Submit button clicked" message</li>
			<li>Check for "Form enhance triggered" message</li>
			<li>Check Network tab for POST request</li>
			<li>If successful, you'll see the green success message</li>
		</ol>
	</div>
</div>