<script>
	let { data, children } = $props();
</script>

<!-- Onboarding layout with no navigation -->
<div class="min-h-screen bg-background">
	<main class="min-h-screen">
		{@render children()}
	</main>
</div>