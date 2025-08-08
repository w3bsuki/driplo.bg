import type { Tables } from '$lib/database.types';

// Brand verification request interface
export interface BrandVerificationRequest {
	id: string;
	user_id: string;
	brand_name: string;
	business_name?: string;
	business_email?: string;
	business_phone?: string;
	business_address?: {
		street?: string;
		city?: string;
		state?: string;
		postal_code?: string;
		country?: string;
	};
	tax_id?: string;
	vat_number?: string;
	website?: string;
	description?: string;
	established_year?: number;
	company_size?: string;
	documents?: string[];
	verification_status: 'pending' | 'approved' | 'rejected' | 'requires_review';
	rejection_reason?: string;
	reviewed_at?: string;
	reviewed_by?: string;
	admin_notes?: string;
	created_at: string;
	updated_at: string;
}

// Social media account interface
export interface SocialMediaAccount {
	id: string;
	user_id: string;
	platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'youtube' | 'linkedin' | 'pinterest';
	username: string;
	url?: string;
	follower_count?: number;
	is_verified?: boolean;
	metadata?: Record<string, unknown>;
	created_at: string;
	updated_at: string;
}

// Admin approval interface
export interface AdminApproval {
	id: string;
	admin_id: string;
	target_type: string;
	target_id: string;
	action: 'approve' | 'reject';
	reason?: string;
	notes?: string;
	created_at: string;
}

// Brand verification page data
export interface BrandVerificationPageData {
	request: BrandVerificationRequest;
	profile: Tables<'profiles'>;
	socialAccounts: SocialMediaAccount[];
	approvals: AdminApproval[];
}