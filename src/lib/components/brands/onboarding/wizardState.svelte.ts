// Wizard state management and validation utilities

export interface BrandFormState {
	// Step 1: Brand Basics
	brandName: string;
	brandCategory: string;
	brandDescription: string;
	
	// Step 2: Brand Logo
	brandLogoFile: File | null;
	brandLogoPreview: string;
	uploadingLogo: boolean;
	
	// Step 3: Brand Story
	brandStory: string;
	brandValues: string;
	brandMission: string;
	
	// Step 4: Cover Image
	brandCoverFile: File | null;
	brandCoverPreview: string;
	uploadingCover: boolean;
	
	// Step 5: Social Media
	brandWebsite: string;
	brandInstagram: string;
	brandFacebook: string;
	brandTwitter: string;
	brandYoutube: string;
	brandTiktok: string;
}

export function createBrandFormState(existingBrandProfile?: any): BrandFormState {
	return {
		// Step 1: Brand Basics
		brandName: existingBrandProfile?.brand_name || '',
		brandCategory: existingBrandProfile?.brand_category || '',
		brandDescription: existingBrandProfile?.brand_description || '',
		
		// Step 2: Brand Logo
		brandLogoFile: null,
		brandLogoPreview: existingBrandProfile?.brand_logo_url || '',
		uploadingLogo: false,
		
		// Step 3: Brand Story
		brandStory: existingBrandProfile?.brand_story || '',
		brandValues: existingBrandProfile?.brand_values || '',
		brandMission: existingBrandProfile?.brand_mission || '',
		
		// Step 4: Cover Image
		brandCoverFile: null,
		brandCoverPreview: existingBrandProfile?.brand_cover_url || '',
		uploadingCover: false,
		
		// Step 5: Social Media
		brandWebsite: existingBrandProfile?.website_url || '',
		brandInstagram: existingBrandProfile?.instagram_url || '',
		brandFacebook: existingBrandProfile?.facebook_url || '',
		brandTwitter: existingBrandProfile?.twitter_url || '',
		brandYoutube: existingBrandProfile?.youtube_url || '',
		brandTiktok: existingBrandProfile?.tiktok_url || ''
	};
}

export function canProceedToStep(step: number, formState: BrandFormState): boolean {
	switch (step) {
		case 1:
			return formState.brandName.trim() !== '' && 
			       formState.brandCategory !== '' && 
			       formState.brandDescription.trim() !== '';
		case 2:
			return true; // Logo is optional
		case 3:
			return formState.brandStory.trim() !== ''; // Story is required, values and mission are optional
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

export async function generateBrandSlug(name: string, supabase: any): Promise<string> {
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