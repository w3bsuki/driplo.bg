import { json } from '@sveltejs/kit';
import { setCacheHeaders, cachePresets } from '$lib/utils/cache-headers';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
  // Health endpoints should never be cached
  setCacheHeaders({ setHeaders }, cachePresets.noCache);
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'driplo-api',
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
      unit: 'MB'
    }
  };

  return json(healthStatus);
};