<script lang="ts">
	import { Save, Loader2 } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		saving: boolean;
		canSave: boolean;
		onCancel: () => void;
		onSave: () => void;
	}

	let { saving, canSave, onCancel, onSave }: Props = $props();
</script>

<!-- Modern Save Section -->
<div class="px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-100">
	<div class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
		<p class="text-sm text-gray-500">
			{m.settings_required_fields ? m.settings_required_fields() : 'Fields marked with * are required'}
		</p>
		<div class="flex gap-3">
			<button
				onclick={onCancel}
				class="flex-1 sm:flex-initial px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
			>
				Cancel
			</button>
			<button
				onclick={onSave}
				disabled={saving || !canSave}
				class="flex-1 sm:flex-initial bg-primary text-white py-3 px-8 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 min-w-[140px]"
			>
				{#if saving}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>Saving...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>{m.settings_save_changes()}</span>
				{/if}
			</button>
		</div>
	</div>
</div>