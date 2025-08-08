import type { Database } from '../database.types';

export type Category = Database['public']['Tables']['categories']['Row'];

export type Product = Database['public']['Tables']['listings']['Row'];