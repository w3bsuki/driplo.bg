import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const supabase = locals.supabase;
  
  // Get query parameters
  const timePeriod = url.searchParams.get('period') || 'month';
  const limit = parseInt(url.searchParams.get('limit') || '12');
  
  // Validate parameters
  const validPeriods = ['week', 'month', 'year', 'all'];
  if (!validPeriods.includes(timePeriod)) {
    return json(
      { error: 'Invalid time period. Must be one of: week, month, year, all' },
      { status: 400 }
    );
  }
  
  if (limit < 1 || limit > 50) {
    return json(
      { error: 'Limit must be between 1 and 50' },
      { status: 400 }
    );
  }
  
  try {
    // Call the database function
    const { data, error } = await supabase
      .rpc('get_top_sellers', { 
        time_period: timePeriod,
        result_limit: limit 
      });
    
    if (error) {
      console.error('Error fetching top sellers:', error);
      return json(
        { error: 'Failed to fetch top sellers' },
        { status: 500 }
      );
    }
    
    return json({
      sellers: data || [],
      period: timePeriod,
      limit
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
};