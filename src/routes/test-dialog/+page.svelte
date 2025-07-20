<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button.svelte';
	
	let open = false;
</script>

<div class="min-h-screen p-8">
	<h1 class="text-2xl font-bold mb-4">Dialog Test Page</h1>
	
	<Button onclick={() => open = true}>
		Open Dialog
	</Button>
	
	<Dialog bind:open>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Test Dialog</DialogTitle>
				<DialogDescription>
					This is a test dialog to check if the background is transparent or opaque.
				</DialogDescription>
			</DialogHeader>
			
			<div class="mt-4">
				<p>If you can see this dialog with a proper white/dark background, the issue is fixed!</p>
			</div>
			
			<div class="mt-6 flex justify-end">
				<Button onclick={() => open = false}>
					Close
				</Button>
			</div>
		</DialogContent>
	</Dialog>
</div>