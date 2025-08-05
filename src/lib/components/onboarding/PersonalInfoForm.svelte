<script lang="ts">
	interface Props {
		fullName: string;
		bio: string;
		location: string;
	}

	let { 
		fullName = $bindable(''),
		bio = $bindable(''),
		location = $bindable('')
	}: Props = $props();
</script>

<div class="space-y-4">
	<div>
		<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
			Full Name
		</label>
		<input
			id="fullName"
			type="text"
			bind:value={fullName}
			placeholder="Enter your name"
			maxlength="50"
			class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
			required
		/>
	</div>

	<div>
		<label for="bio" class="block text-sm font-medium text-gray-700 mb-1">
			Bio (optional)
		</label>
		<textarea
			id="bio"
			bind:value={bio}
			placeholder="Tell us about yourself"
			maxlength="160"
			rows="3"
			class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
		/>
		<p class="mt-1 text-xs text-gray-500">{bio.length}/160 characters</p>
	</div>

	<div>
		<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
			Location (optional)
		</label>
		<input
			id="location"
			type="text"
			bind:value={location}
			placeholder="City, Country"
			maxlength="100"
			class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
		/>
	</div>
</div>