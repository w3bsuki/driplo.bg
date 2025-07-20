import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// Standard API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Error response helper that never exposes stack traces
export function apiError(
  message: string,
  status: number = 500,
  details?: Record<string, any>
) {
  // Log the full error server-side for debugging
  console.error(`API Error [${status}]: ${message}`, details);
  
  // Never expose stack traces or sensitive details to client
  const response: ApiResponse = {
    error: message
  };
  
  // Only include safe details in development
  if (import.meta.env.DEV && details && !details.stack) {
    response.details = details;
  }
  
  return json(response, { status });
}

// Success response helper
export function apiSuccess<T>(data: T, status: number = 200) {
  const response: ApiResponse<T> = { data };
  return json(response, { status });
}

// Authentication check helper
export async function requireAuth(
  locals: RequestEvent['locals']
): Promise<{ userId: string; session: any } | null> {
  // First get the session (without validation)
  const { data: { session }, error: sessionError } = await locals.supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }
  
  // Now validate the JWT by calling getUser()
  const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
  
  if (userError || !user) {
    // JWT validation failed
    return null;
  }
  
  return {
    userId: user.id,
    session
  };
}

// Admin role check helper
export async function requireAdmin(
  locals: RequestEvent['locals']
): Promise<{ userId: string; session: any } | null> {
  const auth = await requireAuth(locals);
  if (!auth) return null;
  
  // Check if user has admin role
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.userId)
    .single();
  
  if (profile?.role !== 'admin') {
    return null;
  }
  
  return auth;
}

// Request validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRevtag(revtag: string): boolean {
  const revtagRegex = /^@[a-zA-Z0-9_]+$/;
  return revtagRegex.test(revtag);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Pagination helper
export function getPagination(url: URL, defaultLimit = 20) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || String(defaultLimit))));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Create paginated response
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total
    }
  };
}

// Safe database error handler
export function handleDatabaseError(error: any): never {
  console.error('Database error:', error);
  
  // Common Supabase/Postgres errors
  if (error.code === '23505') {
    throw apiError('This record already exists', 409);
  }
  if (error.code === '23503') {
    throw apiError('Referenced record not found', 400);
  }
  if (error.code === '22P02') {
    throw apiError('Invalid input format', 400);
  }
  
  // Generic database error
  throw apiError('Database operation failed', 500);
}

// Type-safe request body parser
export async function parseRequestBody<T>(
  request: Request,
  validator?: (data: any) => data is T
): Promise<T> {
  try {
    const body = await request.json();
    
    if (validator && !validator(body)) {
      throw apiError('Invalid request body', 400);
    }
    
    return body as T;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw apiError('Invalid JSON in request body', 400);
    }
    throw err;
  }
}

// Common validators
export const validators = {
  isNonEmptyString: (value: any): value is string => 
    typeof value === 'string' && value.trim().length > 0,
    
  isPositiveNumber: (value: any): value is number =>
    typeof value === 'number' && value > 0,
    
  isBoolean: (value: any): value is boolean =>
    typeof value === 'boolean',
    
  isArray: <T>(value: any, itemValidator?: (item: any) => item is T): value is T[] =>
    Array.isArray(value) && (!itemValidator || value.every(itemValidator)),
    
  isObject: (value: any): value is Record<string, any> =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
};

// Rate limiting helper (basic in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes