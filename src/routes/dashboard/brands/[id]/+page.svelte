<script lang="ts">
	import { goto } from '$app/navigation';
	import { 
		Building2, 
		User, 
		Calendar, 
		Globe, 
		Instagram, 
		Link2,
		CheckCircle,
		XCircle,
		AlertCircle,
		ArrowLeft,
		ExternalLink,
		FileText,
		Shield
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { supabase } from '$lib/supabase';
	import type { PageData } from './$types';

	interface Props {
		data: PageData
	}

	let { data }: Props = $props();

	let loading = $state(false);
	let adminNotes = $state('');
	let requestMoreInfo = $state(false);
	let infoMessage = $state('');

	const socialPlatformIcons = {
		instagram: Instagram,
		website: Globe,
		facebook: Globe,
		tiktok: Link2,
		twitter: Link2,
		youtube: Link2,
		pinterest: Link2
	};

	async function handleApprove() {
		loading = true;
		try {
			// Update brand verification request
			const { error: updateError } = await supabase
				.from('brand_verification_requests')
				.update({
					verification_status: 'approved',
					admin_notes: adminNotes,
					reviewed_by: data.user.id,
					reviewed_at: new Date().toISOString()
				})
				.eq('id', data.request.id);

			if (updateError) throw updateError;

			// Update profile to verified brand
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					is_verified: true,
					account_type: 'brand',
					brand_name: data.request.brand_name,
					brand_category: data.request.brand_category
				})
				.eq('id', data.request.user_id);

			if (profileError) throw profileError;

			// Create admin approval record
			const { error: approvalError } = await supabase
				.from('admin_approvals')
				.insert({
					request_type: 'brand_verification',
					request_id: data.request.id,
					admin_id: data.user.id,
					action: 'approve',
					notes: adminNotes
				});

			if (approvalError) throw approvalError;

			toast.success('Brand approved successfully!');
			goto('/admin/brands');
		} catch (error: any) {
			toast.error(error.message || 'Failed to approve brand');
		} finally {
			loading = false;
		}
	}

	async function handleReject() {
		if (!adminNotes.trim()) {
			toast.error('Please provide a reason for rejection');
			return;
		}

		loading = true;
		try {
			// Update brand verification request
			const { error: updateError } = await supabase
				.from('brand_verification_requests')
				.update({
					verification_status: 'rejected',
					admin_notes: adminNotes,
					reviewed_by: data.user.id,
					reviewed_at: new Date().toISOString()
				})
				.eq('id', data.request.id);

			if (updateError) throw updateError;

			// Create admin approval record
			const { error: approvalError } = await supabase
				.from('admin_approvals')
				.insert({
					request_type: 'brand_verification',
					request_id: data.request.id,
					admin_id: data.user.id,
					action: 'reject',
					notes: adminNotes
				});

			if (approvalError) throw approvalError;

			toast.success('Brand rejected');
			goto('/admin/brands');
		} catch (error: any) {
			toast.error(error.message || 'Failed to reject brand');
		} finally {
			loading = false;
		}
	}

	async function handleRequestInfo() {
		if (!infoMessage.trim()) {
			toast.error('Please specify what information is needed');
			return;
		}

		loading = true;
		try {
			// Update status to more_info_needed
			const { error: updateError } = await supabase
				.from('brand_verification_requests')
				.update({
					verification_status: 'more_info_needed',
					admin_notes: infoMessage,
					reviewed_by: data.user.id,
					reviewed_at: new Date().toISOString()
				})
				.eq('id', data.request.id);

			if (updateError) throw updateError;

			// Create admin approval record
			const { error: approvalError } = await supabase
				.from('admin_approvals')
				.insert({
					request_type: 'brand_verification',
					request_id: data.request.id,
					admin_id: data.user.id,
					action: 'request_info',
					notes: infoMessage
				});

			if (approvalError) throw approvalError;

			toast.success('Information request sent');
			goto('/admin/brands');
		} catch (error: any) {
			toast.error(error.message || 'Failed to request information');
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Back Button -->
	<a 
		href="/dashboard/brands"
		class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Brand Requests
	</a>

	<!-- Page Header -->
	<div class="bg-white rounded-lg shadow-sm p-6">
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 mb-2">
					Brand Verification Request
				</h1>
				<div class="flex items-center gap-4 text-sm text-gray-600">
					<span class="flex items-center gap-1">
						<Calendar class="w-4 h-4" />
						Submitted {formatDate(data.request.submitted_at)}
					</span>
					{#if data.request.verification_status !== 'pending'}
						<span class="flex items-center gap-1">
							<Shield class="w-4 h-4" />
							{data.request.verification_status.replace('_', ' ')}
						</span>
					{/if}
				</div>
			</div>
			<a
				href="/profile/{data.profile.username}"
				target="_blank"
				class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg
					hover:bg-gray-200 transition-colors text-sm font-medium"
			>
				View Profile
				<ExternalLink class="w-4 h-4" />
			</a>
		</div>
	</div>

	<!-- Brand Information -->
	<div class="bg-white rounded-lg shadow-sm p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
			<Building2 class="w-5 h-5" />
			Brand Information
		</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<p class="text-sm text-gray-600 mb-1">Brand Name</p>
				<p class="font-medium text-gray-900">{data.request.brand_name}</p>
			</div>
			<div>
				<p class="text-sm text-gray-600 mb-1">Category</p>
				<p class="font-medium text-gray-900">{data.request.brand_category}</p>
			</div>
			{#if data.request.business_registration_number}
				<div>
					<p class="text-sm text-gray-600 mb-1">Business Registration</p>
					<p class="font-medium text-gray-900">{data.request.business_registration_number}</p>
				</div>
			{/if}
			{#if data.request.tax_id}
				<div>
					<p class="text-sm text-gray-600 mb-1">Tax ID</p>
					<p class="font-medium text-gray-900">{data.request.tax_id}</p>
				</div>
			{/if}
		</div>

		{#if data.profile.brand_description}
			<div class="mt-6">
				<p class="text-sm text-gray-600 mb-1">Brand Description</p>
				<p class="text-gray-900 leading-relaxed">{data.profile.brand_description}</p>
			</div>
		{/if}
	</div>

	<!-- User Information -->
	<div class="bg-white rounded-lg shadow-sm p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
			<User class="w-5 h-5" />
			User Information
		</h2>
		
		<div class="flex items-start gap-4">
			<img
				src={data.profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.profile.username}`}
				alt={data.profile.username}
				class="w-16 h-16 rounded-full"
			/>
			<div class="flex-1">
				<p class="font-medium text-gray-900">{data.profile.full_name || data.profile.username}</p>
				<p class="text-sm text-gray-600">@{data.profile.username}</p>
				<p class="text-sm text-gray-600 mt-1">
					Member since {formatDate(data.profile.created_at)}
				</p>
				<div class="flex items-center gap-4 mt-2 text-sm">
					<span>
						<span class="font-medium">{data.profile.followers_count}</span> followers
					</span>
					<span>
						<span class="font-medium">{data.profile.listings_count}</span> listings
					</span>
					{#if data.profile.seller_rating > 0}
						<span>
							<span class="font-medium">{data.profile.seller_rating.toFixed(1)}</span> rating
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Social Media Accounts -->
	{#if data.socialAccounts.length > 0 || (data.request.social_media_accounts && Object.keys(data.request.social_media_accounts).length > 0)}
		<div class="bg-white rounded-lg shadow-sm p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<Link2 class="w-5 h-5" />
				Social Media Accounts
			</h2>
			
			<div class="space-y-3">
				{#each data.socialAccounts as account}
					<a
						href={account.url}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-between p-3 bg-gray-50 rounded-lg
							hover:bg-gray-100 transition-colors"
					>
						<div class="flex items-center gap-3">
							<svelte:component 
								this={socialPlatformIcons[account.platform] || Globe} 
								class="w-5 h-5 text-gray-600"
							/>
							<div>
								<p class="font-medium text-gray-900 capitalize">{account.platform}</p>
								<p class="text-sm text-gray-600">@{account.username}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							{#if account.is_verified}
								<CheckCircle class="w-4 h-4 text-green-600" />
							{/if}
							<ExternalLink class="w-4 h-4 text-gray-400" />
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Documents -->
	{#if data.request.documents && data.request.documents.length > 0}
		<div class="bg-white rounded-lg shadow-sm p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<FileText class="w-5 h-5" />
				Submitted Documents
			</h2>
			
			<div class="space-y-2">
				{#each data.request.documents as doc}
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<span class="text-sm text-gray-700">{doc.name}</span>
						<a
							href={doc.url}
							target="_blank"
							class="text-blue-600 hover:text-blue-700 text-sm font-medium"
						>
							View
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Admin Actions -->
	{#if data.request.verification_status === 'pending'}
		<div class="bg-white rounded-lg shadow-sm p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
			
			<!-- Admin Notes -->
			<div class="mb-6">
				<label for="adminNotes" class="block text-sm font-medium text-gray-700 mb-2">
					Admin Notes (Optional)
				</label>
				<textarea
					id="adminNotes"
					bind:value={adminNotes}
					rows="3"
					placeholder="Add any notes about this verification..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg
						focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				></textarea>
			</div>

			<!-- Request More Info -->
			{#if requestMoreInfo}
				<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<label for="infoMessage" class="block text-sm font-medium text-gray-700 mb-2">
						What information is needed?
					</label>
					<textarea
						id="infoMessage"
						bind:value={infoMessage}
						rows="3"
						placeholder="Specify what additional information or documents are required..."
						class="w-full px-4 py-2 border border-gray-300 rounded-lg
							focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
					></textarea>
					<div class="flex gap-2 mt-3">
						<button
							onclick={handleRequestInfo}
							disabled={loading}
							class="px-4 py-2 bg-yellow-600 text-white rounded-lg
								hover:bg-yellow-700 disabled:opacity-50 transition-colors"
						>
							Send Request
						</button>
						<button
							onclick={() => requestMoreInfo = false}
							class="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					onclick={handleApprove}
					disabled={loading}
					class="flex-1 flex items-center justify-center gap-2 px-6 py-3
						bg-green-600 text-white font-medium rounded-lg
						hover:bg-green-700 disabled:opacity-50 transition-colors"
				>
					<CheckCircle class="w-5 h-5" />
					Approve Brand
				</button>
				<button
					onclick={handleReject}
					disabled={loading}
					class="flex-1 flex items-center justify-center gap-2 px-6 py-3
						bg-red-600 text-white font-medium rounded-lg
						hover:bg-red-700 disabled:opacity-50 transition-colors"
				>
					<XCircle class="w-5 h-5" />
					Reject
				</button>
				<button
					onclick={() => requestMoreInfo = true}
					disabled={loading || requestMoreInfo}
					class="flex-1 flex items-center justify-center gap-2 px-6 py-3
						bg-yellow-600 text-white font-medium rounded-lg
						hover:bg-yellow-700 disabled:opacity-50 transition-colors"
				>
					<AlertCircle class="w-5 h-5" />
					Request Info
				</button>
			</div>
		</div>
	{:else}
		<!-- Already Reviewed -->
		<div class="bg-gray-50 rounded-lg p-6">
			<div class="flex items-center gap-3 mb-4">
				<svelte:component 
					this={data.request.verification_status === 'approved' ? CheckCircle : XCircle}
					class="w-6 h-6 {data.request.verification_status === 'approved' ? 'text-green-600' : 'text-red-600'}"
				/>
				<h3 class="text-lg font-semibold text-gray-900">
					Request {data.request.verification_status.replace('_', ' ')}
				</h3>
			</div>
			{#if data.request.reviewed_at}
				<p class="text-sm text-gray-600 mb-2">
					Reviewed on {formatDate(data.request.reviewed_at)}
				</p>
			{/if}
			{#if data.request.admin_notes}
				<div class="bg-white rounded-lg p-4">
					<p class="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
					<p class="text-gray-900">{data.request.admin_notes}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>