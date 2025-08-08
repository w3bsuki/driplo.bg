import { describe, it, expect, vi } from 'vitest';
import { setCacheHeaders, cachePresets } from './cache-headers';

describe('setCacheHeaders', () => {
  const mockSetHeaders = vi.fn();
  const mockEvent = { setHeaders: mockSetHeaders } as any;

  beforeEach(() => {
    mockSetHeaders.mockClear();
  });

  it('should set no-store when noStore is true', () => {
    setCacheHeaders(mockEvent, { noStore: true });
    expect(mockSetHeaders).toHaveBeenCalledWith({
      'cache-control': 'no-store'
    });
  });

  it('should set custom cache control when provided', () => {
    setCacheHeaders(mockEvent, { custom: 'public, max-age=3600' });
    expect(mockSetHeaders).toHaveBeenCalledWith({
      'cache-control': 'public, max-age=3600'
    });
  });

  it('should build cache control from config options', () => {
    setCacheHeaders(mockEvent, {
      maxAge: 300,
      sMaxAge: 3600,
      mustRevalidate: true,
      private: false
    });
    
    expect(mockSetHeaders).toHaveBeenCalledWith({
      'cache-control': 'public, max-age=300, s-maxage=3600, must-revalidate'
    });
  });

  it('should handle private cache', () => {
    setCacheHeaders(mockEvent, {
      private: true,
      maxAge: 60
    });
    
    expect(mockSetHeaders).toHaveBeenCalledWith({
      'cache-control': 'private, max-age=60'
    });
  });
});

describe('cachePresets', () => {
  it('should have correct preset configurations', () => {
    expect(cachePresets.noCache).toEqual({ noStore: true });
    expect(cachePresets.static.maxAge).toBe(31536000);
    expect(cachePresets.api.maxAge).toBe(0);
    expect(cachePresets.browse.maxAge).toBe(300);
    expect(cachePresets.product.maxAge).toBe(600);
  });

  it('should have stale-while-revalidate preset', () => {
    expect(cachePresets.apiStale.custom).toBe('public, max-age=60, stale-while-revalidate=300');
  });
});