import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

// Mock dev environment
vi.mock('$app/environment', () => ({
  dev: true
}));

Object.assign(console, mockConsole);

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message', { key: 'value' });
    expect(mockConsole.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.stringContaining('Test message'),
      { key: 'value' }
    );
  });

  it('should log error messages with stack traces', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.stringContaining('Error occurred'),
      expect.objectContaining({
        message: 'Test error',
        stack: expect.any(String)
      })
    );
  });

  it('should log warnings', () => {
    logger.warn('Warning message');
    expect(mockConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      expect.stringContaining('Warning message')
    );
  });

  it('should log debug messages', () => {
    logger.debug('Debug info', { debug: true });
    expect(mockConsole.debug).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      expect.stringContaining('Debug info'),
      { debug: true }
    );
  });

  it('should handle performance logging', () => {
    const startTime = performance.now();
    logger.perf('Operation completed', startTime);
    
    expect(mockConsole.info).toHaveBeenCalledWith(
      expect.stringContaining('[PERF]'),
      expect.stringContaining('Operation completed'),
      expect.objectContaining({
        duration: expect.any(String)
      })
    );
  });

  it('should handle database queries', () => {
    logger.query('SELECT * FROM users', { userId: '123' });
    
    expect(mockConsole.debug).toHaveBeenCalledWith(
      expect.stringContaining('[QUERY]'),
      expect.stringContaining('SELECT * FROM users'),
      { userId: '123' }
    );
  });
});