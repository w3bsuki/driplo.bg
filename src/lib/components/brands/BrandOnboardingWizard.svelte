<script lang="ts">
	import { ArrowLeft, ArrowRight, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import WizardProgress from './WizardProgress.svelte';
	import BrandBasicInfo from './BrandBasicInfo.svelte';
	import BrandMedia from './BrandMedia.svelte';
	import BrandStory from './BrandStory.svelte';
	import BrandContact from './BrandContact.svelte';
	import BrandVerification from './BrandVerification.svelte';
	
	interface Props {
		supabase: any;
		profile: any;
		existingBrandProfile?: any;
	}
	
	let { supabase, profile, existingBrandProfile }: Props = $props();
	
	// Form state
	let loading = $state(false);
	let currentStep = $state(1);
	const totalSteps = 6;
	
	// Step 1: Brand Basics
	let brandName = $state(existingBrandProfile?.brand_name || '');
	let brandCategory = $state(existingBrandProfile?.brand_category || '');
	let brandDescription = $state(existingBrandProfile?.brand_description || '');
	
	// Step 2: Brand Logo
	let brandLogoFile = $state<File | null>(null);
	let brandLogoPreview = $state(existingBrandProfile?.brand_logo_url || '');
	let uploadingLogo = $state(false);
	
	// Step 3: Brand Story
	let brandStory = $state(existingBrandProfile?.brand_story || '');
	let brandValues = $state(existingBrandProfile?.brand_values || '');
	let brandMission = $state(existingBrandProfile?.brand_mission || '');
	
	// Step 4: Cover Image
	let brandCoverFile = $state<File | null>(null);
	let brandCoverPreview = $state(existingBrandProfile?.brand_cover_url || '');
	let uploadingCover = $state(false);
	
	// Step 5: Social Media
	let brandWebsite = $state(existingBrandProfile?.website_url || '');
	let brandInstagram = $state(existingBrandProfile?.instagram_url || '');
	let brandFacebook = $state(existingBrandProfile?.facebook_url || '');
	let brandTwitter = $state(existingBrandProfile?.twitter_url || '');
	let brandYoutube = $state(existingBrandProfile?.youtube_url || '');
	let brandTiktok = $state(existingBrandProfile?.tiktok_url || '');
	
	
	async function handleLogoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		
		const file = input.files[0];
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Logo must be less than 5MB');
			return;
		}
		
		brandLogoFile = file;
		
		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			brandLogoPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}
	
	async function handleCoverChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		
		const file = input.files[0];
		if (file.size > 10 * 1024 * 1024) {
			toast.error('Cover image must be less than 10MB');
			return;
		}
		
		brandCoverFile = file;
		
		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			brandCoverPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}
	
	async function uploadImage(file: File, type: 'logo' | 'cover'): Promise<string | null> {
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${profile.id}/${type}_${Date.now()}.${fileExt}`;
			
			const { data, error } = await supabase.storage
				.from('brand-assets')
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: true
				});
			
			if (error) throw error;
			
			const { data: { publicUrl } } = supabase.storage
				.from('brand-assets')
				.getPublicUrl(fileName);
			
			return publicUrl;
		} catch (error: any) {
			toast.error(`Failed to upload ${type}`);
			return null;
		}
	}
	
	function canProceed(): boolean {
		switch (currentStep) {
			case 1:
				return brandName.trim() !== '' && brandCategory !== '' && brandDescription.trim() !== '';
			case 2:
				return true; // Logo is optional
			case 3:
				return brandStory.trim() !== ''; // Story is required, values and mission are optional
			case 4:
				return true; // Cover is optional
			case 5:
				return true; // Social media is optional
			case 6:
				return true; // Review step
			default:
				return false;
		}
	}
	
	async function generateBrandSlug(name: string): Promise<string> {
		const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
	
	async function handleComplete() {
		loading = true;
		
		try {
			// Upload images if new ones selected
			let logoUrl = brandLogoPreview;
			let coverUrl = brandCoverPreview;
			
			if (brandLogoFile) {
				uploadingLogo = true;
				const uploadedUrl = await uploadImage(brandLogoFile, 'logo');
				if (uploadedUrl) logoUrl = uploadedUrl;
				uploadingLogo = false;
			}
			
			if (brandCoverFile) {
				uploadingCover = true;
				const uploadedUrl = await uploadImage(brandCoverFile, 'cover');
				if (uploadedUrl) coverUrl = uploadedUrl;
				uploadingCover = false;
			}
			
			// Update profile to brand account
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					account_type: 'brand',
					brand_name: brandName,
					brand_description: brandDescription,
					brand_category: brandCategory,
					brand_story: brandStory,
					brand_logo_url: logoUrl,
					brand_cover_url: coverUrl,
					brand_onboarding_completed: true
				})
				.eq('id', profile.id);
			
			if (profileError) throw profileError;
			
			// Generate brand slug
			const brandSlug = await generateBrandSlug(brandName);
			
			// Create or update brand profile
			const brandProfileData = {
				user_id: profile.id,
				brand_name: brandName,
				brand_slug: brandSlug,
				brand_description: brandDescription,
				brand_category: brandCategory,
				brand_story: brandStory,
				brand_values: brandValues,
				brand_mission: brandMission,
				brand_logo_url: logoUrl,
				brand_cover_url: coverUrl,
				website_url: brandWebsite || null,
				instagram_url: brandInstagram || null,
				facebook_url: brandFacebook || null,
				twitter_url: brandTwitter || null,
				youtube_url: brandYoutube || null,
				tiktok_url: brandTiktok || null
			};
			
			if (existingBrandProfile) {
				// Update existing
				const { error } = await supabase
					.from('brand_profiles')
					.update(brandProfileData)
					.eq('id', existingBrandProfile.id);
				
				if (error) throw error;
			} else {
				// Create new
				const { error } = await supabase
					.from('brand_profiles')
					.insert(brandProfileData);
				
				if (error) throw error;
			}
			
			toast.success('Brand profile created successfully!');
			
			// Redirect to brand welcome page
			goto(`/brands/welcome?slug=${brandSlug}`);
			
		} catch (error: any) {
			toast.error(error.message || 'Failed to create brand profile');
		} finally {
			loading = false;
		}
	}
	
	function handleNextStep() {
		if (canProceed() && currentStep < totalSteps) {
			currentStep++;
		}
	}
	
	function handlePrevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-3">
				Turn Your Account into a Brand
			</h1>
			<p class="text-lg text-gray-600">
				Let's set up your professional brand presence on Driplo
			</p>
		</div>
		
		<!-- Progress Bar -->
		<WizardProgress {currentStep} {totalSteps} />
		
		<!-- Form Content -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if currentStep === 1}
				<BrandBasicInfo bind:brandName bind:brandCategory bind:brandDescription />
				
			{:else if currentStep === 2}
				<BrandMedia type="logo" preview={brandLogoPreview} uploading={uploadingLogo} onFileChange={handleLogoChange} />
				
			{:else if currentStep === 3}
				<BrandStory bind:brandStory bind:brandValues bind:brandMission />
				
			{:else if currentStep === 4}
				<BrandMedia type="cover" preview={brandCoverPreview} uploading={uploadingCover} onFileChange={handleCoverChange} />
				
			{:else if currentStep === 5}
				<BrandContact 
					bind:brandWebsite 
					bind:brandInstagram 
					bind:brandFacebook 
					bind:brandTwitter 
					bind:brandYoutube 
					bind:brandTiktok 
				/>
				
			{:else if currentStep === 6}
				<BrandVerification 
					{brandName}
					{brandCategory}
					{brandDescription}
					{brandStory}
					{brandLogoPreview}
					{brandWebsite}
					{brandInstagram}
					{brandFacebook}
					{brandTwitter}
					{brandYoutube}
					{brandTiktok}
				/>
			{/if}
			
			<!-- Navigation Buttons -->
			<div class="flex justify-between mt-8">
				<button
					onclick={handlePrevStep}
					disabled={currentStep === 1}
					class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					<ArrowLeft class="w-5 h-5" />
					Previous
				</button>
				
				{#if currentStep < totalSteps}
					<button
						onclick={handleNextStep}
						disabled={!canProceed()}
						class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						Next
						<ArrowRight class="w-5 h-5" />
					</button>
				{:else}
					<button
						onclick={handleComplete}
						disabled={loading || !canProceed()}
						class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{#if loading}
							<Spinner size="sm" color="white" />
							Creating Brand...
						{:else}
							<Check class="w-5 h-5" />
							Create Brand Profile
						{/if}
					</button>
				{/if}
			</div>
		</div>
		
		<!-- Skip for Now -->
		<div class="text-center mt-6">
			<a href="/" class="text-gray-500 hover:text-gray-700 text-sm">
				Skip for now
			</a>
		</div>
	</div>
</div>