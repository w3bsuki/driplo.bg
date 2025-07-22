<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Chip from '$lib/components/ui/chip.svelte';
	import Icon from '$lib/components/ui/icon.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import { Heart, Search, ShoppingBag, User, Settings } from 'lucide-svelte';
	
	let selectedChips = $state([1, 3]);
	
	function toggleChip(id: number) {
		if (selectedChips.includes(id)) {
			selectedChips = selectedChips.filter(chip => chip !== id);
		} else {
			selectedChips = [...selectedChips, id];
		}
	}
</script>

<div class="p-8 space-y-8">
	<section>
		<h2 class="text-2xl font-bold mb-4">Button Sizes Test</h2>
		<div class="flex flex-wrap gap-4 items-end">
			<Button size="xs">XS Button (28px)</Button>
			<Button size="sm">SM Button (32px)</Button>
			<Button>Default Button (36px)</Button>
			<Button size="lg">LG Button (40px)</Button>
			<Button size="xl">XL Button (44px)</Button>
			<Button size="icon">
				<span>📦</span>
			</Button>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Button Variants Test</h2>
		<div class="flex flex-wrap gap-4">
			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="link">Link</Button>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Input Sizes Test</h2>
		<div class="space-y-4 max-w-md">
			<div>
				<label class="block text-sm font-medium mb-1">Small Input (32px)</label>
				<Input size="sm" placeholder="Small input" />
			</div>
			<div>
				<label class="block text-sm font-medium mb-1">Medium Input (40px)</label>
				<Input placeholder="Medium input (default)" />
			</div>
			<div>
				<label class="block text-sm font-medium mb-1">Large Input (48px)</label>
				<Input size="lg" placeholder="Large input" />
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Touch Target Test</h2>
		<p class="text-sm text-gray-600 mb-4">All buttons should have minimum 32px touch targets. The XS button has the touch-safe class applied.</p>
		<div class="flex gap-4">
			<button class="touch-safe bg-gray-200 rounded px-2 text-xs">Touch Safe</button>
			<button class="bg-gray-200 rounded px-2 text-xs">Not Touch Safe</button>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Badge Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-medium mb-2">Sizes</h3>
				<div class="flex gap-4 items-center">
					<Badge size="sm">Small Badge (20px)</Badge>
					<Badge>Medium Badge (24px)</Badge>
					<Badge size="lg">Large Badge (28px)</Badge>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Variants</h3>
				<div class="flex flex-wrap gap-4">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Chip Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-medium mb-2">Sizes</h3>
				<div class="flex gap-4 items-center">
					<Chip size="sm">Small Chip (20px)</Chip>
					<Chip>Medium Chip (24px)</Chip>
					<Chip size="lg">Large Chip (28px)</Chip>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Interactive Chips (Selectable)</h3>
				<div class="flex flex-wrap gap-2">
					{#each [1, 2, 3, 4, 5] as id}
						<Chip 
							interactive={true}
							selected={selectedChips.includes(id)}
							onclick={() => toggleChip(id)}
						>
							Option {id}
						</Chip>
					{/each}
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Dismissible Chips</h3>
				<div class="flex flex-wrap gap-2">
					<Chip dismissible ondismiss={() => console.log('Dismissed 1')}>Removable 1</Chip>
					<Chip dismissible variant="primary" ondismiss={() => console.log('Dismissed 2')}>Removable 2</Chip>
					<Chip dismissible variant="success" ondismiss={() => console.log('Dismissed 3')}>Removable 3</Chip>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Variants</h3>
				<div class="flex flex-wrap gap-2">
					<Chip>Default</Chip>
					<Chip variant="primary">Primary</Chip>
					<Chip variant="secondary">Secondary</Chip>
					<Chip variant="success">Success</Chip>
					<Chip variant="warning">Warning</Chip>
					<Chip variant="destructive">Destructive</Chip>
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Icon Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-medium mb-2">Icon Sizes</h3>
				<div class="flex gap-4 items-center">
					<div class="text-center">
						<Icon icon={Heart} size="xs" class="text-brand-500" />
						<p class="text-xs mt-1">XS (12px)</p>
					</div>
					<div class="text-center">
						<Icon icon={Heart} size="sm" class="text-brand-500" />
						<p class="text-xs mt-1">SM (16px)</p>
					</div>
					<div class="text-center">
						<Icon icon={Heart} size="md" class="text-brand-500" />
						<p class="text-xs mt-1">MD (20px)</p>
					</div>
					<div class="text-center">
						<Icon icon={Heart} size="lg" class="text-brand-500" />
						<p class="text-xs mt-1">LG (24px)</p>
					</div>
					<div class="text-center">
						<Icon icon={Heart} size="xl" class="text-brand-500" />
						<p class="text-xs mt-1">XL (32px)</p>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Icon Variations</h3>
				<div class="flex gap-4">
					<Icon icon={Search} size="md" />
					<Icon icon={ShoppingBag} size="md" class="text-emerald-600" />
					<Icon icon={User} size="md" class="text-blue-600" />
					<Icon icon={Settings} size="md" class="text-gray-600" />
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Loading Spinner Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-medium mb-2">Sizes</h3>
				<div class="flex gap-8 items-center">
					<div class="text-center">
						<LoadingSpinner size="sm" />
						<p class="text-xs mt-2">Small</p>
					</div>
					<div class="text-center">
						<LoadingSpinner />
						<p class="text-xs mt-2">Medium</p>
					</div>
					<div class="text-center">
						<LoadingSpinner size="lg" />
						<p class="text-xs mt-2">Large</p>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Colors</h3>
				<div class="flex gap-8 items-center">
					<LoadingSpinner color="primary" />
					<div class="bg-gray-800 p-4 rounded">
						<LoadingSpinner color="white" />
					</div>
					<div class="text-emerald-600">
						<LoadingSpinner color="current" />
					</div>
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Skeleton Component Test</h2>
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-medium mb-2">Variants</h3>
				<div class="space-y-2">
					<Skeleton class="w-full h-10" />
					<Skeleton variant="text" class="w-3/4" />
					<Skeleton variant="text" class="w-1/2" />
					<div class="flex gap-4">
						<Skeleton variant="circular" class="w-12 h-12" />
						<div class="space-y-2 flex-1">
							<Skeleton variant="text" class="w-1/3" />
							<Skeleton variant="text" class="w-2/3" />
						</div>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-lg font-medium mb-2">Animation Types</h3>
				<div class="space-y-2">
					<Skeleton animation="pulse" class="w-full h-10" />
					<Skeleton animation="wave" class="w-full h-10" />
					<Skeleton animation="none" class="w-full h-10" />
				</div>
			</div>
		</div>
	</section>
</div>