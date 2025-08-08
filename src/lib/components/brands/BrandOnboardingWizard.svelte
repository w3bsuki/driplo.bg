<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import BrandBasicInfo from './BrandBasicInfo.svelte';
	import BrandMedia from './BrandMedia.svelte';
	import BrandStory from './BrandStory.svelte';
	import BrandContact from './BrandContact.svelte';
	import BrandVerification from './BrandVerification.svelte';
	import WizardLayout from './onboarding/WizardLayout.svelte';
	import WizardHeader from './onboarding/WizardHeader.svelte';
	import WizardNavigation from './onboarding/WizardNavigation.svelte';
	import { createBrandFormState, canProceedToStep, generateBrandSlug, type BrandFormState } from './onboarding/wizardState.svelte';
	import { uploadImage, handleLogoChange, handleCoverChange } from './onboarding/uploadUtils';

	interface Props {
		supabase: any;
		profile: any;
		existingBrandProfile?: any;
	}

	let { supabase, profile, existingBrandProfile }: Props = $props();

	// Form state and wizard control
	let loading = $state(false);
	let currentStep = $state(1);
	const totalSteps = 6;
	
	// Create form state using extracted utility
	const formState: BrandFormState = createBrandFormState(existingBrandProfile);

	// Wrapper functions for file handling
	function onLogoChange(event: Event) {
		handleLogoChange(event, formState);
	}

	function onCoverChange(event: Event) {
		handleCoverChange(event, formState);
	}

	// Check if current step can proceed
	function canProceed(): boolean {
		return canProceedToStep(currentStep, formState);
	}

	async function handleComplete() {
		loading = true;
		
		try {
			// Upload images if new ones selected
			let logoUrl = formState.brandLogoPreview;
			let coverUrl = formState.brandCoverPreview;
			
			if (formState.brandLogoFile) {
				formState.uploadingLogo = true;
				const uploadedUrl = await uploadImage(formState.brandLogoFile, 'logo', profile.id, supabase);
				if (uploadedUrl) logoUrl = uploadedUrl;
				formState.uploadingLogo = false;
			}
			
			if (formState.brandCoverFile) {
				formState.uploadingCover = true;
				const uploadedUrl = await uploadImage(formState.brandCoverFile, 'cover', profile.id, supabase);
				if (uploadedUrl) coverUrl = uploadedUrl;
				formState.uploadingCover = false;
			}
			
			// Update profile to brand account
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					account_type: 'brand',
					brand_name: formState.brandName,
					brand_description: formState.brandDescription,
					brand_category: formState.brandCategory,
					brand_story: formState.brandStory,
					brand_logo_url: logoUrl,
					brand_cover_url: coverUrl,
					brand_onboarding_completed: true
				})
				.eq('id', profile.id);
			
			if (profileError) throw profileError;
			
			// Generate brand slug
			const brandSlug = await generateBrandSlug(formState.brandName, supabase);
			
			// Create or update brand profile
			const brandProfileData = {
				user_id: profile.id,
				brand_name: formState.brandName,
				brand_slug: brandSlug,
				brand_description: formState.brandDescription,
				brand_category: formState.brandCategory,
				brand_story: formState.brandStory,
				brand_values: formState.brandValues,
				brand_mission: formState.brandMission,
				brand_logo_url: logoUrl,
				brand_cover_url: coverUrl,
				website_url: formState.brandWebsite || null,
				instagram_url: formState.brandInstagram || null,
				facebook_url: formState.brandFacebook || null,
				twitter_url: formState.brandTwitter || null,
				youtube_url: formState.brandYoutube || null,
				tiktok_url: formState.brandTiktok || null
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

<WizardLayout>
	<WizardHeader {currentStep} {totalSteps} />
	
	<!-- Form Content -->
	<div class="bg-white rounded-2xl shadow-xl p-8">
		{#if currentStep === 1}
			<BrandBasicInfo 
				bind:brandName={formState.brandName} 
				bind:brandCategory={formState.brandCategory} 
				bind:brandDescription={formState.brandDescription} 
			/>
			
		{:else if currentStep === 2}
			<BrandMedia 
				type="logo" 
				preview={formState.brandLogoPreview} 
				uploading={formState.uploadingLogo} 
				onFileChange={onLogoChange} 
			/>
			
		{:else if currentStep === 3}
			<BrandStory 
				bind:brandStory={formState.brandStory} 
				bind:brandValues={formState.brandValues} 
				bind:brandMission={formState.brandMission} 
			/>
			
		{:else if currentStep === 4}
			<BrandMedia 
				type="cover" 
				preview={formState.brandCoverPreview} 
				uploading={formState.uploadingCover} 
				onFileChange={onCoverChange} 
			/>
			
		{:else if currentStep === 5}
			<BrandContact 
				bind:brandWebsite={formState.brandWebsite}
				bind:brandInstagram={formState.brandInstagram}
				bind:brandFacebook={formState.brandFacebook}
				bind:brandTwitter={formState.brandTwitter}
				bind:brandYoutube={formState.brandYoutube}
				bind:brandTiktok={formState.brandTiktok}
			/>
			
		{:else if currentStep === 6}
			<BrandVerification 
				brandName={formState.brandName}
				brandCategory={formState.brandCategory}
				brandDescription={formState.brandDescription}
				brandStory={formState.brandStory}
				brandLogoPreview={formState.brandLogoPreview}
				brandWebsite={formState.brandWebsite}
				brandInstagram={formState.brandInstagram}
				brandFacebook={formState.brandFacebook}
				brandTwitter={formState.brandTwitter}
				brandYoutube={formState.brandYoutube}
				brandTiktok={formState.brandTiktok}
			/>
		{/if}
		
		<WizardNavigation
			{currentStep}
			{totalSteps}
			canProceed={canProceed()}
			{loading}
			onPrevious={handlePrevStep}
			onNext={handleNextStep}
			onComplete={handleComplete}
		/>
	</div>
</WizardLayout>