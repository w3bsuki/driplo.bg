import { toast } from 'svelte-sonner';
import type { BrandFormState } from './wizardState.svelte';

export async function uploadImage(
	file: File, 
	type: 'logo' | 'cover', 
	profileId: string, 
	supabase: any
): Promise<string | null> {
	try {
		const fileExt = file.name.split('.').pop();
		const fileName = `${profileId}/${type}_${Date.now()}.${fileExt}`;
		
		const { error } = await supabase.storage
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

export function handleLogoChange(event: Event, formState: BrandFormState) {
	const input = event.target as HTMLInputElement;
	if (!input.files?.length) return;
	
	const file = input.files[0];
	if (!file) return;
	
	if (file.size > 5 * 1024 * 1024) {
		toast.error('Logo must be less than 5MB');
		return;
	}
	
	formState.brandLogoFile = file;
	
	// Create preview
	const reader = new FileReader();
	reader.onload = (e) => {
		formState.brandLogoPreview = e.target?.result as string;
	};
	reader.readAsDataURL(file);
}

export function handleCoverChange(event: Event, formState: BrandFormState) {
	const input = event.target as HTMLInputElement;
	if (!input.files?.length) return;
	
	const file = input.files[0];
	if (!file) return;
	
	if (file.size > 10 * 1024 * 1024) {
		toast.error('Cover image must be less than 10MB');
		return;
	}
	
	formState.brandCoverFile = file;
	
	// Create preview
	const reader = new FileReader();
	reader.onload = (e) => {
		formState.brandCoverPreview = e.target?.result as string;
	};
	reader.readAsDataURL(file);
}