<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from 'svelte-sonner';
	import { 
		DollarSign, 
		Users, 
		Package, 
		TrendingUp, 
		Check, 
		X, 
		Clock, 
		AlertCircle,
		ExternalLink,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	interface Payout {
		id: string;
		amount: number;
		seller_revtag: string;
		status: 'pending' | 'processing' | 'completed' | 'failed';
		created_at: string;
		processed_at?: string;
		notes?: string;
		transaction: {
			id: string;
			amount: number;
			currency: string;
			status: string;
			created_at: string;
			listing: {
				id: string;
				title: string;
				price: number;
				images: string[];
			};
			buyer: {
				id: string;
				email: string;
			};
		};
		seller: {
			id: string;
			email: string;
		};
	}

	let payouts = $state<Payout[]>([]);
	let loading = $state(true);
	let selectedStatus = $state('all');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let processingPayout = $state<string | null>(null);
	let processingNotes = $state('');
	let showNotesModal = $state(false);
	let selectedPayout = $state<Payout | null>(null);
	let pendingAction = $state<'approve' | 'reject' | null>(null);
	let selectedPayouts = $state<Set<string>>(new Set());
	let showBatchModal = $state(false);
	let batchProcessing = $state(false);

	// Stats
	let stats = $state({
		totalPayouts: 0,
		pendingPayouts: 0,
		completedPayouts: 0,
		totalPlatformFees: 0
	});

	onMount(() => {
		loadPayouts();
	});

	async function loadPayouts() {
		loading = true;
		try {
			const params = new URLSearchParams({
				status: selectedStatus,
				page: currentPage.toString(),
				limit: '20'
			});

			const response = await fetch(`/api/admin/payouts?${params}`);
			const data = await response.json();

			if (response.ok) {
				payouts = data.payouts;
				totalPages = data.pagination.totalPages;
				
				// Calculate stats
				updateStats();
			} else {
				toast.error(data.error || 'Failed to load payouts');
			}
		} catch (error) {
			console.error('Load payouts error:', error);
			toast.error('Failed to load payouts');
		} finally {
			loading = false;
		}
	}

	function updateStats() {
		stats = {
			totalPayouts: payouts.length,
			pendingPayouts: payouts.filter(p => p.status === 'pending' || p.status === 'processing').length,
			completedPayouts: payouts.filter(p => p.status === 'completed').length,
			totalPlatformFees: payouts.reduce((sum, p) => sum + (p.transaction.amount * 0.05 + 1), 0)
		};
	}

	function handleStatusChange(status: string) {
		selectedStatus = status;
		currentPage = 1;
		loadPayouts();
	}

	function openNotesModal(payout: Payout, action: 'approve' | 'reject') {
		selectedPayout = payout;
		pendingAction = action;
		processingNotes = '';
		showNotesModal = true;
	}

	function closeNotesModal() {
		showNotesModal = false;
		selectedPayout = null;
		pendingAction = null;
		processingNotes = '';
	}

	async function processPayoutAction() {
		if (!selectedPayout || !pendingAction) return;

		processingPayout = selectedPayout.id;
		try {
			const response = await fetch('/api/admin/payouts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					payout_id: selectedPayout.id,
					action: pendingAction,
					notes: processingNotes || null
				})
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || 'Payout processed successfully');
				closeNotesModal();
				loadPayouts();
			} else {
				toast.error(data.error || 'Failed to process payout');
			}
		} catch (error) {
			console.error('Process payout error:', error);
			toast.error('Failed to process payout');
		} finally {
			processingPayout = null;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'processing': return 'bg-blue-100 text-blue-800';
			case 'completed': return 'bg-green-100 text-green-800';
			case 'failed': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending': return Clock;
			case 'processing': return TrendingUp;
			case 'completed': return Check;
			case 'failed': return X;
			default: return AlertCircle;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function changePage(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
			loadPayouts();
		}
	}

	function togglePayoutSelection(payoutId: string) {
		const newSelected = new Set(selectedPayouts);
		if (newSelected.has(payoutId)) {
			newSelected.delete(payoutId);
		} else {
			newSelected.add(payoutId);
		}
		selectedPayouts = newSelected;
	}

	function selectAllPayouts() {
		const processingPayouts = payouts.filter(p => p.status === 'processing');
		selectedPayouts = new Set(processingPayouts.map(p => p.id));
	}

	function deselectAllPayouts() {
		selectedPayouts = new Set();
	}

	function openBatchModal(action: 'approve' | 'reject') {
		if (selectedPayouts.size === 0) {
			toast.error('Please select payouts to process');
			return;
		}
		pendingAction = action;
		processingNotes = '';
		showBatchModal = true;
	}

	function closeBatchModal() {
		showBatchModal = false;
		pendingAction = null;
		processingNotes = '';
	}

	async function processBatchAction() {
		if (!pendingAction || selectedPayouts.size === 0) return;

		batchProcessing = true;
		try {
			const response = await fetch('/api/admin/payouts/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					payout_ids: Array.from(selectedPayouts),
					action: pendingAction,
					notes: processingNotes || null
				})
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || 'Batch processing completed');
				closeBatchModal();
				deselectAllPayouts();
				loadPayouts();
			} else {
				toast.error(data.error || 'Failed to process batch');
			}
		} catch (error) {
			console.error('Batch processing error:', error);
			toast.error('Failed to process batch');
		} finally {
			batchProcessing = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Payouts Management</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
					<p class="text-sm text-gray-600">Manage seller payouts and platform fees</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-green-500 rounded-full"></div>
					<span class="text-sm text-gray-600">System Online</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow-sm p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Total Payouts</p>
						<p class="text-2xl font-bold text-gray-900">{stats.totalPayouts}</p>
					</div>
					<Package class="w-8 h-8 text-blue-500" />
				</div>
			</div>
			<div class="bg-white rounded-lg shadow-sm p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Pending</p>
						<p class="text-2xl font-bold text-yellow-600">{stats.pendingPayouts}</p>
					</div>
					<Clock class="w-8 h-8 text-yellow-500" />
				</div>
			</div>
			<div class="bg-white rounded-lg shadow-sm p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Completed</p>
						<p class="text-2xl font-bold text-green-600">{stats.completedPayouts}</p>
					</div>
					<Check class="w-8 h-8 text-green-500" />
				</div>
			</div>
			<div class="bg-white rounded-lg shadow-sm p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Platform Fees</p>
						<p class="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalPlatformFees)}</p>
					</div>
					<DollarSign class="w-8 h-8 text-blue-500" />
				</div>
			</div>
		</div>

		<!-- Filters and Batch Actions -->
		<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<span class="text-sm font-medium text-gray-700">Filter by status:</span>
					<div class="flex gap-2">
						{#each ['all', 'pending', 'processing', 'completed', 'failed'] as status}
							<button
								onclick={() => handleStatusChange(status)}
								class="px-3 py-1 rounded-full text-sm font-medium transition-colors {
									selectedStatus === status 
										? 'bg-blue-100 text-blue-800' 
										: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
								}"
							>
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</button>
						{/each}
					</div>
				</div>
				
				{#if selectedStatus === 'processing'}
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-2">
							<button
								onclick={selectAllPayouts}
								class="text-sm text-blue-600 hover:text-blue-800"
							>
								Select All
							</button>
							<button
								onclick={deselectAllPayouts}
								class="text-sm text-gray-600 hover:text-gray-800"
							>
								Deselect All
							</button>
						</div>
						
						{#if selectedPayouts.size > 0}
							<div class="flex items-center gap-2">
								<span class="text-sm text-gray-600">{selectedPayouts.size} selected</span>
								<button
									onclick={() => openBatchModal('approve')}
									class="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
								>
									Batch Approve
								</button>
								<button
									onclick={() => openBatchModal('reject')}
									class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
								>
									Batch Reject
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Payouts Table -->
		<div class="bg-white rounded-lg shadow-sm overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Seller Payouts</h2>
			</div>
			
			{#if loading}
				<div class="p-8 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p class="text-gray-600 mt-2">Loading payouts...</p>
				</div>
			{:else if payouts.length === 0}
				<div class="p-8 text-center">
					<Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-600">No payouts found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								{#if selectedStatus === 'processing'}
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										<input
											type="checkbox"
											checked={selectedPayouts.size > 0 && selectedPayouts.size === payouts.filter(p => p.status === 'processing').length}
											onchange={() => selectedPayouts.size > 0 ? deselectAllPayouts() : selectAllPayouts()}
											class="rounded border-gray-300"
										/>
									</th>
								{/if}
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each payouts as payout}
								<tr class="hover:bg-gray-50">
									{#if selectedStatus === 'processing'}
										<td class="px-6 py-4">
											{#if payout.status === 'processing'}
												<input
													type="checkbox"
													checked={selectedPayouts.has(payout.id)}
													onchange={() => togglePayoutSelection(payout.id)}
													class="rounded border-gray-300"
												/>
											{/if}
										</td>
									{/if}
									<td class="px-6 py-4">
										<div class="flex items-center gap-3">
											<img 
												src={payout.transaction.listing.images[0]} 
												alt={payout.transaction.listing.title}
												class="w-10 h-10 rounded-lg object-cover"
											/>
											<div>
												<p class="text-sm font-medium text-gray-900">{payout.transaction.listing.title}</p>
												<p class="text-xs text-gray-500">#{payout.transaction.id}</p>
											</div>
										</div>
									</td>
									<td class="px-6 py-4">
										<div>
											<p class="text-sm text-gray-900">
												{#if payout.seller_revtag === 'NOT_SET'}
													<span class="text-red-600">⚠️ Contact seller for Revtag</span>
												{:else}
													{payout.seller_revtag}
												{/if}
											</p>
											<p class="text-xs text-gray-500">{payout.seller.email}</p>
										</div>
									</td>
									<td class="px-6 py-4">
										<p class="text-sm font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
									</td>
									<td class="px-6 py-4">
										<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {getStatusColor(payout.status)}">
											<svelte:component this={getStatusIcon(payout.status)} class="w-3 h-3" />
											{payout.status}
										</span>
									</td>
									<td class="px-6 py-4">
										<p class="text-sm text-gray-900">{formatDate(payout.created_at)}</p>
									</td>
									<td class="px-6 py-4">
										{#if payout.status === 'processing'}
											<div class="flex gap-2">
												<button
													onclick={() => openNotesModal(payout, 'approve')}
													disabled={processingPayout === payout.id}
													class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 text-sm"
												>
													<Check class="w-4 h-4" />
													Approve
												</button>
												<button
													onclick={() => openNotesModal(payout, 'reject')}
													disabled={processingPayout === payout.id}
													class="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 text-sm"
												>
													<X class="w-4 h-4" />
													Reject
												</button>
											</div>
										{:else if payout.status === 'completed'}
											<span class="text-xs text-green-600">Processed</span>
										{:else if payout.status === 'failed'}
											<span class="text-xs text-red-600">Failed</span>
										{:else}
											<span class="text-xs text-gray-500">Waiting for shipping</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
						<div class="text-sm text-gray-700">
							Page {currentPage} of {totalPages}
						</div>
						<div class="flex gap-2">
							<button
								onclick={() => changePage(currentPage - 1)}
								disabled={currentPage === 1}
								class="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								<ChevronLeft class="w-4 h-4" />
							</button>
							<button
								onclick={() => changePage(currentPage + 1)}
								disabled={currentPage === totalPages}
								class="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								<ChevronRight class="w-4 h-4" />
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<!-- Notes Modal -->
{#if showNotesModal && selectedPayout}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-semibold mb-4">
				{pendingAction === 'approve' ? 'Approve' : 'Reject'} Payout
			</h3>
			<div class="mb-4">
				<p class="text-sm text-gray-600 mb-2">
					{pendingAction === 'approve' ? 'Approving' : 'Rejecting'} payout of {formatCurrency(selectedPayout.amount)} to {selectedPayout.seller_revtag}
				</p>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Notes (optional):
				</label>
				<textarea
					bind:value={processingNotes}
					placeholder="Add any notes about this payout..."
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					rows="3"
				></textarea>
			</div>
			<div class="flex gap-3">
				<button
					onclick={closeNotesModal}
					class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					onclick={processPayoutAction}
					disabled={processingPayout === selectedPayout.id}
					class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if processingPayout === selectedPayout.id}
						Processing...
					{:else}
						Confirm {pendingAction === 'approve' ? 'Approval' : 'Rejection'}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Batch Processing Modal -->
{#if showBatchModal}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-semibold mb-4">
				Batch {pendingAction === 'approve' ? 'Approve' : 'Reject'} Payouts
			</h3>
			<div class="mb-4">
				<p class="text-sm text-gray-600 mb-2">
					{pendingAction === 'approve' ? 'Approving' : 'Rejecting'} {selectedPayouts.size} payout{selectedPayouts.size > 1 ? 's' : ''}
				</p>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Notes (optional):
				</label>
				<textarea
					bind:value={processingNotes}
					placeholder="Add any notes about these payouts..."
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					rows="3"
				></textarea>
			</div>
			<div class="flex gap-3">
				<button
					onclick={closeBatchModal}
					class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					onclick={processBatchAction}
					disabled={batchProcessing}
					class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if batchProcessing}
						Processing...
					{:else}
						Confirm Batch {pendingAction === 'approve' ? 'Approval' : 'Rejection'}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}