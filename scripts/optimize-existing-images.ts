#!/usr/bin/env node
/**
 * Script to optimize existing images in Supabase storage
 * This will create WebP versions with multiple sizes for all existing images
 * Run with: npx tsx scripts/optimize-existing-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { ImageOptimizer } from '../src/lib/server/image-optimizer';
import sharp from 'sharp';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BATCH_SIZE = 10; // Process 10 images at a time

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('Missing required environment variables');
	process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

const optimizer = new ImageOptimizer(supabase);

async function downloadImage(url: string): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download image: ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

async function processImage(
	bucket: string,
	path: string,
	type: 'avatar' | 'cover' | 'listing' | 'general'
): Promise<boolean> {
	try {
		console.log(`Processing ${bucket}/${path}...`);

		// Check if already optimized (has -medium.webp version)
		const baseName = path.split('/').pop()?.split('.')[0];
		if (baseName?.includes('-medium') || baseName?.includes('-thumb')) {
			console.log(`Skipping ${path} - already optimized`);
			return true;
		}

		// Download original image
		const { data: urlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(path);

		const buffer = await downloadImage(urlData.publicUrl);

		// Create File object from buffer
		const file = new File([buffer], path.split('/').pop() || 'image.jpg', {
			type: 'image/jpeg'
		});

		// Optimize the image
		const optimizedImages = await optimizer.optimizeImage(file, type);

		// Upload optimized versions
		const basePath = path.substring(0, path.lastIndexOf('/'));
		const { urls, mainUrl } = await optimizer.uploadOptimizedImages(
			optimizedImages,
			bucket,
			basePath
		);

		console.log(`✓ Optimized ${path} - created ${Object.keys(urls).length} versions`);

		// Update database records if needed
		await updateDatabaseRecords(bucket, path, urls, mainUrl);

		return true;
	} catch (error) {
		console.error(`✗ Failed to process ${path}:`, error);
		return false;
	}
}

async function updateDatabaseRecords(
	bucket: string,
	originalPath: string,
	urls: Record<string, string>,
	mainUrl: string
) {
	const { data: urlData } = supabase.storage
		.from(bucket)
		.getPublicUrl(originalPath);

	const originalUrl = urlData.publicUrl;

	// Update profiles table for avatars and covers
	if (bucket === 'images' && (originalPath.includes('avatars') || originalPath.includes('covers'))) {
		const isAvatar = originalPath.includes('avatars');
		const field = isAvatar ? 'avatar_url' : 'cover_url';
		const urlsField = isAvatar ? 'avatar_urls' : 'cover_urls';

		const { error } = await supabase
			.from('profiles')
			.update({
				[field]: mainUrl,
				[urlsField]: urls
			})
			.eq(field, originalUrl);

		if (error) {
			console.error(`Failed to update profile for ${originalPath}:`, error);
		}
	}

	// Update listings table
	if (bucket === 'images' && originalPath.includes('listings')) {
		// Find listings with this image
		const { data: listings, error: fetchError } = await supabase
			.from('listings')
			.select('id, images')
			.or(`images.cs.{${originalUrl}}`);

		if (fetchError) {
			console.error(`Failed to fetch listings for ${originalPath}:`, fetchError);
			return;
		}

		// Update each listing
		for (const listing of listings || []) {
			const updatedImages = listing.images.map((img: any) => {
				if (typeof img === 'string' && img === originalUrl) {
					return {
						url: mainUrl,
						urls: urls
					};
				}
				return img;
			});

			const { error: updateError } = await supabase
				.from('listings')
				.update({
					images: updatedImages,
					image_urls: urls
				})
				.eq('id', listing.id);

			if (updateError) {
				console.error(`Failed to update listing ${listing.id}:`, updateError);
			}
		}
	}
}

async function processBucket(bucketName: string) {
	console.log(`\nProcessing bucket: ${bucketName}`);

	let offset = 0;
	let hasMore = true;
	let processedCount = 0;
	let failedCount = 0;

	while (hasMore) {
		// List files in bucket
		const { data: files, error } = await supabase.storage
			.from(bucketName)
			.list('', {
				limit: 100,
				offset
			});

		if (error) {
			console.error(`Failed to list files in ${bucketName}:`, error);
			break;
		}

		if (!files || files.length === 0) {
			hasMore = false;
			break;
		}

		// Process files in batches
		for (let i = 0; i < files.length; i += BATCH_SIZE) {
			const batch = files.slice(i, i + BATCH_SIZE);
			
			const results = await Promise.all(
				batch.map(file => {
					// Determine type based on path
					let type: 'avatar' | 'cover' | 'listing' | 'general' = 'general';
					if (file.name.includes('avatar')) type = 'avatar';
					else if (file.name.includes('cover')) type = 'cover';
					else if (file.name.includes('listing')) type = 'listing';

					return processImage(bucketName, file.name, type);
				})
			);

			processedCount += results.filter(r => r).length;
			failedCount += results.filter(r => !r).length;
		}

		offset += files.length;
		
		// If we got less than the limit, we've reached the end
		if (files.length < 100) {
			hasMore = false;
		}
	}

	console.log(`\nBucket ${bucketName} complete:`);
	console.log(`✓ Processed: ${processedCount}`);
	console.log(`✗ Failed: ${failedCount}`);
}

async function main() {
	console.log('Starting image optimization...');
	console.log(`Supabase URL: ${SUPABASE_URL}`);

	// Process the main images bucket
	await processBucket('images');

	// If you have separate buckets, process them too
	// await processBucket('avatars');
	// await processBucket('covers');
	// await processBucket('listings');

	console.log('\nOptimization complete!');
}

// Run the script
main().catch(console.error);