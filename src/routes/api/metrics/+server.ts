import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/utils/logger';

interface WebVitalMetric {
	name: string;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	delta: number;
	id: string;
	metadata: {
		url: string;
		timestamp: string;
		connection?: NavigatorConnection;
	};
}

// Store web vitals and analytics data
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { metrics } = await request.json() as { metrics: WebVitalMetric[] };
		
		if (!metrics || metrics.length === 0) {
			return json({ success: true, message: 'No metrics to process' });
		}

		// Log metrics in development for debugging
		if (import.meta.env.DEV) {
			logger.info('Web vitals metrics received', { 
				count: metrics.length,
				metrics: metrics.map(m => ({ name: m.name, value: m.value, rating: m.rating }))
			});
		}
		
		// Store metrics in Supabase for analytics
		try {
			const supabase = createSupabaseServerClient(cookies);
			
			// Get user ID if authenticated (optional)
			const { data: { user } } = await supabase.auth.getUser();
			
			// Prepare metrics for database insertion
			const metricsToInsert = metrics.map(m => ({
				name: m.name,
				value: m.value,
				rating: m.rating,
				delta: m.delta,
				metric_id: m.id,
				url: m.metadata.url,
				user_id: user?.id || null,
				timestamp: m.metadata.timestamp,
				connection_info: m.metadata.connection ? JSON.stringify(m.metadata.connection) : null,
				created_at: new Date().toISOString()
			}));

			// Insert metrics into web_vitals table
			const { error: insertError } = await supabase
				.from('web_vitals')
				.insert(metricsToInsert);

			if (insertError) {
				// Log error but don't fail the request - analytics shouldn't break user experience
				logger.error('Failed to store web vitals in database', { 
					error: insertError.message,
					metricsCount: metrics.length
				});
			} else {
				logger.info('Web vitals stored successfully', { 
					count: metricsToInsert.length,
					userId: user?.id
				});
			}
		} catch (dbError) {
			// Log error but don't fail - metrics collection is not critical
			logger.error('Database error storing web vitals', { 
				error: dbError instanceof Error ? dbError.message : 'Unknown error',
				metricsCount: metrics.length
			});
		}
		
		// Send to external analytics services in production
		if (import.meta.env.PROD) {
			// Send to multiple analytics services in parallel
			const analyticsPromises = [];
			
			// Example: Send to Vercel Analytics
			if (process.env['VERCEL_ANALYTICS_ID']) {
				analyticsPromises.push(
					fetch('https://vitals.vercel-insights.com/v1/vitals', {
						method: 'POST',
						headers: { 
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${process.env['VERCEL_ANALYTICS_TOKEN']}`
						},
						body: JSON.stringify({ metrics })
					}).catch(error => {
						logger.error('Failed to send metrics to Vercel Analytics', { error: error.message });
					})
				);
			}
			
			// Example: Send to Google Analytics 4 via Measurement Protocol
			if (process.env['GA4_MEASUREMENT_ID'] && process.env['GA4_API_SECRET']) {
				const ga4Events = metrics.map(metric => ({
					name: 'web_vital',
					params: {
						metric_name: metric.name,
						metric_value: metric.value,
						metric_rating: metric.rating,
						page_location: metric.metadata.url
					}
				}));

				analyticsPromises.push(
					fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env['GA4_MEASUREMENT_ID']}&api_secret=${process.env['GA4_API_SECRET']}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							client_id: crypto.randomUUID(),
							events: ga4Events
						})
					}).catch(error => {
						logger.error('Failed to send metrics to Google Analytics', { error: error.message });
					})
				);
			}
			
			// Wait for all analytics calls to complete (but don't block the response)
			Promise.all(analyticsPromises).then(() => {
				logger.info('Metrics sent to external analytics services', { count: metrics.length });
			});
		}
		
		return json({ 
			success: true, 
			processed: metrics.length,
			message: 'Metrics processed successfully'
		});
		
	} catch (error) {
		logger.error('Error processing web vitals metrics', { 
			error: error instanceof Error ? error.message : 'Unknown error'
		});
		
		// Return success even on error - we don't want to break user experience
		// But log the error for monitoring
		return json({ 
			success: true, 
			error: 'Metrics processing failed but request succeeded'
		});
	}
};