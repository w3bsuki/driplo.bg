<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, profile as authProfile } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	
	// Import our new focused components
	import ProfileHeader from '$lib/components/profile/settings/ProfileHeader.svelte';
	import ProfileCoverSection from '$lib/components/profile/settings/ProfileCoverSection.svelte';
	import ProfileImageSection from '$lib/components/profile/settings/ProfileImageSection.svelte';
	import ProfileBasicInfoForm from '$lib/components/profile/settings/ProfileBasicInfoForm.svelte';
	import SocialMediaSection from '$lib/components/profile/settings/SocialMediaSection.svelte';
	import ProfileSaveActions from '$lib/components/profile/settings/ProfileSaveActions.svelte';
	import ProfileSettingsCards from '$lib/components/profile/settings/ProfileSettingsCards.svelte';

	let { data }: { data: PageData } = $props();
	
	const supabase = $derived(data.supabase);

	let profile = $state(data.profile);
	let saving = $state(false);
	let uploadingAvatar = $state(false);
	let uploadingCover = $state(false);

	// Form fields initialized from server data
	let fullName = $state(data.profile.full_name || '');
	let username = $state(data.profile.username || '');
	let bio = $state(data.profile.bio || '');
	let location = $state(data.profile.location || '');
	let website = $state(data.profile.website || '');
	
	// Social media fields
	let socialMedia = $state({
		instagram: '',
		tiktok: '',
		facebook: '',
		twitter: '',
		youtube: '',
		pinterest: ''
	});
	
	// Load existing social media accounts on mount
	onMount(async () => {
		if (data.user?.id) {
			try {
				const { data: socialAccounts } = await supabase
					.from('social_media_accounts')
					.select('*')
					.eq('user_id', data.user.id);
				
				if (socialAccounts) {
					socialAccounts.forEach(account => {
						if (account.platform in socialMedia) {
							socialMedia[account.platform as keyof typeof socialMedia] = account.username || '';
						}
					});
				}
			} catch (error) {
				logger.error('Error loading social media accounts:', error);
			}
		}
	});

	async function handleAvatarUpload(event: CustomEvent<{ file: File; preview: string }>) {
		uploadingAvatar = true

		try {
			const formData = new FormData()
			formData.append('file', event.detail.file)
			formData.append('type', 'avatar')

			const response = await fetch('/api/upload/image', {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				throw new Error('Upload failed')
			}

			const result = await response.json()
			profile.avatar_url = result.url
			toast.success(m.settings_avatar_updated())
		} catch (error) {
			logger.error('Avatar upload error:', error)
			toast.error(m.settings_avatar_error())
		} finally {
			uploadingAvatar = false
		}
	}

	async function handleCoverUpload(event: CustomEvent<{ file: File; preview: string }>) {
		uploadingCover = true

		try {
			const formData = new FormData()
			formData.append('file', event.detail.file)
			formData.append('type', 'cover')

			const response = await fetch('/api/upload/image', {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				throw new Error('Upload failed')
			}

			const result = await response.json()
			profile.cover_url = result.url
			toast.success(m.settings_cover_updated())
		} catch (error) {
			logger.error('Cover upload error:', error)
			toast.error(m.settings_cover_error())
		} finally {
			uploadingCover = false
		}
	}

	async function saveProfile() {
		if (!username.trim()) {
			toast.error(m.settings_username_required())
			return
		}

		saving = true

		try {
			// Update profile
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					full_name: fullName.trim() || null,
					username: username.trim(),
					bio: bio.trim() || null,
					location: location.trim() || null,
					website: website.trim() || null,
					updated_at: new Date().toISOString()
				})
				.eq('id', data.user?.id);

			if (profileError) throw profileError;

			// Update social media accounts
			for (const [platform, username] of Object.entries(socialMedia)) {
				if (username.trim()) {
					// First check if account exists
					const { data: existing } = await supabase
						.from('social_media_accounts')
						.select('id')
						.eq('user_id', data.user?.id)
						.eq('platform', platform)
						.single();

					if (existing) {
						// Update existing
						await supabase
							.from('social_media_accounts')
							.update({
								username: username.trim(),
								url: getSocialMediaUrl(platform, username.trim()),
								updated_at: new Date().toISOString()
							})
							.eq('id', existing.id);
					} else {
						// Insert new
						await supabase
							.from('social_media_accounts')
							.insert({
								user_id: data.user?.id,
								platform,
								username: username.trim(),
								url: getSocialMediaUrl(platform, username.trim())
							});
					}
				} else {
					// Delete if empty
					await supabase
						.from('social_media_accounts')
						.delete()
						.eq('user_id', data.user?.id)
						.eq('platform', platform);
				}
			}

			toast.success(m.settings_profile_updated());
			goto(`/profile/${username}`);
		} catch (error: any) {
			logger.error('Save profile error:', error);
			if (error.code === '23505') {
				toast.error(m.settings_username_taken());
			} else {
				toast.error(m.settings_save_error());
			}
		} finally {
			saving = false;
		}
	}

	function getSocialMediaUrl(platform: string, username: string): string {
		const cleanUsername = username.replace('@', '')
		switch (platform) {
			case 'instagram':
				return `https://instagram.com/${cleanUsername}`
			case 'tiktok':
				return `https://tiktok.com/@${cleanUsername}`
			case 'facebook':
				return `https://facebook.com/${cleanUsername}`
			case 'twitter':
				return `https://twitter.com/${cleanUsername}`
			case 'youtube':
				return `https://youtube.com/@${cleanUsername}`
			case 'pinterest':
				return `https://pinterest.com/${cleanUsername}`
			default:
				return ''
		}
	}

	function goBack() {
		if (profile.username) {
			goto(`/profile/${profile.username}`);
		} else {
			goto('/');
		}
	}

	// Handler functions for child components
	function handleSocialMediaChange(platform: keyof typeof socialMedia, value: string) {
		socialMedia[platform] = value;
	}

	// Derived helper for can save
	let canSave = $derived(username.trim().length > 0);
</script>

<svelte:head>
	<title>{m.settings_page_title()}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
	<!-- Header -->
	<ProfileHeader onGoBack={goBack} />

	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
		<!-- Cover & Profile Section -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
			<ProfileCoverSection 
				coverUrl={profile.cover_url}
				uploading={uploadingCover}
				onUpload={handleCoverUpload}
			/>

			<ProfileImageSection 
				avatarUrl={profile.avatar_url}
				{fullName}
				{username}
				uploading={uploadingAvatar}
				onUpload={handleAvatarUpload}
			/>
		</div>

		<!-- Form Section -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
			<ProfileBasicInfoForm 
				{fullName}
				{username}
				{bio}
				{location}
				{website}
				onFullNameChange={(value) => fullName = value}
				onUsernameChange={(value) => username = value}
				onBioChange={(value) => bio = value}
				onLocationChange={(value) => location = value}
				onWebsiteChange={(value) => website = value}
			/>

			<SocialMediaSection 
				{socialMedia}
				onSocialMediaChange={handleSocialMediaChange}
			/>

			<ProfileSaveActions 
				{saving}
				{canSave}
				onCancel={goBack}
				onSave={saveProfile}
			/>
		</div>

		<ProfileSettingsCards />
	</div>
</div>

<style>
	/* Custom styles for better image upload integration */
	:global(.image-upload-wrapper) {
		border: 0;
		background-color: transparent;
		padding: 0;
	}
	
	:global(.image-upload-button) {
		background-color: primary;
		border: 0;
	}
	
	:global(.image-upload-button:hover) {
		background-color: hsl(var(--primary) / 0.9);
	}
</style>