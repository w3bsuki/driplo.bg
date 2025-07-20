<script lang="ts">
	import { enhance } from '$app/forms'
	import { CheckCircle, XCircle, Clock, Building, Shield } from 'lucide-svelte'
	import type { PageData } from './$types'
	
	interface Props {
		data: PageData
	}
	
	let { data }: Props = $props()
	
	let showVerificationForm = $state(false)
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">Brand Settings</h1>
	
	<!-- Brand Verification Status -->
	<div class="bg-white rounded-lg shadow p-6 mb-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold flex items-center gap-2">
				<Shield class="w-6 h-6" />
				Brand Verification
			</h2>
			{#if data.profile?.is_verified}
				<span class="flex items-center gap-2 text-green-600">
					<CheckCircle class="w-5 h-5" />
					Verified
				</span>
			{:else if data.verificationRequest?.status === 'pending'}
				<span class="flex items-center gap-2 text-yellow-600">
					<Clock class="w-5 h-5" />
					Pending Review
				</span>
			{:else if data.verificationRequest?.status === 'rejected'}
				<span class="flex items-center gap-2 text-red-600">
					<XCircle class="w-5 h-5" />
					Rejected
				</span>
			{:else}
				<span class="text-gray-500">Not Verified</span>
			{/if}
		</div>
		
		{#if data.profile?.is_verified}
			<p class="text-green-700 bg-green-50 p-4 rounded-lg">
				Your brand is verified! You can now access all seller features.
			</p>
		{:else if data.verificationRequest?.status === 'pending'}
			<p class="text-yellow-700 bg-yellow-50 p-4 rounded-lg">
				Your verification request is being reviewed. We'll notify you once it's processed.
			</p>
		{:else if data.verificationRequest?.status === 'rejected'}
			<div class="text-red-700 bg-red-50 p-4 rounded-lg">
				<p class="font-semibold mb-2">Your verification was rejected.</p>
				{#if data.verificationRequest.rejection_reason}
					<p class="text-sm">Reason: {data.verificationRequest.rejection_reason}</p>
				{/if}
				<button
					onclick={() => showVerificationForm = true}
					class="mt-3 text-sm underline hover:no-underline"
				>
					Submit a new request
				</button>
			</div>
		{:else}
			<p class="text-gray-600 mb-4">
				Get your brand verified to access premium features and build trust with customers.
			</p>
			<button
				onclick={() => showVerificationForm = true}
				class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
			>
				Request Verification
			</button>
		{/if}
	</div>
	
	<!-- Brand Information -->
	<div class="bg-white rounded-lg shadow p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
			<Building class="w-6 h-6" />
			Brand Information
		</h2>
		<form method="POST" action="?/updateBrand" use:enhance>
			<div class="space-y-4">
				<div>
					<label for="brand_name" class="block text-sm font-medium text-gray-700 mb-1">
						Brand Name
					</label>
					<input
						type="text"
						id="brand_name"
						name="brand_name"
						value={data.profile?.brand_name || ''}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label for="brand_description" class="block text-sm font-medium text-gray-700 mb-1">
						Brand Description
					</label>
					<textarea
						id="brand_description"
						name="brand_description"
						rows="4"
						value={data.profile?.brand_description || ''}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Tell customers about your brand..."
					></textarea>
				</div>
				
				<div>
					<label for="brand_size" class="block text-sm font-medium text-gray-700 mb-1">
						Business Size
					</label>
					<select
						id="brand_size"
						name="brand_size"
						value={data.profile?.brand_size || 'small'}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="individual">Individual</option>
						<option value="small">Small (1-10 employees)</option>
						<option value="medium">Medium (11-50 employees)</option>
						<option value="large">Large (50+ employees)</option>
					</select>
				</div>
				
				<button
					type="submit"
					class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
				>
					Save Changes
				</button>
			</div>
		</form>
	</div>
</div>

<!-- Verification Form Modal -->
{#if showVerificationForm && !data.profile?.is_verified}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 max-w-md w-full">
			<h2 class="text-xl font-bold mb-4">Request Brand Verification</h2>
			<form method="POST" action="?/requestVerification" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						showVerificationForm = false
					}
				}
			}}>
				<div class="space-y-4">
					<div>
						<label for="business_type" class="block text-sm font-medium text-gray-700 mb-1">
							Business Type
						</label>
						<select
							id="business_type"
							name="business_type"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select type</option>
							<option value="sole_proprietorship">Sole Proprietorship</option>
							<option value="partnership">Partnership</option>
							<option value="llc">LLC</option>
							<option value="corporation">Corporation</option>
							<option value="nonprofit">Non-profit</option>
						</select>
					</div>
					
					<div>
						<label for="registration_number" class="block text-sm font-medium text-gray-700 mb-1">
							Business Registration Number
						</label>
						<input
							type="text"
							id="registration_number"
							name="registration_number"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Optional"
						/>
					</div>
					
					<div>
						<label for="business_description" class="block text-sm font-medium text-gray-700 mb-1">
							Describe Your Business
						</label>
						<textarea
							id="business_description"
							name="business_description"
							rows="4"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="What does your business do? What products do you sell?"
						></textarea>
					</div>
					
					<p class="text-sm text-gray-600">
						Note: You may be asked to provide additional documentation.
					</p>
				</div>
				
				<div class="flex gap-3 justify-end mt-6">
					<button
						type="button"
						onclick={() => showVerificationForm = false}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Submit Request
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}