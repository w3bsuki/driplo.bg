import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:5173');