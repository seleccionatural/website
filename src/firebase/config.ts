// Supabase configuration and initialization
import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get app ID for data organization
export const appId = 'seleccio-natural';

// Export for compatibility with existing code
export const db = supabase;
export const storage = supabase.storage;

export default supabase;