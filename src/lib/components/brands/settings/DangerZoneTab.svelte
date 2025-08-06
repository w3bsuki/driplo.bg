<script lang="ts">
	import { AlertTriangle, Trash2, UserX } from 'lucide-svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		loading: boolean;
		brandName: string;
		onDowngradeAccount?: () => Promise<void>;
		onDeleteAccount?: () => Promise<void>;
	}

	let {
		loading,
		brandName,
		onDowngradeAccount,
		onDeleteAccount
	}: Props = $props();

	let showDowngradeConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let confirmText = $state('');

	async function handleDowngrade() {
		if (confirmText !== brandName) return;
		if (onDowngradeAccount) {
			await onDowngradeAccount();
		}
		showDowngradeConfirm = false;
		confirmText = '';
	}

	async function handleDelete() {
		if (confirmText !== 'DELETE') return;
		if (onDeleteAccount) {
			await onDeleteAccount();
		}
		showDeleteConfirm = false;
		confirmText = '';
	}
</script>

<div class="space-y-6">
	<div class="bg-red-50 border border-red-200 rounded-lg p-4">
		<div class="flex items-start gap-3">
			<AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
			<div>
				<h3 class="font-medium text-red-900">Danger Zone</h3>
				<p class="text-red-700 text-sm mt-1">
					These actions are permanent and cannot be undone. Please proceed with caution.
				</p>
			</div>
		</div>
	</div>

	<!-- Downgrade Account -->
	<div class="border border-gray-200 rounded-lg p-6">
		<div class="flex items-start gap-4">
			<div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
				<UserX class="w-5 h-5 text-orange-600" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold text-gray-900">Downgrade to Personal Account</h3>
				<p class="text-gray-600 text-sm mt-1">
					Convert your brand account back to a personal account. You'll lose access to brand features, but your listings will remain active.
				</p>
				
				{#if showDowngradeConfirm}
					<div class="mt-4 space-y-3">
						<p class="text-sm text-gray-700">
							Type your brand name "<strong>{brandName}</strong>" to confirm:
						</p>
						<input
							type="text"
							bind:value={confirmText}
							placeholder={brandName}
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
						/>
						<div class="flex gap-3">
							<button
								onclick={handleDowngrade}
								disabled={loading || confirmText !== brandName}
								class="px-4 py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{#if loading}
									<Spinner size="sm" color="white" />
								{:else}
									Confirm Downgrade
								{/if}
							</button>
							<button
								onclick={() => {
									showDowngradeConfirm = false;
									confirmText = '';
								}}
								class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				{:else}
					<button
						onclick={() => showDowngradeConfirm = true}
						class="mt-3 px-4 py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition-colors"
					>
						Downgrade Account
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Delete Account -->
	<div class="border border-red-200 rounded-lg p-6">
		<div class="flex items-start gap-4">
			<div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
				<Trash2 class="w-5 h-5 text-red-600" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold text-gray-900">Delete Account</h3>
				<p class="text-gray-600 text-sm mt-1">
					Permanently delete your account and all associated data. This action cannot be undone and you will lose all your listings, messages, and profile information.
				</p>
				
				{#if showDeleteConfirm}
					<div class="mt-4 space-y-3">
						<p class="text-sm text-gray-700">
							Type "<strong>DELETE</strong>" to confirm account deletion:
						</p>
						<input
							type="text"
							bind:value={confirmText}
							placeholder="DELETE"
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
						/>
						<div class="flex gap-3">
							<button
								onclick={handleDelete}
								disabled={loading || confirmText !== 'DELETE'}
								class="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{#if loading}
									<Spinner size="sm" color="white" />
								{:else}
									Delete Forever
								{/if}
							</button>
							<button
								onclick={() => {
									showDeleteConfirm = false;
									confirmText = '';
								}}
								class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				{:else}
					<button
						onclick={() => showDeleteConfirm = true}
						class="mt-3 px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
					>
						Delete Account
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>