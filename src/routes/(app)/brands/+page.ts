import type { PageLoad } from './$types';
import { logger } from '$lib/utils/logger';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	
	return {
		streamed: {
			brands: supabase
				.rpc('get_top_brands', { limit_count: 50 })
				.then(({ data, error }) => {
					if (error) {
						logger.error('Error loading brands:', error);
						return [];
					}
					return data || [];
				})
		}
	};
};