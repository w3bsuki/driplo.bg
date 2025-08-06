<script lang="ts">
	import { Shield, Check, Clock, X, AlertCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface VerificationRequest {
		verification_status: string;
		submitted_at: string;
		admin_notes?: string;
	}

	interface Props {
		isVerified: boolean;
		verificationRequest: VerificationRequest | null;
		businessRegistrationNumber: string;
		taxId: string;
		verificationDocuments: File[];
		loading: boolean;
		onSubmitVerification: () => Promise<void>;
		onFileSelect: (event: Event) => void;
	}

	let {
		isVerified,
		verificationRequest,
		businessRegistrationNumber = $bindable(),
		taxId = $bindable(),
		verificationDocuments = $bindable(),
		loading,
		onSubmitVerification,
		onFileSelect
	}: Props = $props();

	function getStatusBadge(status: string) {
		switch (status) {
			case 'pending':
				return { icon: Clock, class: 'bg-yellow-100 text-yellow-700', text: 'Pending Review' };
			case 'approved':
				return { icon: Check, class: 'bg-green-100 text-green-700', text: 'Verified' };
			case 'rejected':
				return { icon: X, class: 'bg-red-100 text-red-700', text: 'Rejected' };
			case 'more_info_needed':
				return { icon: AlertCircle, class: 'bg-orange-100 text-orange-700', text: 'More Info Needed' };
			default:
				return { icon: Clock, class: 'bg-gray-100 text-gray-700', text: status };
		}
	}
</script>

<div class="space-y-6">
	{#if isVerified}
		<div class="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4">
			<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
				<Shield class="w-6 h-6 text-green-600" />
			</div>
			<div>
				<h3 class="font-semibold text-green-900">Your brand is verified!</h3>
				<p class="text-green-700 mt-1">
					You have access to all brand features including the verified badge.
				</p>
			</div>
		</div>
	{:else if verificationRequest}
		{@const status = getStatusBadge(verificationRequest.verification_status)}
		<div class={cn(
			"border rounded-lg p-6 flex items-start gap-4",
			verificationRequest.verification_status === 'pending' && "bg-yellow-50 border-yellow-200",
			verificationRequest.verification_status === 'rejected' && "bg-red-50 border-red-200",
			verificationRequest.verification_status === 'more_info_needed' && "bg-orange-50 border-orange-200"
		)}>
			<div class={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", status.class)}>
				<svelte:component this={status.icon} class="w-6 h-6" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold">{status.text}</h3>
				<p class="text-sm text-gray-600 mt-1">
					Submitted on {new Date(verificationRequest.submitted_at).toLocaleDateString()}
				</p>
				{#if verificationRequest.admin_notes}
					<div class="mt-3 p-3 bg-white rounded border">
						<p class="text-sm font-medium mb-1">Admin Notes:</p>
						<p class="text-sm text-gray-600">{verificationRequest.admin_notes}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	
	{#if !isVerified && (!verificationRequest || verificationRequest.verification_status === 'rejected')}
		<div class="space-y-4">
			<p class="text-gray-600">
				Verify your brand to get a verified badge and access premium features.
			</p>
			
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Business Registration Number
				</label>
				<input
					type="text"
					bind:value={businessRegistrationNumber}
					placeholder="Enter your business registration number"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Tax ID / VAT Number
				</label>
				<input
					type="text"
					bind:value={taxId}
					placeholder="Enter your tax ID"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Supporting Documents
				</label>
				<input
					type="file"
					multiple
					accept=".pdf,.jpg,.jpeg,.png"
					onchange={onFileSelect}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
				/>
				<p class="text-xs text-gray-500 mt-1">
					Upload business registration, tax certificates, or other relevant documents
				</p>
			</div>
			
			<button
				onclick={onSubmitVerification}
				disabled={loading}
				class="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{#if loading}
					<Spinner size="sm" color="white" />
				{:else}
					<Shield class="w-5 h-5" />
					Submit for Verification
				{/if}
			</button>
		</div>
	{/if}
</div>