<script lang="ts">
	import { Tag, Plus, X } from 'lucide-svelte'
	import FormSection from '$lib/components/ui/form-section.svelte'
	import Input from '$lib/components/ui/input.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	
	interface Props {
		tags?: string[]
		maxTags?: number
	}
	
	let { 
		tags = $bindable([]),
		maxTags = 5
	}: Props = $props()
	
	let tagInput = $state('')
	
	function addTag() {
		const tag = tagInput.trim().toLowerCase()
		if (tag && !tags.includes(tag) && tags.length < maxTags) {
			tags = [...tags, tag]
			tagInput = ''
		}
	}
	
	function removeTag(index: number) {
		tags = tags.filter((_, i) => i !== index)
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			addTag()
		}
	}
</script>

<FormSection 
	title="Tags" 
	description="Add tags to help buyers find your item"
	icon={Tag}
>
	<!-- Current Tags -->
	{#if tags.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each tags as tag, index}
				<Badge variant="secondary" class="pl-2 pr-1 py-1">
					{tag}
					<button
						type="button"
						onclick={() => removeTag(index)}
						class="ml-1 rounded-full hover:bg-muted"
						aria-label="Remove {tag}"
					>
						<X class="w-3 h-3" />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}
	
	<!-- Add Tag -->
	{#if tags.length < maxTags}
		<div class="flex gap-2">
			<Input
				bind:value={tagInput}
				placeholder="Add a tag (e.g., vintage, summer)"
				onkeydown={handleKeydown}
				class="flex-1"
			/>
			<Button 
				type="button" 
				size="sm"
				onclick={addTag}
				disabled={!tagInput.trim()}
			>
				<Plus class="w-4 h-4" />
			</Button>
		</div>
		<p class="text-xs text-muted-foreground">
			{tags.length}/{maxTags} tags
		</p>
	{/if}
</FormSection>