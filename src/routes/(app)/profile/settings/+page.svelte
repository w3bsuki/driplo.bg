<script lang="ts">
	import { goto } from '$app/navigation'
	import { user } from '$lib/stores/auth'
	import { Button } from '$lib/components/ui'
	import ImageUpload from '$lib/components/upload/ImageUpload.svelte'
	import { Save, ArrowLeft, User, Image as ImageIcon } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import type { PageData } from './$types'
	import * as m from '$lib/paraglide/messages.js'

	// Get page data from server
	let { data }: { data: PageData } = $props()
	
	// Get supabase client from page data
	const supabase = $derived(data.supabase)

	let profile = $state(data.profile)
	let saving = $state(false)
	let uploadingAvatar = $state(false)
	let uploadingCover = $state(false)

	// Form fields initialized from server data
	let fullName = $state(data.profile.full_name || '')
	let username = $state(data.profile.username || '')
	let bio = $state(data.profile.bio || '')
	let location = $state(data.profile.location || '')
	let website = $state(data.profile.website || '')

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
			console.error('Avatar upload error:', error)
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
			console.error('Cover upload error:', error)
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
			const { error } = await supabase
				.from('profiles')
				.update({
					full_name: fullName.trim() || null,
					username: username.trim(),
					bio: bio.trim() || null,
					location: location.trim() || null,
					website: website.trim() || null,
					updated_at: new Date().toISOString()
				})
				.eq('id', $user?.id)

			if (error) throw error

			toast.success(m.settings_profile_updated())
			goto(`/profile/${username}`)
		} catch (error: any) {
			console.error('Save profile error:', error)
			if (error.code === '23505') {
				toast.error(m.settings_username_taken())
			} else {
				toast.error(m.settings_save_error())
			}
		} finally {
			saving = false
		}
	}

	function goBack() {
		if (profile.username) {
			goto(`/profile/${profile.username}`)
		} else {
			goto('/')
		}
	}
</script>

<svelte:head>
	<title>{m.settings_page_title()}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<div class="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
		<div class="container max-w-4xl mx-auto px-4 py-4">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" onclick={goBack}>
					<ArrowLeft class="h-4 w-4 mr-2" />
					{m.settings_back()}
				</Button>
				<h1 class="text-xl font-bold">{m.settings_header_title()}</h1>
			</div>
		</div>
	</div>

		<div class="container max-w-4xl mx-auto px-4 py-8 space-y-8">
			<!-- Cover Image -->
			<div>
				<div class="flex items-center gap-2 mb-4">
					<ImageIcon class="h-5 w-5" />
					<h2 class="text-lg font-semibold">{m.settings_cover_image()}</h2>
				</div>
				<ImageUpload
					currentImage={profile.cover_url}
					placeholder={m.settings_cover_image()}
					aspectRatio="cover"
					disabled={uploadingCover}
					onupload={handleCoverUpload}
					class="max-w-2xl"
				/>
			</div>

			<!-- Avatar -->
			<div>
				<div class="flex items-center gap-2 mb-4">
					<User class="h-5 w-5" />
					<h2 class="text-lg font-semibold">{m.settings_profile_picture()}</h2>
				</div>
				<ImageUpload
					currentImage={profile.avatar_url}
					placeholder={m.settings_profile_picture()}
					aspectRatio="square"
					disabled={uploadingAvatar}
					onupload={handleAvatarUpload}
					class="max-w-xs"
				/>
			</div>

			<!-- Profile Information -->
			<div class="space-y-6">
				<h2 class="text-lg font-semibold">{m.settings_profile_info()}</h2>
				
				<div class="grid gap-6">
					<!-- Full Name -->
					<div>
						<label for="fullName" class="block text-sm font-medium mb-2">
							{m.settings_full_name()}
						</label>
						<input
							id="fullName"
							type="text"
							bind:value={fullName}
							placeholder={m.settings_full_name_placeholder()}
							class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						/>
					</div>

					<!-- Username -->
					<div>
						<label for="username" class="block text-sm font-medium mb-2">
							{m.settings_username()} <span class="text-destructive">*</span>
						</label>
						<input
							id="username"
							type="text"
							bind:value={username}
							placeholder={m.settings_username_placeholder()}
							class="w-full px-4 py-2 border border-input rounded-lg bg-background"
							required
						/>
					</div>

					<!-- Bio -->
					<div>
						<label for="bio" class="block text-sm font-medium mb-2">
							{m.settings_bio()}
						</label>
						<textarea
							id="bio"
							bind:value={bio}
							placeholder={m.settings_bio_placeholder()}
							rows="4"
							class="w-full px-4 py-2 border border-input rounded-lg bg-background resize-none"
						></textarea>
					</div>

					<!-- Location -->
					<div>
						<label for="location" class="block text-sm font-medium mb-2">
							{m.settings_location()}
						</label>
						<input
							id="location"
							type="text"
							bind:value={location}
							placeholder={m.settings_location_placeholder()}
							class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						/>
					</div>

					<!-- Website -->
					<div>
						<label for="website" class="block text-sm font-medium mb-2">
							{m.settings_website()}
						</label>
						<input
							id="website"
							type="url"
							bind:value={website}
							placeholder={m.settings_website_placeholder()}
							class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						/>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			<div class="flex justify-end pt-6 border-t">
				<Button 
					onclick={saveProfile} 
					disabled={saving || !username.trim()}
					class="min-w-[120px]"
				>
					{#if saving}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
					{:else}
						<Save class="h-4 w-4 mr-2" />
					{/if}
					{m.settings_save_changes()}
				</Button>
			</div>
		</div>
</div>