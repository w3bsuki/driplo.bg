<script lang="ts">
	import { User, FileText, MapPin, Globe } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		fullName: string;
		username: string;
		bio: string;
		location: string;
		website: string;
		onFullNameChange: (value: string) => void;
		onUsernameChange: (value: string) => void;
		onBioChange: (value: string) => void;
		onLocationChange: (value: string) => void;
		onWebsiteChange: (value: string) => void;
	}

	let { 
		fullName, 
		username, 
		bio, 
		location, 
		website,
		onFullNameChange,
		onUsernameChange,
		onBioChange,
		onLocationChange,
		onWebsiteChange 
	}: Props = $props();
</script>

<div class="p-6 sm:p-8">
	<h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
		<User class="w-5 h-5 text-primary" />
		{m.settings_profile_info()}
	</h2>
	
	<div class="space-y-6">
		<!-- Full Name Field -->
		<div class="space-y-2">
			<label for="fullName" class="block text-sm font-medium text-gray-700">
				{m.settings_full_name()}
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<User class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="fullName"
					type="text"
					value={fullName}
					oninput={(e) => onFullNameChange(e.currentTarget.value)}
					placeholder={m.settings_full_name_placeholder()}
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- Username Field -->
		<div class="space-y-2">
			<label for="username" class="block text-sm font-medium text-gray-700">
				{m.settings_username()} <span class="text-red-500">*</span>
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<span class="text-gray-400 font-medium text-lg">@</span>
				</div>
				<input
					id="username"
					type="text"
					value={username}
					oninput={(e) => onUsernameChange(e.currentTarget.value)}
					placeholder={m.settings_username_placeholder()}
					required
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">driplo.com/profile/{username || 'username'}</p>
		</div>

		<!-- Bio Field -->
		<div class="space-y-2">
			<label for="bio" class="block text-sm font-medium text-gray-700">
				{m.settings_bio()}
			</label>
			<div class="relative">
				<div class="absolute top-3 left-3 pointer-events-none">
					<FileText class="w-5 h-5 text-gray-400" />
				</div>
				<textarea
					id="bio"
					value={bio}
					oninput={(e) => onBioChange(e.currentTarget.value)}
					placeholder={m.settings_bio_placeholder()}
					rows="4"
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none placeholder-gray-400"
				></textarea>
			</div>
			<p class="text-xs text-gray-500">{bio.length}/500 characters</p>
		</div>

		<!-- Location Field -->
		<div class="space-y-2">
			<label for="location" class="block text-sm font-medium text-gray-700">
				{m.settings_location()}
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<MapPin class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="location"
					type="text"
					value={location}
					oninput={(e) => onLocationChange(e.currentTarget.value)}
					placeholder={m.settings_location_placeholder()}
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>

		<!-- Website Field -->
		<div class="space-y-2">
			<label for="website" class="block text-sm font-medium text-gray-700">
				{m.settings_website()}
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Globe class="w-5 h-5 text-gray-400" />
				</div>
				<input
					id="website"
					type="url"
					value={website}
					oninput={(e) => onWebsiteChange(e.currentTarget.value)}
					placeholder={m.settings_website_placeholder()}
					class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-gray-400"
				/>
			</div>
		</div>
	</div>
</div>