<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { 
		Store, Check, Clock
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	
	// Import sub-components
	import BrandInfoTab from '$lib/components/brands/settings/BrandInfoTab.svelte';
	import VerificationTab from '$lib/components/brands/settings/VerificationTab.svelte';
	import SocialLinksTab from '$lib/components/brands/settings/SocialLinksTab.svelte';
	import PaymentSettingsTab from '$lib/components/brands/settings/PaymentSettingsTab.svelte';
	import DangerZoneTab from '$lib/components/brands/settings/DangerZoneTab.svelte';
	import BrandUpgradeForm from '$lib/components/brands/settings/BrandUpgradeForm.svelte';

	let { data }: { data: PageData } = $props();
	
	const supabase = $derived(data.supabase);
	const user = $derived(data.user);
	const profile = $derived(data.profile);
	
	// Form state
	let loading = $state(false);
	let activeTab = $state<'info' | 'verification' | 'social' | 'payment' | 'danger'>('info');
	
	// Brand info
	let brandName = $state(profile?.brand_name || '');
	let brandDescription = $state(profile?.brand_description || '');
	let brandCategory = $state(profile?.brand_category || '');
	let brandWebsite = $state(profile?.brand_website || '');
	let brandStory = $state(profile?.brand_story || '');
	let brandEstablishedDate = $state(profile?.brand_established_date || '');
	
	// Social media
	let brandInstagram = $state(profile?.brand_instagram || '');
	let brandFacebook = $state(profile?.brand_facebook || '');
	let brandTwitter = $state('');
	let brandYoutube = $state('');
	let brandTiktok = $state('');
	
	// Verification
	let verificationRequest = $state<Record<string, unknown> | null>(null);
	let businessRegistrationNumber = $state('');
	let taxId = $state('');
	let verificationDocuments = $state<File[]>([]);
	
	// Check if user is already a brand
	let isBrand = $derived(profile?.account_type === 'brand');
	let isVerified = $derived(profile?.is_verified || false);
	
	async function generateBrandSlug(brandName: string): Promise<string> {
		const baseSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		let slug = baseSlug;
		let counter = 0;
		
		while (true) {
			const { data } = await supabase
				.from('brand_profiles')
				.select('id')
				.eq('brand_slug', slug)
				.single();
			
			if (!data) break;
			
			counter++;
			slug = `${baseSlug}-${counter}`;
		}
		
		return slug;
	}

	onMount(async () => {
		if (!user) {
			goto('/login');
			return;
		}
		
		// If profile is null or not loaded properly, try to fetch it
		if (!profile) {
			// Fetch profile if not loaded
			const { data: fetchedProfile } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();
			
			if (fetchedProfile) {
				// Update the local state with fetched profile
				data.profile = fetchedProfile;
			}
		}
		
		// Load existing verification request if any
		if (isBrand) {
			const { data } = await supabase
				.from('brand_verification_requests')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();
			
			if (data) {
				verificationRequest = data;
			}
		}
		
		// Load social media accounts from page data
		const socialAccounts = data.socialMediaAccounts;
		
		if (socialAccounts) {
			socialAccounts.forEach(account => {
				switch (account.platform) {
					case 'twitter':
						brandTwitter = account.username;
						break;
					case 'youtube':
						brandYoutube = account.username;
						break;
					case 'tiktok':
						brandTiktok = account.username;
						break;
				}
			});
		}
	});
	
	async function handleUpgradeToBrand() {
		if (!brandName.trim()) {
			toast.error('Please enter a brand name');
			return;
		}
		
		loading = true;
		try {
			const { error } = await supabase
				.from('profiles')
				.update({
					account_type: 'brand',
					brand_name: brandName,
					brand_description: brandDescription,
					brand_category: brandCategory,
					brand_website: brandWebsite,
					brand_story: brandStory,
					brand_established_date: brandEstablishedDate || null
				})
				.eq('id', user.id);
			
			if (error) throw error;
			
			// Generate brand slug for the new brand
			const brandSlug = await generateBrandSlug(brandName);
			
			// Create brand profile
			const { error: brandProfileError } = await supabase
				.from('brand_profiles')
				.insert({
					user_id: user.id,
					brand_name: brandName,
					brand_slug: brandSlug,
					brand_description: brandDescription,
					website_url: brandWebsite
				});
			
			if (brandProfileError) throw brandProfileError;
			
			toast.success('Successfully upgraded to brand account!');
			// Redirect to brand welcome page
			goto(`/brands/welcome?slug=${brandSlug}`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to upgrade account';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
	
	async function handleUpdateBrandInfo() {
		loading = true;
		try {
			const { error } = await supabase
				.from('profiles')
				.update({
					brand_name: brandName,
					brand_description: brandDescription,
					brand_category: brandCategory,
					brand_website: brandWebsite,
					brand_story: brandStory,
					brand_established_date: brandEstablishedDate || null,
					brand_instagram: brandInstagram,
					brand_facebook: brandFacebook
				})
				.eq('id', user.id);
			
			if (error) throw error;
			
			// Save social media accounts
			const socialPlatforms = [
				{ platform: 'instagram', username: brandInstagram, url: `https://instagram.com/${brandInstagram}` },
				{ platform: 'facebook', username: brandFacebook, url: `https://facebook.com/${brandFacebook}` },
				{ platform: 'twitter', username: brandTwitter, url: `https://twitter.com/${brandTwitter}` },
				{ platform: 'youtube', username: brandYoutube, url: `https://youtube.com/@${brandYoutube}` },
				{ platform: 'tiktok', username: brandTiktok, url: `https://tiktok.com/@${brandTiktok}` }
			];
			
			for (const social of socialPlatforms) {
				if (social.username) {
					await supabase
						.from('social_media_accounts')
						.upsert({
							user_id: user.id,
							platform: social.platform,
							username: social.username,
							url: social.url
						}, {
							onConflict: 'user_id,platform'
						});
				}
			}
			
			toast.success('Brand information updated successfully!');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to update brand info';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
	
	async function handleSubmitVerification() {
		if (!businessRegistrationNumber && !taxId) {
			toast.error('Please provide at least one business identifier');
			return;
		}
		
		loading = true;
		try {
			// Upload documents if any
			let documentUrls = [];
			if (verificationDocuments.length > 0) {
				for (const doc of verificationDocuments) {
					const fileName = `brand-docs/${user.id}/${Date.now()}-${doc.name}`;
					const { error: uploadError } = await supabase.storage
						.from('documents')
						.upload(fileName, doc);
					
					if (uploadError) throw uploadError;
					
					const { data: { publicUrl } } = supabase.storage
						.from('documents')
						.getPublicUrl(fileName);
					
					documentUrls.push({
						name: doc.name,
						url: publicUrl,
						uploaded_at: new Date().toISOString()
					});
				}
			}
			
			// Create verification request
			const { data, error } = await supabase
				.from('brand_verification_requests')
				.insert({
					user_id: user.id,
					brand_name: brandName,
					brand_category: brandCategory,
					business_registration_number: businessRegistrationNumber || null,
					tax_id: taxId || null,
					documents: documentUrls,
					social_media_accounts: {
						instagram: brandInstagram,
						facebook: brandFacebook,
						twitter: brandTwitter,
						youtube: brandYoutube,
						tiktok: brandTiktok,
						website: brandWebsite
					}
				})
				.select()
				.single();
			
			if (error) throw error;
			
			verificationRequest = data;
			toast.success('Verification request submitted successfully! We\'ll review it within 2-3 business days.');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to submit verification';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
	
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			verificationDocuments = Array.from(input.files);
		}
	}
	
</script>

<svelte:head>
	<title>{isBrand ? 'Brand Settings' : 'Upgrade to Brand Account'} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
				<Store class="w-8 h-8 text-primary" />
				{isBrand ? 'Brand Settings' : 'Upgrade to Brand Account'}
			</h1>
			<p class="text-gray-600 mt-2">
				{isBrand 
					? 'Manage your brand profile and verification status' 
					: 'Transform your personal account into a professional brand account'}
			</p>
		</div>
		
		{#if profile === null || profile === undefined}
			<!-- Loading State -->
			<div class="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		{:else if !isBrand}
			<BrandUpgradeForm
				bind:brandName
				bind:brandDescription
				bind:brandCategory
				loading={loading}
				onUpgrade={handleUpgradeToBrand}
			/>
		{:else}
			<!-- Brand Management Tabs -->
			<div class="bg-white rounded-xl shadow-sm">
				<div class="border-b">
					<div class="flex overflow-x-auto">
						<button
							onclick={() => activeTab = 'info'}
							class={cn(
								"px-6 py-4 font-medium transition-colors relative whitespace-nowrap",
								activeTab === 'info' 
									? "text-primary border-b-2 border-primary" 
									: "text-gray-500 hover:text-gray-700"
							)}
						>
							Brand Info
						</button>
						<button
							onclick={() => activeTab = 'verification'}
							class={cn(
								"px-6 py-4 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap",
								activeTab === 'verification' 
									? "text-primary border-b-2 border-primary" 
									: "text-gray-500 hover:text-gray-700"
							)}
						>
							Verification
							{#if isVerified}
								<Check class="w-4 h-4 text-green-600" />
							{:else if verificationRequest}
								<Clock class="w-4 h-4 text-yellow-600" />
							{/if}
						</button>
						<button
							onclick={() => activeTab = 'social'}
							class={cn(
								"px-6 py-4 font-medium transition-colors relative whitespace-nowrap",
								activeTab === 'social' 
									? "text-primary border-b-2 border-primary" 
									: "text-gray-500 hover:text-gray-700"
							)}
						>
							Social Media
						</button>
						<button
							onclick={() => activeTab = 'payment'}
							class={cn(
								"px-6 py-4 font-medium transition-colors relative whitespace-nowrap",
								activeTab === 'payment' 
									? "text-primary border-b-2 border-primary" 
									: "text-gray-500 hover:text-gray-700"
							)}
						>
							Payment
						</button>
						<button
							onclick={() => activeTab = 'danger'}
							class={cn(
								"px-6 py-4 font-medium transition-colors relative whitespace-nowrap",
								activeTab === 'danger' 
									? "text-red-600 border-b-2 border-red-600" 
									: "text-gray-500 hover:text-red-600"
							)}
						>
							Danger Zone
						</button>
					</div>
				</div>
				
				<div class="p-8">
					{#if activeTab === 'info'}
						<BrandInfoTab
							bind:brandName
							bind:brandDescription
							bind:brandStory
							bind:brandCategory
							bind:brandWebsite
							bind:brandEstablishedDate
							loading={loading}
							onUpdate={async (data) => {
								brandName = data.brandName;
								brandDescription = data.brandDescription;
								brandStory = data.brandStory;
								brandCategory = data.brandCategory;
								brandWebsite = data.brandWebsite;
								brandEstablishedDate = data.brandEstablishedDate;
								await handleUpdateBrandInfo();
							}}
						/>
					{:else if activeTab === 'verification'}
						<VerificationTab
							isVerified={isVerified}
							verificationRequest={verificationRequest}
							bind:businessRegistrationNumber
							bind:taxId
							bind:verificationDocuments
							loading={loading}
							onSubmitVerification={handleSubmitVerification}
							onFileSelect={handleFileSelect}
						/>
					{:else if activeTab === 'social'}
						<SocialLinksTab
							bind:brandInstagram
							bind:brandFacebook
							bind:brandTwitter
							bind:brandYoutube
							bind:brandTiktok
							loading={loading}
							onUpdate={handleUpdateBrandInfo}
						/>
					{:else if activeTab === 'payment'}
						<PaymentSettingsTab
							loading={loading}
						/>
					{:else if activeTab === 'danger'}
						<DangerZoneTab
							loading={loading}
							brandName={brandName}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>